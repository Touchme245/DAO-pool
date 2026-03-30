"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import usePoolGovernance from "../usePoolGovernance";

export default function CreateProposalPage() {
    const router = useRouter();

    const {
        strategies = [],
        createProposal,
        txStatus,
        errorMessage,
    } = usePoolGovernance();

    const [strategyId, setStrategyId] = useState("");
    const [amount, setAmount] = useState("");
    const [votingPeriod, setVotingPeriod] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createProposal(
                strategyId,
                amount,
                votingPeriod,
                title,
                description
            );
            router.push("/proposals");
        } catch {}
    };

    return (
        <Layout>
            <div className="max-w-xl mx-auto mt-12 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    Создать предложение
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Заголовок"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Описание"
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                        required
                    />

                    <select
                        value={strategyId}
                        onChange={(e) => setStrategyId(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                        required
                    >
                        <option value="">Выберите стратегию</option>

                        {strategies.length === 0 && (
                            <option disabled>Стратегии не загружены</option>
                        )}

                        {strategies
                            .filter((s) => s.active)
                            .map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                    </select>

                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Сумма"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                        required
                    />

                    <input
                        type="number"
                        value={votingPeriod}
                        onChange={(e) => setVotingPeriod(e.target.value)}
                        placeholder="Период голосования (мин)"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition"
                    >
                        Создать
                    </button>

                    {txStatus && (
                        <p className="text-yellow-400 text-center">
                            {txStatus}
                        </p>
                    )}

                    {errorMessage && (
                        <p className="text-red-500 text-center">
                            {errorMessage}
                        </p>
                    )}
                </form>
            </div>
        </Layout>
    );
}
