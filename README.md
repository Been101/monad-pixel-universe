# Monad Pixel Universe

A decentralized pixel art platform built on the Monad blockchain.

## Features

- Mint and own pixels on a 100x100 grid
- Paint your pixels with any color
- Built with Next.js and Hardhat
- Smart contract deployed on Monad Testnet

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm
- MetaMask wallet

### Installation

1. Clone the repository

```bash
git clone https://github.com/Been101/monad-pixel-universe.git
cd monad-pixel-universe
```

2. Install dependencies

```bash
# Install web dependencies
cd web
pnpm install

# Install contract dependencies
cd ../contracts
pnpm install
```

3. Configure environment variables

```bash
# In contracts directory
cp .env.example .env
# Edit .env with your private key

# In web directory
cp .env.example .env.local
# Edit .env.local with your contract address
```

4. Start the development server

```bash
# In web directory
pnpm dev
```

## License

MIT
