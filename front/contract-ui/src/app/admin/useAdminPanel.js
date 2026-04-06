"use client";

import { useState, useEffect } from "react";
import { Contract } from "ethers";
import poolAbi from "../../../../contracts/InvestmentPool.json";
import poolAddressJson from "../../../../contracts/InvestmentPool-contract-address.json";
import { useWallet } from "../context/WalletContext";

export default function useAdminPanel() {
    const { signer, account } = useWallet();

    const [contract, setContract] = useState(null);
    const [withdrawalFee, setWithdrawalFee] = useState("0");
    const [feeCollected, setFeeCollected] = useState("0");

    const [roles, setRoles] = useState({ isAdmin: false });
    const [loading, setLoading] = useState(false);
    const [txStatus, setTxStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!signer) return;
        const c = new Contract(
            poolAddressJson.InvestmentPool,
            poolAbi.abi,
            signer,
        );
        setContract(c);
    }, [signer]);

    useEffect(() => {
        const checkRoles = async () => {
            if (!contract || !account) return;
            try {
                const ADMIN_ROLE = await contract.ADMIN_ROLE();

                const [isAdmin] = await Promise.all([
                    contract.hasRole(ADMIN_ROLE, account),
                ]);

                setRoles({ isAdmin });
            } catch (err) {
                console.error("Failed to fetch roles:", err);
            }
        };
        checkRoles();
    }, [contract, account]);

    const fetchData = async () => {
        if (!contract) return;
        setLoading(true);
        try {
            const fee = await contract.withdrawalFeePercent();

            const collected = await contract.feeCollected();
            console.log(collected);
            const collectedBN = collected.toString() / 1000000000000000000;
            console.log(collected);
            setWithdrawalFee(fee);
            setFeeCollected(collectedBN.toString());
        } catch (e) {
            console.error("Admin fetch error:", e);
            setErrorMessage("Ошибка загрузки параметров");
        } finally {
            setLoading(false);
        }
    };

    const setWithdrawalFeePercent = async (percent) => {
        if (!contract) return;
        try {
            setTxStatus("Обновление комиссии...");
            const tx = await contract.setWithdrawalFeePercent(percent);
            await tx.wait();
            setTxStatus("Комиссия обновлена ✅");
            await fetchData();
        } catch (e) {
            console.error("Set fee error:", e);
            setErrorMessage(e?.reason || "Ошибка изменения комиссии");
            setTxStatus("");
        }
    };

    const withdrawCollectedFees = async (amount) => {
        if (!contract) return;
        try {
            setTxStatus("Вывод комиссий...");
            const amountBN = BigInt(amount.toString());
            const tx = await contract.withdrawCollectedFees(
                amountBN * BigInt("1000000000000000000"),
            );
            await tx.wait();
            setTxStatus("Комиссии выведены ✅");
            await fetchData();
        } catch (e) {
            console.error("Withdraw fee error:", e);
            setErrorMessage(e?.reason || "Ошибка вывода комиссий");
            setTxStatus("");
        }
    };

    useEffect(() => {
        if (contract) fetchData();
    }, [contract]);

    return {
        withdrawalFee,
        feeCollected,
        fetchData,
        setWithdrawalFeePercent,
        withdrawCollectedFees,
        roles,
        loading,
        txStatus,
        errorMessage,
    };
}
