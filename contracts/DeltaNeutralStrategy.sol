// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IStrategy.sol";
import "./IGMXPositionRouter.sol";

interface IGMXRouter {
    function approvePlugin(address plugin) external;
}

contract GMXDeltaNeutralStrategy is IStrategy {

    address public owner;

    IERC20 public immutable token;

    IGMXRouter public gmxRouter;
    IGMXPositionRouter public positionRouter;

    address public indexToken;

    uint256 public totalBalance;

    mapping(address => uint256) public userBalances;

    uint256 public constant EXECUTION_FEE = 0.0003 ether;

    address[] public path;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(
        address _token,
        address _router,
        address _positionRouter,
        address _indexToken
    ) {
        owner = msg.sender;

        token = IERC20(_token);
        gmxRouter = IGMXRouter(_router);
        positionRouter = IGMXPositionRouter(_positionRouter);
        indexToken = _indexToken;

        token.approve(_router, type(uint256).max);
    }

    function deposit(uint256 _amount) external override {
        require(_amount > 0, "invalid amount");

        token.transferFrom(msg.sender, address(this), _amount);

        userBalances[msg.sender] += _amount;
        totalBalance += _amount;

        _openDeltaNeutral(_amount);
    }

    function withdraw(uint256 _amount) external override {
        require(userBalances[msg.sender] >= _amount, "not enough");

        _closeDeltaNeutral(_amount);

        userBalances[msg.sender] -= _amount;
        totalBalance -= _amount;

        token.transfer(msg.sender, _amount);
    }

    function getBalance() external view override returns (uint256) {
        return totalBalance;
    }

    function name() external pure override returns (string memory) {
        return "GMX Delta Neutral Strategy";
    }

    function description() external pure override returns (string memory) {
        return "Delta neutral via GMX short positions";
    }

    function _openDeltaNeutral(uint256 amount) internal {
        uint256 half = amount / 2;

        _openShort(half);
    }

    function _closeDeltaNeutral(uint256 amount) internal {
        uint256 half = amount / 2;

        _closeShort(half);
    }

    function _openShort(uint256 collateral) internal {

        address;
        path[0] = address(token);

        uint256 sizeDelta = collateral * 2;

        positionRouter.createIncreasePosition{value: EXECUTION_FEE}(
            path,
            indexToken,
            collateral,
            0,
            sizeDelta,
            false,
            0,
            EXECUTION_FEE,
            bytes32(0),
            address(0)
        );
    }

    function _closeShort(uint256 collateral) internal {

        address;
        path[0] = address(token);

        uint256 sizeDelta = collateral * 2;

        positionRouter.createDecreasePosition{value: EXECUTION_FEE}(
            path,
            indexToken,
            collateral,
            sizeDelta,
            false,
            address(this),
            0,
            0,
            EXECUTION_FEE,
            false,
            address(0)
        );
    }

    receive() external payable {}

    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}