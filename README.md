# Monad Pixel Universe

A decentralized pixel art platform on the blockchain where users can buy, paint, and trade pixels.

## Features

- 10x10 pixel grid (100 NFTs)
- Buy pixels for 0.01 ETH
- Paint pixels for 0.001 ETH
- Color challenges
- Pixel signatures
- Daily snapshots

## Smart Contract

The smart contract is located in `contracts/MonadPixel.sol`. It implements the following features:

- ERC-721 NFT standard
- Pixel minting and painting
- Color challenges
- Pixel signatures
- Ownership tracking

## Frontend

The frontend is built with Next.js and Tailwind CSS. It provides a user-friendly interface for:

- Connecting MetaMask wallet
- Viewing the pixel grid
- Buying and painting pixels
- Managing pixel ownership

## Setup

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Hardhat (for contract deployment)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   cd web
   npm install
   ```

3. Deploy the smart contract:

   ```bash
   cd contracts
   npm install
   npx hardhat compile
   npx hardhat deploy
   ```

4. Update the contract address in `web/app/page.tsx`

5. Start the development server:
   ```bash
   cd web
   npm run dev
   ```

## Usage

1. Connect your MetaMask wallet
2. Buy a pixel by clicking on an empty space
3. Paint your pixel by selecting a color and clicking "Paint"
4. Challenge other pixels by clicking on them and selecting "Challenge"

## License

MIT
