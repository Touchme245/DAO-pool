// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IStrategy.sol";
import "./IRewardRouterV2.sol";

contract GMXVaultStrategy is IStrategy {

    address public owner;

    IERC20 public immutable usdc;
    IERC20 public immutable glp;

    IRewardRouterV2 public rewardRouter;

    uint256 public totalBalance;

    mapping(address => uint256) public userBalances;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(
        address _usdc,
        address _glp,
        address _rewardRouter
    ) {
        owner = msg.sender;

        usdc = IERC20(_usdc);
        glp = IERC20(_glp);
        rewardRouter = IRewardRouterV2(_rewardRouter);

        usdc.approve(_rewardRouter, type(uint256).max);
    }

    function deposit(uint256 _amount) external override {
        require(_amount > 0, "bad amount");

        usdc.transferFrom(msg.sender, address(this), _amount);

        uint256 glpReceived = rewardRouter.mintAndStakeGlp(
            address(usdc),
            _amount,
            0,
            0
        );

        userBalances[msg.sender] += glpReceived;
        totalBalance += glpReceived;
    }

    function withdraw(uint256 _amount) external override {
        require(userBalances[msg.sender] >= _amount, "not enough");

        userBalances[msg.sender] -= _amount;
        totalBalance -= _amount;

        uint256 usdcAmount = rewardRouter.unstakeAndRedeemGlp(
            address(usdc),
            _amount,
            0,
            address(this)
        );

        usdc.transfer(msg.sender, usdcAmount);
    }

    function getBalance() external view override returns (uint256) {
        return totalBalance;
    }

    function name() external pure override returns (string memory) {
        return "GMX GLP Vault Strategy";
    }

    function description() external pure override returns (string memory) {
        return "Deposits into GMX GLP vault to earn fees";
    }
}