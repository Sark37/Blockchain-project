# TicketChain

A decentralised event ticketing system built on the Ethereum Sepolia Testnet. Users can purchase and transfer ERC-20 ticket tokens (TKT) via a browser-based DApp backed by a Solidity smart contract.

---

## Prerequisites

| Requirement | Purpose |
|---|---|
| [MetaMask](https://metamask.io/) browser extension | Signing and sending transactions |
| MetaMask set to **Sepolia Testnet** | All contract activity is on Sepolia |
| Sepolia test ETH (SETH) | Needed to buy tickets and pay gas fees |
| Python 3 **or** Node.js | Running a local HTTP server (see below) |

### Getting Sepolia test ETH
Use any Sepolia faucet, for example:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev

---

## Running the App Locally

> **Important:** The app must be served over HTTP — opening the HTML files directly from the filesystem (`file://`) will prevent MetaMask from injecting `window.ethereum`, and the wallet connection will fail.

**Option 1 — Python (recommended, no install needed):**
```bash
cd "path/to/Blockchain project"
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Option 2 — Node.js (`npx serve`):**
```bash
cd "path/to/Blockchain project"
npx serve .
```

---

## Smart Contract Deployment (Remix)

The contract must be deployed to Sepolia before the Buy/Transfer pages will work. After deploying, update `js/config.js` with the new address.

1. Open [https://remix.ethereum.org](https://remix.ethereum.org)
2. Paste `contracts/TicketToken.sol` into the editor
3. Compile with Solidity **0.8.20**, optimisation enabled (200 runs)
4. Under *Deploy & Run*, select **Injected Provider – MetaMask** and ensure MetaMask is on Sepolia
5. Pass the ticket price in wei as the constructor argument (e.g. `1000000000000000` = 0.001 SETH)
6. Deploy and copy the contract address
7. Paste the address into `js/config.js` → `CONTRACT_ADDRESS`
8. Also update `VENDOR_ADDRESS` in `js/config.js` with the vendor wallet address

---

## Project Structure

```
├── index.html          Landing page
├── wallet.html         Generate a new Ethereum wallet
├── balance.html        Check SETH and TKT balances
├── buy.html            Buy a ticket token via MetaMask
├── transfer.html       Transfer a ticket token to another address
├── contracts/
│   └── TicketToken.sol ERC-20 smart contract (Solidity 0.8.20)
├── js/
│   ├── config.js       Contract address, ABI, and network config
│   ├── buy.js          Buy ticket logic
│   ├── transfer.js     Transfer ticket logic
│   ├── balance.js      Balance check logic
│   └── wallet.js       Wallet generation logic
└── css/
    └── style.css       App styles
```

---

## Network Configuration

| Setting | Value |
|---|---|
| Network | Ethereum Sepolia Testnet |
| Chain ID | 11155111 |
