# dhai.eth

A modern React + Vite + Tailwind CSS site automatically published to IPFS and IPNS, and attached to my ENS.

## 🌐 Live Site

- **IPNS**: [https://dhai.eth.limo](https://dhai.eth.limo)
- **Latest IPFS Gateway**: Check `latest-ipfs.txt` after each deploy

## 🚀 Features

- **React 19** + **TypeScript** + **Vite** for fast development
- **Tailwind CSS v4** for styling
- **Automated IPFS Publishing** via Pinata on every push to `main`
- **IPNS Updates** via w3name for persistent addressing
- **GitHub Actions** CI/CD pipeline

## 📚 Setup Guide

**Want to build your own version from scratch?** Check out the complete step-by-step guide:

→ **[Complete Setup Guide](./GUIDE.md)** ← Start here!

The guide covers everything from creating the project to ENS configuration.

## 📦 Development

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 18+)
- [Pinata](https://pinata.cloud) account with JWT
- w3name signing key for IPNS updates

### Installation

```bash
bun install
```

### Development Server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

### Build

```bash
bun run build
```

Outputs production build to `dist/`.

### Preview Build

```bash
bun run preview
```

Preview the production build locally at [http://localhost:4173](http://localhost:4173).

## 🌍 IPFS Publishing

### Manual Publish

To manually publish to IPFS and update IPNS:

```bash
bun run publish:ipfs
```

**Required Environment Variables:**

- `PINATA_JWT` - Your Pinata JWT token ([get one here](https://app.pinata.cloud/developers/api-keys))
- `W3NAME_KEY_B64` - Base64-encoded w3name private key (see below)

**Optional:** Place your w3name key in `signing-key.txt` (supported formats: raw bytes, base64, hex, JSON array, or PEM).

### How It Works

1. **Build** - Compiles the React app to static files in `dist/`
2. **Upload to IPFS** - Uploads the entire `dist/` folder to Pinata using the Files API
3. **Update IPNS** - Updates your w3name IPNS record to point to the new CID
4. **Output** - Writes CID, IPNS name, and gateway URLs to `latest-ipfs.txt`

### Getting Your w3name Key

If you have an existing w3name signing key:

```bash
# Convert to base64 for GitHub secrets
base64 -i signing-key.txt | tr -d '\n' | pbcopy
```

If you need to create a new w3name key:

```bash
npm install -g w3name
w3name create > my-name.key
# Save the output - you'll need the private key bytes
```

## 🤖 Automated Publishing (GitHub Actions)

Every push to `main` automatically:
1. Builds the site
2. Uploads to IPFS via Pinata
3. Updates the IPNS record
4. Uploads publish details as a workflow artifact

### Required GitHub Secrets

Set these as **environment secrets** for the `main` environment:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `PINATA_JWT` | Pinata API JWT token | [Pinata Dashboard → API Keys](https://app.pinata.cloud/developers/api-keys) |
| `W3NAME_KEY_B64` | Base64-encoded w3name private key | `base64 -i signing-key.txt \| tr -d '\n'` |

**Setting Secrets:**

1. Go to **Settings → Environments → main**
2. Add secrets listed above
3. Push to `main` to trigger the workflow

**Note:** `PINATA_API_KEY` and `PINATA_API_SECRET` are optional legacy credentials; the workflow uses `PINATA_JWT`.

## 📂 Project Structure

```
.
├── src/
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind directives
├── scripts/
│   └── publish-ipfs.ts  # IPFS/IPNS publish script
├── .github/
│   └── workflows/
│       └── publish-ipfs.yml  # CI/CD workflow
├── dist/                # Build output (gitignored)
├── signing-key.txt      # Local w3name key (gitignored)
└── latest-ipfs.txt      # Last publish details (gitignored)
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint |
| `bun run publish:ipfs` | Build + publish to IPFS + update IPNS |

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS v4** - Styling
- **Pinata** - IPFS pinning service
- **w3name** - IPNS over HTTP
- **GitHub Actions** - CI/CD

## 📝 Notes

- IPNS propagation to IPFS gateways may take a few minutes
- The workflow artifact contains the CID and IPNS details for each deploy
- Gateway URLs use `ipfs.io` by default; you can use any public gateway

## 📄 License

MIT

---

Built with ❤️ using React + IPFS
