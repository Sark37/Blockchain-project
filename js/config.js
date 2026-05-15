// TicketChain DApp — Configuration
// After deploying TicketToken.sol via Remix, update the two addresses below.

const CONFIG = {
    CONTRACT_ADDRESS: "0xFA924bF7f76615c0A7150B1bE17d67324f52573B",

    VENDOR_ADDRESS: "0x6db63Cb31CC33A20Dc5F74fFfb48a00f0cb68a3D",

    CHAIN_ID: 11155111,
    CHAIN_NAME: "Sepolia Testnet",

    // Public Sepolia RPCs — used for read-only balance checks (no MetaMask needed)
    // Multiple endpoints so FallbackProvider can retry if one is down
    RPC_URLS: [
        "https://rpc.sepolia.org",
        "https://rpc2.sepolia.org",
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://sepolia.drpc.org"
    ],

    // Human-readable ABI for TicketToken (ethers.js v6 format)
    CONTRACT_ABI: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function ticketPrice() view returns (uint256)",
        "function buyTicket() payable",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event TicketPurchased(address indexed buyer, uint256 amount)"
    ]
};
