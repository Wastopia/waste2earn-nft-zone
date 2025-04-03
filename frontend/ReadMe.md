# Waste2Earn NFT Frontend

A React frontend for the Waste2Earn NFT platform built on the Internet Computer using the ICRC-7 NFT standard.

## Features

- Browse all NFTs in the collection
- View detailed NFT information
- Connect with Internet Identity
- Transfer and approve NFTs
- Admin panel for minting new NFTs

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove/) (DFINITY Canister SDK)
- [Internet Computer Wallet](https://nns.ic0.app/) or [Internet Identity](https://identity.ic0.app/)

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/waste2earn-nft-frontend.git
cd waste2earn-nft-frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then, edit the `.env` file and update the values as needed.

### Generate Declarations

To generate the TypeScript declarations for the canisters:

```bash
dfx generate icrc7
```

This will create the necessary files in the `src/declarations` directory.

### Start the Development Server

```bash
npm start
```

This will start the React development server on [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

This will create a production-ready build in the `build` directory.

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── declarations/       # Generated canister declarations
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Application pages
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main application component
│   ├── config.js           # Application configuration
│   └── index.jsx           # Entry point
├── .env                    # Environment variables
├── package.json            # Project dependencies
└── tailwind.config.js      # Tailwind CSS configuration
```

## Canister Integration

This frontend integrates with the following canisters:

- **ICRC7**: The NFT canister implementing the ICRC-7 standard

## ICRC Standards Implemented

- [ICRC-7](https://github.com/dfinity/ICRC/ICRCs/ICRC-7): Non-Fungible Token Standard
- [ICRC-37](https://github.com/dfinity/ICRC/ICRCs/ICRC-37): NFT Approval Standard
- [ICRC-3](https://github.com/dfinity/ICRC/ICRCs/ICRC-3): Transaction Log Standard

## Authentication

The application uses Internet Identity for authentication. Users can connect their Internet Identity to interact with the NFTs.

## License

[MIT License](LICENSE)