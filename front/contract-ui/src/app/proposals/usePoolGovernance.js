"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract } from "ethers";
import poolAbi from "../../../../contracts/InvestmentPool.json";
import poolAddressJson from "../../../../contracts/InvestmentPool-contract-address.json";
import { useWallet } from "../context/WalletContext";

export default function usePoolGovernance() {
    const { account, signer } = useWallet();

    const [contract, setContract] = useState(null);

    const [proposals, setProposals] = useState([]);
    const [strategies, setStrategies] = useState([]);

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

    const stateIndexToString = (idx) => {
        const map = ["Active", "Defeated", "Succeeded", "Executed", "Closed"];
        const n = typeof idx === "bigint" ? Number(idx) : Number(idx);
        return map[n] ?? `Unknown(${n})`;
    };

    const fetchStrategies = useCallback(async () => {
        if (!contract) return;

        try {
            const count = Number(await contract.strategyCount());
            const list = [];

            for (let i = 0; i < count; i++) {
                const s = await contract.getStrategy(i);

                list.push({
                    id: i,
                    address: s[0],
                    active: s[1],
                    balance: s[2].toString(),
                    name: s[3],
                    description: s[4],
                });
            }

            setStrategies(list);
        } catch (e) {
            console.error("fetchStrategies error:", e);
        }
    }, [contract]);

    const fetchProposals = useCallback(async () => {
        if (!contract) return;

        setLoading(true);

        try {
            const count = Number(await contract.proposalCount());
            const list = [];

            for (let i = 1; i <= count; i++) {
                const p = await contract.getProposal(i);
                const cancel = await contract.getProposalCancel(
                    i,
                    account || "0x0000000000000000000000000000000000000000",
                );

                const voted = account
                    ? await contract.hasVoted(i, account)
                    : false;

                list.push({
                    id: p[0].toString(),
                    proposer: p[1],
                    strategyId: p[2].toString(),
                    amount: p[3].toString(),
                    forVotes: p[4].toString(),
                    againstVotes: p[5].toString(),
                    startTimestamp: Number(p[6]),
                    endTimestamp: Number(p[7]),
                    votingPeriod: p[8].toString(),
                    state: Number(p[9]),
                    stateStr: stateIndexToString(p[9]),
                    description: p[10],
                    title: p[11],
                    voted,

                    cancelForVotes: cancel.cancelForVotes.toString(),
                    cancelAgainstVotes: cancel.cancelAgainstVotes.toString(),
                    cancelActive: cancel.cancelActive,
                    cancelStartTimestamp: Number(cancel.cancelStartTimestamp),
                    cancelEndTimestamp: Number(cancel.cancelEndTimestamp),
                    votedCancel: cancel.votedCancel,
                });
            }

            setProposals(list.reverse());
        } catch (e) {
            console.error("fetchProposals error:", e);
            setErrorMessage("Не удалось загрузить предложения");
        } finally {
            setLoading(false);
        }
    }, [contract, account]);

    useEffect(() => {
        if (!contract) return;

        fetchStrategies();
        fetchProposals();
    }, [contract, fetchStrategies, fetchProposals]);

    const vote = async (id, support) => {
        try {
            setTxStatus("Голосование...");
            const tx = await contract.vote(BigInt(id), support);
            await tx.wait();
            await fetchProposals();
            setTxStatus("Голос учтён");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка голосования");
        }
    };

    const finalizeProposal = async (id) => {
        try {
            setTxStatus("Завершение голосования...");
            const tx = await contract.finalizeProposal(BigInt(id));
            await tx.wait();
            await fetchProposals();
            setTxStatus("Голосование завершено");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка финализации");
        }
    };

    const executeProposal = async (id) => {
        try {
            setTxStatus("Исполнение предложения...");
            const tx = await contract.executeProposal(BigInt(id));
            await tx.wait();
            await fetchProposals();
            await fetchStrategies();
            setTxStatus("Предложение исполнено");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка исполнения");
        }
    };

    const withdrawFromProposal = async (id) => {
        try {
            setTxStatus("Вывод средств...");
            const tx = await contract.withdrawFromProposal(BigInt(id));
            await tx.wait();
            await fetchProposals();
            await fetchStrategies();
            setTxStatus("Средства выведены");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка вывода");
        }
    };

    const startCancelVoting = async (id, votingPeriod) => {
        try {
            setTxStatus("Запуск голосования за отмену...");
            const tx = await contract.startCancelVoting(
                BigInt(id),
                BigInt(votingPeriod),
            );
            await tx.wait();
            await fetchProposals();
            setTxStatus("Голосование за отмену начато");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка запуска отмены");
        }
    };

    const voteCancel = async (id, support) => {
        try {
            setTxStatus("Голосование за отмену...");
            const tx = await contract.voteCancel(BigInt(id), support);
            await tx.wait();
            await fetchProposals();
            setTxStatus("Голос учтён");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка голосования за отмену");
        }
    };

    const finalizeCancelVote = async (id) => {
        try {
            setTxStatus("Завершение голосования за отмену...");
            const tx = await contract.finalizeCancelVote(BigInt(id));
            await tx.wait();
            await fetchProposals();
            await fetchStrategies();
            setTxStatus("Голосование за отмену завершено");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка финализации отмены");
        }
    };

    const createProposal = async (
        strategyId,
        amount,
        votingPeriod,
        title,
        description,
    ) => {
        if (!contract) {
            setErrorMessage("Контракт не загружен");
            return;
        }

        try {
            setTxStatus("Создание предложения...");

            const strategyIdBn = BigInt(strategyId);
            const amountBn = BigInt(amount);
            const votingPeriodBn = BigInt(votingPeriod);

            const tx = await contract.createProposal(
                strategyIdBn,
                amountBn,
                votingPeriodBn,
                title,
                description,
            );
            await tx.wait();

            await fetchProposals();
            setTxStatus("Предложение создано");
        } catch (e) {
            console.error(e);
            setErrorMessage("Ошибка создания предложения");
        }
    };

    return {
        proposals,
        strategies,
        loading,
        txStatus,
        errorMessage,

        fetchProposals,
        fetchStrategies,

        vote,
        finalizeProposal,
        executeProposal,
        withdrawFromProposal,

        startCancelVoting,
        voteCancel,
        finalizeCancelVote,
        createProposal,
    };
}
