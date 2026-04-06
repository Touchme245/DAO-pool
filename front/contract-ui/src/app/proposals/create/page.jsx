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
                description,
            );
            router.push("/proposals");
        } catch {}
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto mt-12 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                            <h2 className="text-white text-lg mb-3">
                                Как это работает
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Создайте предложение для DAO. Укажите стратегию,
                                сумму инвестиций и период голосования.
                            </p>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Подсказки</h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>• Выбирайте активную стратегию</li>
                                <li>• Указывайте реальную сумму</li>
                                <li>• Давайте понятное описание</li>
                                <li>• Голосование влияет на DAO</li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg">
                            <h1 className="text-3xl font-bold text-white mb-6">
                                Создать предложение
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Заголовок"
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Описание"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />

                                <select
                                    value={strategyId}
                                    onChange={(e) =>
                                        setStrategyId(e.target.value)
                                    }
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                                    required
                                >
                                    <option value="">Выберите стратегию</option>

                                    {strategies.length === 0 && (
                                        <option disabled>
                                            Стратегии не загружены
                                        </option>
                                    )}

                                    {strategies
                                        .filter((s) => s.active)
                                        .map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                </select>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        placeholder="Сумма"
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                                        required
                                    />

                                    <input
                                        type="number"
                                        value={votingPeriod}
                                        onChange={(e) =>
                                            setVotingPeriod(e.target.value)
                                        }
                                        placeholder="Период (мин)"
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition"
                                >
                                    Создать предложение
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}
