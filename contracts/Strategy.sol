// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IStrategy.sol";

contract BaseStrategy is IStrategy {
    IERC20 public immutable token;
    uint256 public balance;

    string public override name = "Test Strategy";

    string public override description = "Strategy Description";

    constructor(IERC20 _token) {
        token = _token;
    }

    function deposit(uint256 _amount) external override {
        require(_amount > 0, "Zero amount");
        token.transferFrom(msg.sender, address(this), _amount);
        balance += _amount;
    }

    function withdraw(uint256 _amount) external override {
        require(_amount > 0 && _amount <= balance, "Invalid amount");

        uint256 profit = (_amount * 10) / 100;
        uint256 toSend = _amount + profit;

        balance -= _amount;

        uint256 available = token.balanceOf(address(this));
        if (toSend > available) {
            toSend = available;
        }

        token.transfer(msg.sender, toSend);
    }

    function getBalance() external view override returns (uint256) {
        return balance;
    }
}