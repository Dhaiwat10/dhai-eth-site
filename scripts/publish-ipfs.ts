import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { PinataSDK, UploadResponse } from 'pinata';
import * as Name from 'w3name';

async function ensureDistExists(distDir: string): Promise<void> {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output not found at ${distDir}. Run "bun run build" first.`);
  }
}

// Using the modern Pinata SDK which requires a JWT for uploads
// See: https://docs.pinata.cloud/files/uploading-files#folders
// We construct an array of File objects with relative paths to represent a folder upload.

async function listFilesRecursively(rootDir: string): Promise<Array<{ absPath: string; relPath: string }>> {
  const entries: Array<{ absPath: string; relPath: string }> = [];

  async function walk(currentDir: string, baseRel: string): Promise<void> {
    const dirents = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const dirent of dirents) {
      const absPath = path.join(currentDir, dirent.name);
      const relPath = path.join(baseRel, dirent.name);
      if (dirent.isDirectory()) {
        await walk(absPath, relPath);
      } else if (dirent.isFile()) {
        entries.push({ absPath, relPath });
      }
    }
  }

  await walk(rootDir, '');
  return entries;
}

function guessMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.json': return 'application/json';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

async function pinDirectoryWithPinata(distDir: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error('PINATA_JWT is required for folder uploads via Pinata SDK v2');
  }

  const pinata = new PinataSDK({ pinataJwt: jwt });
  const fileEntries = await listFilesRecursively(distDir);
  if (fileEntries.length === 0) {
    throw new Error(`No files found in ${distDir}`);
  }

  const files: File[] = [];
  for (const entry of fileEntries) {
    const buffer = await fs.promises.readFile(entry.absPath);
    files.push(new File([buffer], entry.relPath, { type: guessMimeType(entry.absPath) }));
  }

  const upload: UploadResponse = await pinata.upload.public.fileArray(files).name('dhai-eth-site');
  const cid = upload.cid;
  if (!cid) throw new Error('Pinata did not return a CID');
  return cid;
}

function decodeBase64ToUint8Array(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

function readSigningKeyBytes(): Uint8Array | null {
  const projectRoot = process.cwd();
  // const keyPathFromEnv = process.env.W3NAME_KEY_PATH;
  const candidatePath = path.join(projectRoot, 'signing-key.txt');

  if (!fs.existsSync(candidatePath)) return null;

  const raw = fs.readFileSync(candidatePath);
  const asText = raw.toString('utf8').trim();

  // Try raw bytes
  if (raw.length > 0) return new Uint8Array(raw);

  // Try PEM (-----BEGIN ... PRIVATE KEY-----)
  if (asText.includes('BEGIN') && asText.includes('PRIVATE KEY')) {
    const pemBody = asText
      .replace(/-----BEGIN[^-]+-----/g, '')
      .replace(/-----END[^-]+-----/g, '')
      .replace(/\s+/g, '');
    try {
      const b = Buffer.from(pemBody, 'base64');
      if (b.length > 0) return new Uint8Array(b);
    } catch { /* ignore */ }
  }

  // Try base64
  try {
    const b = Buffer.from(asText.replace(/\s+/g, ''), 'base64');
    if (b.length > 0) return new Uint8Array(b);
  } catch { /* ignore */ }

  // Try hex
  try {
    if (/^[0-9a-fA-F]+$/.test(asText) && asText.length % 2 === 0) {
      const b = Buffer.from(asText, 'hex');
      if (b.length > 0) return new Uint8Array(b);
    }
  } catch { /* ignore */ }

  // Try JSON array
  try {
    if (asText.startsWith('[')) {
      const arr = JSON.parse(asText) as number[];
      if (Array.isArray(arr)) return new Uint8Array(arr);
    }
  } catch { /* ignore */ }

  return null;
}

async function updateIpnsViaW3Name(cid: string): Promise<string> {
  const keyB64 = process.env.W3NAME_KEY_B64;

  // Build candidate key bytes from env/file in multiple formats and validate by attempting Name.from
  const candidates: Uint8Array[] = [];
  if (keyB64 && keyB64.trim().length > 0) {
    candidates.push(decodeBase64ToUint8Array(keyB64.trim()));
  }

  const fileBytes = readSigningKeyBytes();
  if (fileBytes && fileBytes.length > 0) {
    const asText = Buffer.from(fileBytes).toString('utf8').trim();

    // If it looks like an IPNS name (k51...) warn early
    if (/^k[0-9a-z]+$/i.test(asText) && asText.length > 10) {
      throw new Error('Found an IPNS name (k51...) in signing-key.txt. You must provide the private key bytes, not the name.');
    }

    // base64 (must be length % 4 == 0 and valid charset)
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(asText) && asText.length % 4 === 0) {
      try { candidates.push(new Uint8Array(Buffer.from(asText, 'base64'))); } catch { /* ignore */ }
    }

    // hex
    if (/^[0-9a-fA-F]+$/.test(asText) && asText.length % 2 === 0) {
      try { candidates.push(new Uint8Array(Buffer.from(asText, 'hex'))); } catch { /* ignore */ }
    }

    // json array
    if (asText.startsWith('[')) {
      try {
        const arr = JSON.parse(asText) as number[];
        if (Array.isArray(arr)) candidates.push(new Uint8Array(arr));
      } catch { /* ignore */ }
    }

    // raw bytes last
    candidates.push(fileBytes);
  }

  if (candidates.length === 0) {
    throw new Error('Missing IPNS signing key. Set W3NAME_KEY_B64 or provide signing-key.txt');
  }

  let name: Name.WritableName | null = null;
  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      name = await Name.from(candidate);
      if (name) break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!name) {
    throw new Error(`Could not decode IPNS signing key. Ensure it's the raw private key bytes (protobuf), base64/hex of those bytes, or a JSON array of bytes. Last error: ${String(lastError)}`);
  }

  const value = `/ipfs/${cid}`;
  let revision: Name.Revision;
  try {
    const current = await Name.resolve(name);
    revision = await Name.increment(current, value);
  } catch {
    revision = await Name.v0(name, value);
  }

  await Name.publish(revision, name.key);
  return name.toString();
}

async function main() {
  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, 'dist');
  await ensureDistExists(distDir);

  const cid = await pinDirectoryWithPinata(distDir);
  const ipns = await updateIpnsViaW3Name(cid);

  const out = [
    `CID=${cid}`,
    `IPNS=${ipns}`,
    `Gateway (CID): https://ipfs.io/ipfs/${cid}/`,
    `Gateway (IPNS): https://ipfs.io/ipns/${ipns}/`,
  ].join('\n');

  fs.writeFileSync(path.join(projectRoot, 'latest-ipfs.txt'), out + '\n', 'utf8');

  console.log('\nPublish complete');
  console.log(out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


