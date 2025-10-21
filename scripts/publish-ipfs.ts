import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import pinataSDK, { PinataPinOptions, PinataPinResponse } from '@pinata/sdk';
import * as Name from 'w3name';

async function ensureDistExists(distDir: string): Promise<void> {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output not found at ${distDir}. Run "bun run build" first.`);
  }
}

function getPinataClient() {
  const jwt = process.env.PINATA_JWT;
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;

  if (jwt) {
    return new pinataSDK({ pinataJWTKey: jwt });
  }

  if (apiKey && apiSecret) {
    return new pinataSDK({ pinataApiKey: apiKey, pinataSecretApiKey: apiSecret });
  }

  throw new Error(
    'Missing Pinata credentials. Set PINATA_JWT or PINATA_API_KEY and PINATA_API_SECRET.'
  );
}

async function pinDirectoryWithPinata(distDir: string): Promise<string> {
  const pinata = getPinataClient();
  await pinata.testAuthentication();

  const options: PinataPinOptions = {
    pinataMetadata: {
      name: 'test-ipfs-site'
    }
  };

  const result: PinataPinResponse = await pinata.pinFromFS(distDir, options);

  const cid = result.IpfsHash;
  if (!cid) throw new Error('Pinata did not return a CID');
  return cid;
}

function decodeBase64ToUint8Array(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

async function updateIpnsViaW3Name(cid: string): Promise<string> {
  const keyB64 = process.env.W3NAME_KEY_B64;
  if (!keyB64) {
    throw new Error('W3NAME_KEY_B64 is required to update IPNS via w3name');
  }

  const keyBytes = decodeBase64ToUint8Array(keyB64);
  const name = await Name.from(keyBytes);

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


