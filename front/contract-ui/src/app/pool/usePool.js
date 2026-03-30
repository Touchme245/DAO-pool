"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract, BigNumber } from "ethers";
import poolAddressJson from "../../../../contracts/InvestmentPool-contract-address.json";
import poolAbi from "../../../../contracts/InvestmentPool.json";
import tokenAddress from "../../../../contracts/Token-contract-address.json";
import tokenArtifact from "../../../../contracts/Token.json";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";

export default function usePool() {
    const { account, signer } = useWallet();
    const [poolContract, setPoolContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);

    const [totalAssets, setTotalAssets] = useState("0");
    const [onContract, setOnContract] = useState("0");
    const [inStrategies, setInStrategies] = useState("0");
    const [userShares, setUserShares] = useState("0");
    const [userBase, setUserBase] = useState("0");

    const [depositAmount, setDepositAmount] = useState("");
    const [redeemAmount, setRedeemAmount] = useState("");
    const [txStatus, setTxStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // --- Инициализация контрактов ---
    useEffect(() => {
        if (!signer) return;

        const pool = new Contract(
            poolAddressJson.InvestmentPool,
            poolAbi.abi,
            signer,
        );
        const token = new Contract(
            tokenAddress.Token,
            tokenArtifact.abi,
            signer,
        );

        setPoolContract(pool);
        setTokenContract(token);
    }, [signer]);

    // --- Получение всех балансов ---
    const fetchBalances = useCallback(async () => {
        if (!poolContract || !tokenContract || !account) return;

        try {
            const [total, onContr, shares, supply, fees] = await Promise.all([
                poolContract.totalAssets(),
                tokenContract.balanceOf(poolAddressJson.InvestmentPool),
                poolContract.balanceOf(account),
                poolContract.totalSupply(),
                poolContract.feeCollected(),
            ]);

            const totalBN =
                BigInt(total.toString()) / BigInt("1000000000000000000");
            const onContrBN =
                (BigInt(onContr.toString()) - BigInt(fees.toString())) /
                BigInt("1000000000000000000");
            const sharesBN =
                BigInt(shares.toString()) / BigInt("1000000000000000000");
            const supplyBN =
                BigInt(supply.toString() || 1n) / BigInt("1000000000000000000");

            setTotalAssets(totalBN.toString());
            setOnContract(onContrBN.toString());
            setInStrategies((totalBN - onContrBN).toString());
            setUserShares(sharesBN.toString());

            const userTokenValue =
                supplyBN > 0n ? (totalBN * sharesBN) / supplyBN : 0n;
            setUserBase(userTokenValue < 1n ? "<1" : userTokenValue.toString());
        } catch (error) {
            console.error("Failed to fetch balances", error);
            setTotalAssets("0");
            setOnContract("0");
            setInStrategies("0");
            setUserShares("0");
            setUserBase("0");
        }
    }, [poolContract, tokenContract, account]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    // --- Депозит ---
    const handleDeposit = async () => {
        if (!depositAmount || depositAmount.toString().trim() === "") {
            setErrorMessage("Введите сумму для депозита.");
            return;
        }

        const amount = ethers.parseUnits(depositAmount, 18);
        console.log(amount);
        try {
            setTxStatus("");
            setErrorMessage("");

            const userBalance = await tokenContract.balanceOf(account);
            if (BigInt(amount) > BigInt(userBalance.toString())) {
                setErrorMessage("Недостаточно токенов на балансе.");
                return;
            }

            setTxStatus("Отправка approve...");
            const approveTx = await tokenContract.approve(
                poolAddressJson.InvestmentPool,
                amount,
            );
            await approveTx.wait();

            setTxStatus("Отправка депозита...");
            const tx = await poolContract.deposit(amount);
            await tx.wait();

            setTxStatus("Deposit подтверждён!");
            setDepositAmount("");
            await fetchBalances();
        } catch (error) {
            console.error(error);
            setTxStatus("Deposit не удался.");
            setErrorMessage(
                error?.reason || "Ошибка при выполнении транзакции.",
            );
        }
    };

    // --- Вывод ---
    const handleRedeem = async () => {
        console.log("yfxfkj зашли на вывод");
        if (!redeemAmount || redeemAmount.toString().trim() === "") {
            setErrorMessage("Введите сумму для вывода.");
            return;
        }

        try {
            console.log("зашли на вывод");
            setTxStatus("");
            setErrorMessage("");

            const userSharesBN = await poolContract.balanceOf(account);
            const amount = ethers.parseUnits(redeemAmount, 18);
            console.log("запррашиваем на вывод");
            console.log(amount);
            if (BigInt(amount) > BigInt(userSharesBN.toString())) {
                setErrorMessage("Недостаточно долей IPS для вывода.");
                return;
            }

            setTxStatus("Отправка вывода...");
            const tx = await poolContract.randeem(amount);
            await tx.wait();

            setTxStatus("Вывод подтверждён!");
            setRedeemAmount("");
            await fetchBalances();
        } catch (error) {
            console.error(error);
            setTxStatus("Redeem не удался.");
            setErrorMessage(
                error?.reason || "Ошибка при выполнении транзакции.",
            );
        }
    };

    return {
        account,
        totalAssets,
        onContract,
        inStrategies,
        userShares,
        userBase,
        depositAmount,
        redeemAmount,
        setDepositAmount,
        setRedeemAmount,
        handleDeposit,
        handleRedeem,
        txStatus,
        errorMessage,
        refreshBalances: fetchBalances,
    };
}
