"use client";

import { useState, useEffect } from "react";
import { Contract, formatEther, formatUnits, parseUnits } from "ethers";
import tokenAddress from "../../../../contracts/Token-contract-address.json";
import tokenArtifact from "../../../../contracts/Token.json";
import { useWallet } from "../context/WalletContext";
import { parseEther } from "ethers";

export default function useToken() {
    const decimals = 18;
    const { account, signer } = useWallet();
    const [contract, setContract] = useState(null);

    const [balance, setBalance] = useState(null);
    const [price, setPrice] = useState(null);
    const [supply, setSupply] = useState(null);
    const [marketCap, setMarketCap] = useState(null);
    const [reserve, setReserve] = useState(null);
    const [txStatus, setTxStatus] = useState("");

    // --- Инициализация контракта ---
    useEffect(() => {
        if (!signer) {
            setContract(null);
            return;
        }

        const tokenContract = new Contract(
            tokenAddress.Token,
            tokenArtifact.abi,
            signer,
        );
        setContract(tokenContract);
    }, [signer]);

    // --- Загрузка данных с контракта ---
    const loadData = async () => {
        if (!contract || !account) return;

        try {
            const info = await contract.getFrontEndInfo(account);

            const userTokensFormatted = formatUnits(info.userTokens, decimals);
            const totalSupplyFormatted = formatUnits(
                info.totalSupplyTokens,
                decimals,
            );

            console.log("User tokens:", userTokensFormatted);
            console.log("Current price:", formatEther(info.price));
            console.log("Total supply:", totalSupplyFormatted);
            console.log("Reserve ETH:", formatEther(info.reserveETH));

            setBalance(Number(userTokensFormatted).toFixed(2));
            setPrice(formatEther(info.price));
            setSupply(Number(totalSupplyFormatted).toFixed(2));
            setReserve(formatEther(info.reserveETH));

            const mc =
                Number(totalSupplyFormatted) * Number(formatEther(info.price));
            setMarketCap(mc.toFixed(2));
        } catch (err) {
            console.error("Load error:", err);
            setTxStatus("Failed to load data!");
        }
    };

    // --- Автообновление данных при изменении контракта или аккаунта ---
    useEffect(() => {
        loadData();
    }, [contract, account]);

    // --- BUY ---
    const buy = async (ethAmount) => {
        if (!contract || !ethAmount) return;

        try {
            setTxStatus("Processing buy...");
            const tx = await contract.buyTokens({
                value: parseEther(ethAmount.toString()),
            });
            await tx.wait();
            setTxStatus("Buy successful!");
            loadData();
        } catch (err) {
            console.error(err);
            setTxStatus("Buy failed!");
        }
    };

    // --- SELL ---
    const sell = async (tokenAmount) => {
        if (!contract || !tokenAmount) return;

        try {
            setTxStatus("Processing sell...");
            const amountBN = parseUnits(tokenAmount.toString(), 18);
            const tx = await contract.sellTokens(amountBN);
            await tx.wait();
            setTxStatus("Sell successful!");
            loadData();
        } catch (err) {
            console.error(err);
            setTxStatus("Sell failed!");
        }
    };

    return {
        account,
        balance,
        price,
        supply,
        marketCap,
        reserve,
        txStatus,
        buy,
        sell,
    };
}
