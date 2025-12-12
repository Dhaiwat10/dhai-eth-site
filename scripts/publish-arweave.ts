import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { TurboFactory, EthereumSigner } from '@ardrive/turbo-sdk';

async function ensureDistExists(distDir: string): Promise<void> {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build output not found at ${distDir}. Run "bun run build" first.`);
  }
}

function getPrivateKey(): string {
  const key = process.env.ARWEAVE_DEPLOYER_KEY;
  if (!key) {
    throw new Error(
      'ARWEAVE_DEPLOYER_KEY is required. Set it to your Ethereum private key (hex string with or without 0x prefix).'
    );
  }
  return key.startsWith('0x') ? key.slice(2) : key;
}

async function main() {
  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, 'dist');

  await ensureDistExists(distDir);

  console.log('Connecting to ArDrive Turbo...');

  const privateKey = getPrivateKey();
  const signer = new EthereumSigner(privateKey);
  const turbo = TurboFactory.authenticated({ signer, token: 'ethereum' });

  // Check balance
  const balance = await turbo.getBalance();
  console.log(`Turbo Credits balance: ${balance.winc} winc`);

  // Calculate folder size
  let totalSize = 0;
  const walkDir = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        totalSize += fs.statSync(fullPath).size;
      }
    }
  };
  walkDir(distDir);

  console.log(`Upload size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Get upload cost estimate
  const [{ winc: wincCost }] = await turbo.getUploadCosts({ bytes: [totalSize] });
  console.log(`Estimated cost: ${wincCost} winc`);

  if (BigInt(balance.winc) < BigInt(wincCost)) {
    console.log('\n⚠️  Insufficient Turbo Credits balance.');
    console.log('\nTo fund your account with ETH, run:');
    console.log('  bunx turbo crypto-fund -v 0.01 -t ethereum --private-key $ARWEAVE_DEPLOYER_KEY');
    console.log('\nOr visit https://turbo.ardrive.io to buy credits with a credit card.');
    throw new Error('Insufficient balance');
  }

  console.log('\nUploading folder to Arweave via Turbo...');

  const result = await turbo.uploadFolder({
    folderPath: distDir,
    dataItemOpts: {
      tags: [
        { name: 'App-Name', value: 'dhai-eth-site' },
        { name: 'Content-Type', value: 'text/html' },
      ],
    },
    manifestOptions: {
      indexFile: 'index.html',
      fallbackFile: 'index.html', // For SPA routing
    },
  });

  const manifestId = result.manifestResponse?.id;
  if (!manifestId) {
    throw new Error('Upload failed - no manifest ID returned');
  }

  const out = [
    `Manifest TX: ${manifestId}`,
    `Gateway: https://arweave.net/${manifestId}`,
    `ar:// URL: ar://${manifestId}`,
  ].join('\n');

  fs.writeFileSync(path.join(projectRoot, 'latest-arweave.txt'), out + '\n', 'utf8');

  console.log('\n✅ Published to Arweave!');
  console.log(out);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
