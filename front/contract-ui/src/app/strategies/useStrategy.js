"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract } from "ethers";
import poolAddressJson from "../../../../contracts/InvestmentPool-contract-address.json";
import poolAbi from "../../../../contracts/InvestmentPool.json";
import { useWallet } from "../context/WalletContext";

export default function useStrategy() {
    const { signer, account } = useWallet();
    const [poolContract, setPoolContract] = useState(null);
    const [strategies, setStrategies] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [txStatus, setTxStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!signer) {
            setPoolContract(null);
            setIsAdmin(false);
            return;
        }

        const contract = new Contract(
            poolAddressJson.InvestmentPool,
            poolAbi.abi,
            signer
        );
        setPoolContract(contract);
    }, [signer]);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!poolContract || !account) {
                setIsAdmin(false);
                return;
            }
            try {
                const ADMIN_ROLE = await poolContract.ADMIN_ROLE();
                const result = await poolContract.hasRole(ADMIN_ROLE, account);
                setIsAdmin(result);
            } catch (e) {
                console.error("Failed to check admin role", e);
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, [poolContract, account]);

    const fetchStrategies = useCallback(async () => {
        if (!poolContract) return;

        try {
            const count = await poolContract.strategyCount();
            const list = [];

            for (let i = 0; i < count; i++) {
                const s = await poolContract.getStrategy(i);
                list.push({
                    id: i,
                    address: s[0],
                    active: s[1],
                    balance: s[2].toString(),
                    name: s[3],
                    description: s[4], // <- новое поле
                });
            }

            setStrategies(list.reverse());
        } catch (error) {
            console.error("Fetch strategies error:", error);
            setErrorMessage("Ошибка при загрузке стратегий.");
        }
    }, [poolContract]);

    const addStrategy = async (strategyAddress, description) => {
        if (!poolContract || !isAdmin) return;
        try {
            setTxStatus("Добавление стратегии...");
            const tx = await poolContract.addStrategy(
                strategyAddress,
                description
            );
            await tx.wait();
            setTxStatus("Стратегия успешно добавлена!");
            await fetchStrategies();
        } catch (e) {
            console.error(e);
            setTxStatus("");
            setErrorMessage(e.reason || "Ошибка при добавлении стратегии.");
        }
    };

    const toggleStrategy = async (id, active) => {
        if (!poolContract || !isAdmin) return;
        try {
            setTxStatus("Обновление статуса стратегии...");
            const tx = await poolContract.toggleStrategy(id, active);
            await tx.wait();
            setTxStatus("Статус стратегии обновлён!");
            await fetchStrategies();
        } catch (e) {
            console.error(e);
            setTxStatus("");
            setErrorMessage(e.reason || "Ошибка при обновлении статуса.");
        }
    };

    return {
        strategies,
        fetchStrategies,
        addStrategy,
        toggleStrategy,
        isAdmin,
        txStatus,
        errorMessage,
    };
}
