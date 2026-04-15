// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IRewardRouterV2 {
    function mintAndStakeGlp(
        address token,
        uint256 amount,
        uint256 minUsdg,
        uint256 minGlp
    ) external returns (uint256);

    function unstakeAndRedeemGlp(
        address tokenOut,
        uint256 glpAmount,
        uint256 minOut,
        address receiver
    ) external returns (uint256);
}