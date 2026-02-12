// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IStrategy {

    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function getBalance() external view returns (uint256);

    function name() external view returns (string memory);

    function description() external view returns (string memory);
}