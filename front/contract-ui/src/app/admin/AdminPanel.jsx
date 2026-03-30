"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import useAdminPanel from "./useAdminPanel";

export default function AdminPanel() {
    const {
        withdrawalFee,
        feeCollected,
        fetchData,
        setWithdrawalFeePercent,
        withdrawCollectedFees,
        roles,
        loading,
        txStatus,
        errorMessage,
    } = useAdminPanel();

    const [newFee, setNewFee] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    if (!roles.isAdmin) {
        return (
            <Layout>
                <div className="text-center text-red-400 mt-20 text-xl">
                    ❌ У вас нет прав администратора
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto mt-12 p-6 space-y-6 text-white">
                <h1 className="text-2xl font-semibold text-center">
                    ⚙️ Админ-панель пула
                </h1>

                {/* Текущие параметры */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-5 shadow-lg">
                    <h2 className="text-lg font-medium mb-3">
                        Текущие параметры пула
                    </h2>

                    {loading ? (
                        <p className="text-gray-400">Загрузка...</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-300">
                                <b>Текущая комиссия на вывод:</b>{" "}
                                {withdrawalFee}%
                            </p>
                            <p className="text-gray-300">
                                <b>Накопленные комиссии:</b> {feeCollected}{" "}
                                токенов
                            </p>
                        </div>
                    )}
                </div>

                {/* Изменение комиссии */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-5 shadow-lg space-y-3">
                    <h2 className="text-lg font-medium">
                        Изменить комиссию на вывод
                    </h2>

                    <input
                        type="number"
                        placeholder="Процент (0–100)"
                        value={newFee}
                        onChange={(e) => setNewFee(e.target.value)}
                        className="bg-gray-800 rounded px-3 py-2 text-white"
                    />

                    <button
                        onClick={() => setWithdrawalFeePercent(newFee)}
                        className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold w-full"
                    >
                        Обновить комиссию
                    </button>
                </div>

                {/* Вывод накопленных комиссий */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-5 shadow-lg space-y-3">
                    <h2 className="text-lg font-medium">
                        Вывести собранные комиссии
                    </h2>

                    <p className="text-gray-300 mb-1">
                        Максимум: {feeCollected}
                    </p>

                    <input
                        type="number"
                        placeholder="Сумма вывода"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-gray-800 rounded px-3 py-2 text-white"
                    />

                    <button
                        onClick={() => withdrawCollectedFees(withdrawAmount)}
                        className="bg-purple-600 hover:bg-purple-700 py-2 rounded font-semibold w-full"
                    >
                        Вывести комиссии
                    </button>
                </div>

                {txStatus && (
                    <p className="text-yellow-400 text-center mt-3">
                        {txStatus}
                    </p>
                )}

                {errorMessage && (
                    <p className="text-red-400 text-center mt-3">
                        {errorMessage}
                    </p>
                )}
            </div>
        </Layout>
    );
}
