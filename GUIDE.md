# Complete Setup Guide: React Site on IPFS + IPNS + ENS

A step-by-step guide to deploy a React site to IPFS with automated publishing and ENS integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Pinata Account & API Keys](#pinata-account--api-keys)
4. [w3name IPNS Setup](#w3name-ipns-setup)
5. [Publish Script](#publish-script)
6. [GitHub Actions CI/CD](#github-actions-cicd)
7. [ENS Configuration](#ens-configuration)
8. [Testing & Verification](#testing--verification)

---

## Prerequisites

### Required Tools

```bash
# Install Bun (recommended) or Node.js 18+
curl -fsSL https://bun.sh/install | bash

# Or use Node.js
# https://nodejs.org/en/download/
```

### Required Accounts

- **GitHub account** - for hosting code and CI/CD
- **Pinata account** - for IPFS pinning ([sign up](https://app.pinata.cloud/register))
- **ENS domain** (optional) - if you want `yourname.eth` ([buy on ENS](https://app.ens.domains/))
- **Ethereum wallet** - if setting up ENS (MetaMask recommended)

---

## Project Setup

### 1. Create React + Vite Project

```bash
# Create new Vite project
bun create vite my-ipfs-site --template react-ts
cd my-ipfs-site
bun install
```

### 2. Install Tailwind CSS

```bash
# Install Tailwind and dependencies
bun add -d tailwindcss postcss autoprefixer @tailwindcss/postcss

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# Update src/index.css
cat > src/index.css << 'EOF'
@import "tailwindcss";
EOF
```

### 3. Clean Up Boilerplate

```bash
# Remove default CSS
rm -f src/App.css

# Create minimal App.tsx
cat > src/App.tsx << 'EOF'
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Hello, IPFS! 👋
        </h1>
        <p className="text-xl text-gray-700">
          This site is hosted on IPFS and published automatically.
        </p>
      </div>
    </div>
  )
}

export default App
EOF
```

### 4. Configure Vite for IPFS

IPFS uses relative paths. Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",  // Important: use relative paths for IPFS
});
```

### 5. Test Locally

```bash
bun run dev
# Visit http://localhost:5173
```

---

## Pinata Account & API Keys

### 1. Sign Up for Pinata

Go to [https://app.pinata.cloud/register](https://app.pinata.cloud/register) and create a free account.

### 2. Generate API Key (JWT)

1. Navigate to **API Keys** in the Pinata dashboard
2. Click **New Key**
3. Set permissions:
   - ✅ **pinFileToIPFS**
   - ✅ **pinJSONToIPFS**
4. Name it: `my-ipfs-site`
5. Click **Create Key**
6. **Copy the JWT immediately** (you can't see it again)

Save this JWT somewhere safe - you'll need it as `PINATA_JWT`.

---

## w3name IPNS Setup

IPNS allows you to have a persistent address that points to your latest IPFS content. w3name provides IPNS over HTTP.

### 1. Install w3name

```bash
bun add -d w3name
```

### 2. Generate IPNS Name

Create a script to generate your IPNS signing key:

```bash
# Create a one-time script
cat > generate-ipns-key.mjs << 'EOF'
import * as Name from 'w3name';
import fs from 'fs';

async function generateKey() {
  const name = await Name.create();
  
  console.log('✅ IPNS Name:', name.toString());
  console.log('   Use this in your ENS contenthash!\n');
  
  // Save the private key
  fs.writeFileSync('signing-key.txt', name.key.raw);
  console.log('✅ Private key saved to: signing-key.txt');
  console.log('   Keep this safe - you need it to update your IPNS record!\n');
  
  // Generate base64 for GitHub secrets
  const base64Key = Buffer.from(name.key.raw).toString('base64');
  console.log('✅ Base64 for GitHub Secret (W3NAME_KEY_B64):');
  console.log('   ' + base64Key + '\n');
}

generateKey();
EOF

# Run it
bun run generate-ipns-key.mjs
```

**Output example:**
```
✅ IPNS Name: k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
   Use this in your ENS contenthash!

✅ Private key saved to: signing-key.txt
   Keep this safe - you need it to update your IPNS record!

✅ Base64 for GitHub Secret (W3NAME_KEY_B64):
   CAESQLg7N5JL8H3Gg5NL...
```

**Save these values:**
- `IPNS Name (k51...)` → for ENS contenthash
- `Base64 string` → for GitHub secret `W3NAME_KEY_B64`
- `signing-key.txt` → keep safe locally, DO NOT commit

### 3. Secure Your Key

```bash
# Add to .gitignore
echo "signing-key.txt" >> .gitignore
echo "latest-ipfs.txt" >> .gitignore
```

---

## Publish Script

### 1. Install Dependencies

```bash
bun add -d pinata w3name dotenv
```

### 2. Create Publish Script

```bash
mkdir -p scripts
```

Create `scripts/publish-ipfs.ts` - copy from this repo's `scripts/publish-ipfs.ts`, or get it here:

[View publish-ipfs.ts](./scripts/publish-ipfs.ts)

Key features:
- Recursively uploads `dist/` folder to IPFS via Pinata
- Updates IPNS record to point to new CID
- Supports multiple key formats (raw, base64, hex, JSON, PEM)
- Outputs CID and IPNS info to `latest-ipfs.txt`

### 3. Add Package Script

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "publish:ipfs": "bun run build && bunx tsx scripts/publish-ipfs.ts"
  }
}
```

### 4. Create .env File (Local Testing)

```bash
cat > .env << 'EOF'
PINATA_JWT=your_pinata_jwt_here
# W3NAME_KEY_B64 not needed if signing-key.txt exists
EOF

# Add to .gitignore
echo ".env" >> .gitignore
```

### 5. Test Locally

```bash
# Make sure signing-key.txt exists and PINATA_JWT is in .env
bun run publish:ipfs
```

**Expected output:**
```
✓ built in 625ms

Publish complete
CID=bafybeiabc123...
IPNS=k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
Gateway (CID): https://ipfs.io/ipfs/bafybeiabc123.../
Gateway (IPNS): https://ipfs.io/ipns/k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt/
```

Visit the gateway URLs to verify your site is live on IPFS!

---

## GitHub Actions CI/CD

### 1. Create Workflow File

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/publish-ipfs.yml`:

```yaml
name: Build and Publish to IPFS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ipfs-publish-${{ github.ref }}
  cancel-in-progress: false

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: main
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Publish to IPFS and Update IPNS
        run: bun run publish:ipfs
        env:
          PINATA_JWT: ${{ secrets.PINATA_JWT }}
          W3NAME_KEY_B64: ${{ secrets.W3NAME_KEY_B64 }}

      - name: Upload publish info
        uses: actions/upload-artifact@v4
        with:
          name: ipfs-publish-${{ github.sha }}
          path: latest-ipfs.txt
          if-no-files-found: ignore
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: IPFS-enabled React site"

# Create repo on GitHub first, then:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### 3. Configure GitHub Secrets

#### Create Environment

1. Go to your repo → **Settings** → **Environments**
2. Click **New environment**
3. Name it `main`
4. Click **Configure environment**

#### Add Secrets

1. Under **Environment secrets**, click **Add secret**

**Secret 1: PINATA_JWT**
- Name: `PINATA_JWT`
- Value: Your Pinata JWT from earlier

**Secret 2: W3NAME_KEY_B64**
- Name: `W3NAME_KEY_B64`
- Value: The base64 string from `generate-ipns-key.mjs` output

Or generate it from your `signing-key.txt`:
```bash
base64 -i signing-key.txt | tr -d '\n'
```

### 4. Trigger Workflow

Push any change to `main`:

```bash
echo "# My IPFS Site" > README.md
git add README.md
git commit -m "Add README"
git push
```

Check **Actions** tab to see the workflow run. When complete, check the artifact for CID/IPNS details.

---

## ENS Configuration

### 1. Prerequisites

- Own an ENS domain (e.g., `yourname.eth`)
- Have ETH in your wallet for gas fees (~$5-20 depending on network)

### 2. Get Your IPNS Name

From the earlier `generate-ipns-key.mjs` output or `latest-ipfs.txt`:

```
k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
```

### 3. Set ENS Contenthash

#### Option A: ENS Manager App (Easiest)

1. Go to [https://app.ens.domains/](https://app.ens.domains/)
2. Connect wallet
3. Search for your ENS name
4. Click **Records** tab
5. Click **Edit Records**
6. Find **Content** field
7. Select **IPNS** from dropdown
8. Paste your IPNS name: `k51qzi5uqu5di9...`
9. Click **Confirm** and approve transaction

#### Option B: Using ethers.js

```typescript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const resolver = await provider.getResolver('yourname.eth');
const ipnsContenthash = 'ipns://k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt';

// This is pseudo-code - actual implementation varies
await resolver.setContenthash(ipnsContenthash);
```

### 4. Verify ENS Setup

After transaction confirms (~30 seconds):

1. Visit: `https://yourname.eth.limo`
2. Or use any IPFS gateway: `https://yourname.eth.link`

**Note:** `.eth.limo` and `.eth.link` are HTTP gateways that resolve ENS names to IPFS/IPNS content.

### 5. Update Site on Push

Now every push to `main`:
1. Builds your site
2. Uploads new CID to IPFS
3. Updates IPNS to point to new CID
4. Your ENS automatically resolves to latest version (via IPNS)

**No need to update ENS again!** IPNS handles the updates.

---

## Testing & Verification

### Local Testing Checklist

- [ ] `bun run dev` works
- [ ] `bun run build` produces `dist/` folder
- [ ] `bun run publish:ipfs` uploads to IPFS successfully
- [ ] Gateway URLs in `latest-ipfs.txt` load your site

### CI/CD Testing Checklist

- [ ] GitHub workflow runs without errors
- [ ] Workflow artifact contains `latest-ipfs.txt`
- [ ] IPFS gateway URL loads latest build
- [ ] IPNS gateway URL loads latest build

### ENS Testing Checklist

- [ ] `yourname.eth.limo` resolves to your site
- [ ] After a new push, wait 2-5 minutes and refresh - should show new content
- [ ] Contenthash on ENS manager shows `ipns://k51...`

### Common Issues

#### "Missing IPNS signing key"
- Ensure `W3NAME_KEY_B64` is set in GitHub secrets
- Or `signing-key.txt` exists locally
- Verify base64 is correct: `base64 -i signing-key.txt | tr -d '\n'`

#### "PINATA_JWT required"
- Check secret name is exactly `PINATA_JWT` (case-sensitive)
- Verify it's set in the `main` environment, not repository secrets
- Ensure workflow specifies `environment: main`

#### "Invalid wire type" error
- Your signing-key format is wrong
- Regenerate: `bun run generate-ipns-key.mjs`
- Use the raw bytes or base64 output

#### ENS not resolving
- Wait 5-10 minutes after setting contenthash (DNS propagation)
- Clear browser cache
- Try different gateway: `.eth.limo` vs `.eth.link`
- Verify contenthash on [ENS Manager](https://app.ens.domains/)

#### IPNS slow to update
- IPNS propagation takes 2-5 minutes
- Direct CID gateway URL works immediately
- Use CID for instant updates, IPNS for persistent address

---

## Next Steps

### Improvements

1. **Custom Domain**: Use Cloudflare or Fleek to map `yourdomain.com` → IPNS
2. **Preview Deployments**: Create workflow for PR previews (upload CID, don't update IPNS)
3. **Multiple Environments**: Separate IPNS names for staging/production
4. **Pinata Submarine**: Add secret uploading for private content
5. **Analytics**: Use IPFS gateway logs or add privacy-respecting analytics
6. **CDN**: Use Pinata Dedicated Gateways for faster global delivery

### Resources

- [Pinata Docs](https://docs.pinata.cloud/)
- [w3name Docs](https://github.com/web3-storage/w3name)
- [ENS Docs](https://docs.ens.domains/)
- [IPFS Docs](https://docs.ipfs.tech/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

## Conclusion

You now have:
- ✅ A modern React site with Tailwind CSS
- ✅ Automated IPFS publishing on every commit
- ✅ Persistent IPNS addressing
- ✅ ENS integration for human-readable URLs
- ✅ Full CI/CD pipeline with GitHub Actions

Your site is now **decentralized**, **censorship-resistant**, and **automatically deployed**.

Welcome to the decentralized web! 🌐

---

**Questions or issues?** Open an issue on GitHub or consult the [main README](./README.md).

