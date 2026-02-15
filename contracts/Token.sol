// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {

    uint256 public currentPrice = 1 ether;
    uint256 public reserveBalance;

    event TokensPurchased(address indexed buyer, uint256 ethSpent, uint256 tokensReceived);

    constructor() ERC20("Token", "TKN") Ownable(msg.sender) {}

    function mintForStrategy(address strategy, uint256 amount) external onlyOwner {
        _mint(strategy, amount);
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH");
        uint256 tokensToMint = msg.value;
        _mint(msg.sender, tokensToMint); // todo
        reserveBalance += msg.value;
        emit TokensPurchased(msg.sender, msg.value, tokensToMint);
    }

    function sellTokens(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Specify token amount");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient tokens");
        require(address(this).balance >= tokenAmount, "Contract has not enough ETH");

        _burn(msg.sender, tokenAmount); // todo
        reserveBalance -= tokenAmount;
        (bool success, ) = payable(msg.sender).call{value: tokenAmount}(""); //todo
        require(success, "ETH transfer failed");
    }

    function previewBuy(uint256 ethAmount) external pure returns (uint256) {
        return ethAmount;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getFrontEndInfo(address user) external view returns (
        uint256 userTokens,
        uint256 price,
        uint256 totalSupplyTokens,
        uint256 reserveETH
    ) {
        userTokens = balanceOf(user);
        price = currentPrice;
        totalSupplyTokens = totalSupply();
        reserveETH = reserveBalance;
    }

    receive() external payable {
    }
}
