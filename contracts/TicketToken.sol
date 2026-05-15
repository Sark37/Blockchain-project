// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  TicketToken
 * @notice ERC-20 ticket token for TicketChain DApp.
 *         Users purchase one TKT token by calling buyTicket() with exactly
 *         ticketPrice worth of SETH (Sepolia ETH). Tokens can then be
 *         transferred back to the vendor via the standard ERC-20 transfer().
 *
 * Deployment (Remix):
 *  1. Open https://remix.ethereum.org
 *  2. Paste this file into the editor.
 *  3. Install OpenZeppelin: enable "Import from npm" in Remix settings,
 *     or use the GitHub import path below (already resolved by Remix).
 *  4. Compile with Solidity 0.8.20, enable optimisation (200 runs).
 *  5. Deploy via "Injected Provider – MetaMask" on Sepolia.
 *  6. Pass the ticket price in wei as constructor argument,
 *     e.g. 1000000000000000 = 0.001 SETH.
 *  7. Copy the deployed contract address into js/config.js.
 */
contract TicketToken is ERC20, Ownable, ReentrancyGuard {

    uint256 public ticketPrice;

    event TicketPurchased(address indexed buyer, uint256 amount);

    constructor(uint256 _ticketPriceWei)
        ERC20("TicketToken", "TKT")
        Ownable(msg.sender)
    {
        ticketPrice = _ticketPriceWei;
    }

    /**
     * @notice Purchase one ticket token.
     *         Caller must send at least ticketPrice wei with this call.
     *         Any excess SETH is refunded.
     */
    function buyTicket() external payable nonReentrant {
        require(msg.value >= ticketPrice, "TicketToken: insufficient SETH sent");

        _mint(msg.sender, 1 * 10 ** decimals());
        emit TicketPurchased(msg.sender, 1);

        // Refund any overpayment
        uint256 excess = msg.value - ticketPrice;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    /**
     * @notice Update the ticket price (owner only).
     */
    function setTicketPrice(uint256 _newPriceWei) external onlyOwner {
        ticketPrice = _newPriceWei;
    }

    /**
     * @notice Withdraw collected SETH to the contract owner.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "TicketToken: nothing to withdraw");
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
}
