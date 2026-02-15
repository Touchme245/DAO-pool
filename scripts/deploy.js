const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require("fs");
const path = require("path");

async function main() {
    if (network.name === "hardhat") {
        console.warn(
            "You are trying to deploy a contract to the Hardhat Network, which" +
                "gets automatically created and destroyed every time. Use the Hardhat" +
                " option '--network localhost'",
        );
    }

    const [deployer] = await ethers.getSigners();

    console.log("Deploying with", await deployer.getAddress());

    const Token = await ethers.getContractFactory("Token", deployer);
    const basePrice = ethers.parseEther("0.1");
    const slope = ethers.parseEther("0.00018");

    const token = await Token.deploy();
    await token.waitForDeployment();

    const token_address = await token.getAddress();

    const Dao = await ethers.getContractFactory("InvestmentPool", deployer);
    const dao = await Dao.deploy(token_address);

    const Strategy = await ethers.getContractFactory("BaseStrategy", deployer);
    const strategy = await Strategy.deploy(token_address);

    await dao.waitForDeployment();
    await strategy.waitForDeployment();

    const strategyAddress = await strategy.getAddress();
    const amount = 10000;

    await token.mintForStrategy(strategyAddress, amount);
    console.log("Transfered", amount, "to strategy");

    const stratBal = await strategy.getBalance();
    console.log("Public Strategy balance:", stratBal);
    const privateStrategyBakance = await token.balanceOf(strategyAddress);
    console.log("Private Strategy balance:", privateStrategyBakance);

    await saveFrontendFiles({
        Token: token,
        InvestmentPool: dao,
        BaseStrategy: strategy,
    });
}

async function saveFrontendFiles(contracts) {
    const contractsDir = path.join(__dirname, "/..", "front/contracts");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    Object.entries(contracts).forEach(async (contract_item) => {
        const [name, contract] = contract_item;

        if (contract) {
            const address = await contract.getAddress();
            fs.writeFileSync(
                path.join(contractsDir, "/", name + "-contract-address.json"),
                JSON.stringify({ [name]: address }, undefined, 2),
            );
        }

        const ContractArtifact = hre.artifacts.readArtifactSync(name);

        fs.writeFileSync(
            path.join(contractsDir, "/", name + ".json"),
            JSON.stringify(ContractArtifact, null, 2),
        );

        console.log("Successfully deployed");
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
