// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./IStrategy.sol";

contract InvestmentPool is ERC20, ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");

    IERC20 public immutable baseToken;
    uint256 public totalLockedInStrategies;

    uint256 public proposalCount;

    uint256 public withdrawalFeePercent = 10;
    uint256 public feeCollected;

    mapping(address => uint256) public deposited;

    struct StrategyInfo {
        address strategy;
        bool active;
        string description;
    }

    enum ProposalState {
        Active,
        Defeated,
        Succeeded,
        Executed,
        Closed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        uint256 strategyId;
        uint256 amount;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTimestamp;
        uint256 endTimestamp;
        ProposalState state;
        string description;
        string title;
        uint256 votingPeriod;
        mapping(address => bool) hasVoted;

        uint256 cancelForVotes;
        uint256 cancelAgainstVotes;
        bool cancelActive;
        uint256 cancelStartTimestamp;
        uint256 cancelEndTimestamp;
        mapping(address => bool) hasVotedCancel;
    }

    StrategyInfo[] public strategies;
    mapping(uint256 => Proposal) private _proposals;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Redeem(address indexed user, uint256 sharesBurned, uint256 amountReturned);
    event StrategyAdded(uint256 indexed strategyId, address strategy);
    event StrategyToggled(uint256 indexed strategyId, address strategy, bool active);
    event ProposalCreated(uint256 indexed id, address proposer, uint256 strategyId, uint256 amount, uint256 start, uint256 end);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, address strategy, uint256 amount);
    event ProposalCancelled(uint256 indexed proposalId);
    event EmergencyWithdraw(address indexed admin, uint256 amount);
    event CancelVoteStarted(uint256 indexed proposalId, uint256 start, uint256 end);
    event CancelVoted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalCancelledByVote(uint256 indexed proposalId);

    constructor(IERC20 _baseToken) ERC20("Investment Pool Share", "IPS") {
        require(address(_baseToken) != address(0), "zero token");
        baseToken = _baseToken;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    

    function totalAssets() public view returns (uint) {
        uint256 onContract = baseToken.balanceOf(address(this));
        uint256 inStrategies = 0;
        if (onContract >= feeCollected) {
            onContract -= feeCollected;
        } else {
            onContract = 0;
        }
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                inStrategies += IStrategy(strategies[i].strategy).getBalance();
            }
        }
        return onContract + inStrategies;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Nothing to deposit");
        uint256 _totalAssets = totalAssets();

        baseToken.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 sharesToMint;
        uint256 supply = totalSupply();
        if (supply == 0 || _totalAssets == 0) {
            sharesToMint = _amount;
        } else {
            sharesToMint = (_amount * supply) / _totalAssets;
        }

        require(sharesToMint > 0, "Zero shares");
        _mint(msg.sender, sharesToMint);

        deposited[msg.sender] += _amount;

        emit Deposit(msg.sender, _amount, sharesToMint);
    }

    function randeem(uint256 _shares) external nonReentrant {
        require(_shares > 0, "Nothing to redeem");
        require(_shares <= balanceOf(msg.sender), "Not enough shares");

        uint256 supply = totalSupply();
        require(supply > 0, "No supply");

        uint256 withdrawAmount = (_shares * totalAssets()) / supply;

        uint256 onContract = baseToken.balanceOf(address(this));
        if (onContract > feeCollected) {
            onContract -= feeCollected;
        } else {
            onContract = 0;
        }

        if (onContract < withdrawAmount) {
            uint256 difference = withdrawAmount - onContract;

            for (uint256 i = 0; i < strategies.length && difference > 0; i++) {
                if (!strategies[i].active) continue;

                IStrategy strategy = IStrategy(strategies[i].strategy);
                uint256 strategyBalance = strategy.getBalance();
                if (strategyBalance == 0) continue;

                uint256 ask = strategyBalance > difference ? difference : strategyBalance;
                strategy.withdraw(ask);
                difference -= ask;
            }
        }

        uint256 finalAvailable = baseToken.balanceOf(address(this));
        if (finalAvailable > feeCollected) {
            finalAvailable -= feeCollected;
        } else {
            finalAvailable = 0;
        }

        uint256 toSend = withdrawAmount > finalAvailable
            ? finalAvailable
            : withdrawAmount;

        require(toSend > 0, "Insufficient liquidity");

        uint256 userShares = balanceOf(msg.sender);
        uint256 userDeposit = deposited[msg.sender];

        uint256 depositPart = (userDeposit * _shares) / userShares;

        uint256 profit = 0;
        uint256 feeAmount = 0;

        if (toSend > depositPart) {
            profit = toSend - depositPart;
            feeAmount = (profit * withdrawalFeePercent) / 100;
            feeCollected += feeAmount;
        }

        uint256 netAmount = toSend - feeAmount;

        deposited[msg.sender] = userDeposit - depositPart;
        _burn(msg.sender, _shares);

        baseToken.safeTransfer(msg.sender, netAmount);

        emit Redeem(msg.sender, _shares, netAmount);
    }


    function setWithdrawalFeePercent(uint256 _percent) external onlyRole(ADMIN_ROLE) {
        require(_percent <= 100, "Fee cannot exceed 100%");
        withdrawalFeePercent = _percent;
    }

    function getWithdrawalFeePercent() external view returns(uint256) {
        return withdrawalFeePercent;
    }

    function withdrawCollectedFees(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(msg.sender != address(0), "Invalid address");
        require(amount <= feeCollected, "Not enough fees");

        feeCollected -= amount;
        baseToken.safeTransfer(msg.sender, amount);
    }

    function addStrategy(address _strategy, string memory _description) external onlyRole(ADMIN_ROLE) {
        require(_strategy != address(0), "Invalid strategy");
        strategies.push(StrategyInfo({strategy: _strategy, active: true, description: _description}));
        emit StrategyAdded(strategies.length - 1, _strategy);
    }

    function toggleStrategy(uint256 _strategyId, bool _active) external onlyRole(ADMIN_ROLE) {
        require(_strategyId < strategies.length, "Invalid id");
        strategies[_strategyId].active = _active;
        emit StrategyToggled(_strategyId, strategies[_strategyId].strategy, _active);
    }

    function strategyCount() external view returns (uint256) {
        return strategies.length;
    }

    function createProposal(uint256 _strategyId, uint256 _amount, uint256 votingPeriodMinutes, string calldata _title, string calldata _description) external returns (uint256) {
        require(balanceOf(msg.sender) > 0, "Need shares to propose");

        require(_strategyId < strategies.length, "Invalid strategy");
        require(strategies[_strategyId].active, "Inactive strategy");
        require(_amount > 0, "Invalid amount");
        require(votingPeriodMinutes > 0, "Voting period must be > 0");

        proposalCount++;
        uint256 id = proposalCount;
        Proposal storage p = _proposals[id];
        p.id = id;
        p.proposer = msg.sender;
        p.strategyId = _strategyId;
        p.amount = _amount;
        p.startTimestamp = block.timestamp;
        p.endTimestamp = block.timestamp + votingPeriodMinutes * 1 minutes;
        p.votingPeriod = votingPeriodMinutes;
        p.state = ProposalState.Active;
        p.description = _description;
        p.title = _title;

        emit ProposalCreated(id, msg.sender, _strategyId, _amount, p.startTimestamp, p.endTimestamp);
        return id;
    }

    function vote(uint256 _proposalId, bool support) external {
        Proposal storage proposal = _proposals[_proposalId];

        require(proposal.id != 0, "No such proposal");
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp < proposal.endTimestamp, "Voting closed");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;

        uint256 weight = balanceOf(msg.sender);
        require(weight > 0, "no voting power");

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit Voted(_proposalId, msg.sender, support, weight);
    }

    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage p = _proposals[_proposalId];
        require(p.id != 0, "Invalid proposal");
        require(p.state == ProposalState.Active, "Proposal is not active");
        require(block.timestamp > p.endTimestamp, "Voting not ended");


        uint256 supply = totalSupply();
        uint256 quorum = supply / 10;
        if (quorum == 0) {
            quorum = 1;
        }

        if (p.forVotes > p.againstVotes && p.forVotes >= quorum) {
            p.state = ProposalState.Succeeded;
        } else {
            p.state = ProposalState.Defeated;
        }
    }

    event Debug(string msg, uint256 val);

    function executeProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = _proposals[_proposalId];
        require(proposal.id != 0, "Invalid proposal");
        require(proposal.state == ProposalState.Succeeded, "Proposal not succeeded");
        require(proposal.amount > 0, "Zero amount");

        uint256 available = baseToken.balanceOf(address(this));
        require(available >= proposal.amount, "Insufficient funds");

        StrategyInfo storage strategy = strategies[proposal.strategyId];
        require(strategy.active, "Strategy not active");

        address strategyAddress = strategy.strategy;

        baseToken.approve(strategyAddress, 0);
        baseToken.safeIncreaseAllowance(strategyAddress, proposal.amount);
        IStrategy(strategyAddress).deposit(proposal.amount);
        baseToken.approve(strategyAddress, 0);

        proposal.state = ProposalState.Executed;
        emit ProposalExecuted(_proposalId, strategyAddress, proposal.amount);
    }

    function startCancelVoting(uint256 _proposalId, uint256 votingPeriodMinutes) external {
        Proposal storage p = _proposals[_proposalId];

        require(balanceOf(msg.sender) > 0, "Need shares");
        require(p.id != 0, "Invalid proposal");
        require(p.state == ProposalState.Executed, "Not active");
        require(!p.cancelActive, "Cancel vote already active");
        require(votingPeriodMinutes > 0, "Invalid period");

        p.cancelActive = true;
        p.cancelStartTimestamp = block.timestamp;
        p.cancelEndTimestamp = block.timestamp + votingPeriodMinutes * 1 minutes;

        emit CancelVoteStarted(_proposalId, p.cancelStartTimestamp, p.cancelEndTimestamp);
    }

    function voteCancel(uint256 _proposalId, bool support) external {
        Proposal storage p = _proposals[_proposalId];

        require(p.id != 0, "Invalid proposal");
        require(p.cancelActive, "Cancel voting not active");
        require(block.timestamp < p.cancelEndTimestamp, "Cancel voting ended");
        require(!p.hasVotedCancel[msg.sender], "Already voted cancel");

        uint256 weight = balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        p.hasVotedCancel[msg.sender] = true;

        if (support) {
            p.cancelForVotes += weight;
        } else {
            p.cancelAgainstVotes += weight;
        }

        emit CancelVoted(_proposalId, msg.sender, support, weight);
    }

    function finalizeCancelVote(uint256 _proposalId) external {
        Proposal storage p = _proposals[_proposalId];

        require(p.id != 0, "Invalid proposal");
        require(p.cancelActive, "Cancel vote not active");
        require(block.timestamp > p.cancelEndTimestamp, "Cancel voting not ended");

        uint256 supply = totalSupply();
        uint256 quorum = supply / 10;
        if (quorum == 0) {
            quorum = 1;
        }

        if (p.cancelForVotes > p.cancelAgainstVotes && p.cancelForVotes >= quorum) {
            _withdrawFromProposal(_proposalId);
            emit ProposalCancelledByVote(_proposalId);
        }

        p.cancelActive = false;
    }

    function cancelProposal(uint256 _proposalId) external onlyRole(ADMIN_ROLE) {
        Proposal storage proposal = _proposals[_proposalId];
        require(proposal.id != 0, "Invalid proposal");
        require(proposal.state == ProposalState.Active, "Cannot cancel");
        proposal.state = ProposalState.Defeated;
        emit ProposalCancelled(_proposalId);
    }

    function withdrawFromProposal(uint256 _proposalId) external nonReentrant onlyRole(ADMIN_ROLE) {
        _withdrawFromProposal(_proposalId);
        emit ProposalCancelled(_proposalId);
    }

    function _withdrawFromProposal(uint256 _proposalId) internal {
        Proposal storage proposal = _proposals[_proposalId];
        require(proposal.state == ProposalState.Executed, "Proposal not executed");

        uint256 strategyId = proposal.strategyId;
        require(strategyId < strategies.length, "No such strategy");

        StrategyInfo storage strategy = strategies[strategyId];
        address strategyAddress = strategy.strategy;
        require(strategyAddress != address(0), "Invalid strategy address");

        uint256 amount = proposal.amount;
        require(amount > 0, "Zero amount");

        IStrategy(strategyAddress).withdraw(amount);

        proposal.state = ProposalState.Closed;
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        uint256 strategyId,
        uint256 amount,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTimestamp,
        uint256 endTimestamp,
        uint256 votingPeriodMinutes,
        ProposalState state,
        string memory description,
        string memory title
    ) {
        Proposal storage p = _proposals[_proposalId];
        require(p.id != 0, "Invalid proposal");
        id = p.id;
        proposer = p.proposer;
        strategyId = p.strategyId;
        amount = p.amount;
        forVotes = p.forVotes;
        againstVotes = p.againstVotes;
        startTimestamp = p.startTimestamp;
        endTimestamp = p.endTimestamp;
        votingPeriodMinutes = p.votingPeriod;
        state = p.state;
        description = p.description;
        title = p.title;
    }

    function getProposalCancel(uint256 _proposalId, address _user) external view returns (
        uint256 cancelForVotes,
        uint256 cancelAgainstVotes,
        bool cancelActive,
        uint256 cancelStartTimestamp,
        uint256 cancelEndTimestamp,
        bool votedCancel
    ) {
        Proposal storage p = _proposals[_proposalId];
        require(p.id != 0, "Invalid proposal");

        cancelForVotes = p.cancelForVotes;
        cancelAgainstVotes = p.cancelAgainstVotes;
        cancelActive = p.cancelActive;
        cancelStartTimestamp = p.cancelStartTimestamp;
        cancelEndTimestamp = p.cancelEndTimestamp;
        votedCancel = _user != address(0) ? p.hasVotedCancel[_user] : false;
    }

    function hasVoted(uint256 _proposalId, address _user) external view returns (bool) {
        Proposal storage p = _proposals[_proposalId];
        if (p.id == 0) return false;
        return p.hasVoted[_user];
    }

    function getStrategy(uint256 _strategyId) external view returns (address strategy, bool active, uint256 balance, string memory name, string memory description) {
        require(_strategyId < strategies.length, "Invalid id");
        StrategyInfo storage s = strategies[_strategyId];
        strategy = s.strategy;
        active = s.active;
        balance = IStrategy(s.strategy).getBalance();
        name = IStrategy(s.strategy).name();
        description = IStrategy(s.strategy).description();
    }

}


