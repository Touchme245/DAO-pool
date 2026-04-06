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
    console.log(roles);
    console.log(roles.isAdmin);
    if (!roles.isAdmin) {
        return (
            <Layout>
                <div className="text-center text-red-400 mt-20 text-xl">
                    У вас нет прав администратора
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto mt-12 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                            <h2 className="text-white text-lg mb-3">
                                Админ панель
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Управляйте параметрами пула, комиссиями и
                                контролируйте финансовые потоки DAO.
                            </p>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Ваши права</h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>
                                    • Администратор:{" "}
                                    <span className="text-white">
                                        {roles.isAdmin ? "Да" : "Нет"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Подсказки</h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>• Комиссия влияет на экономику пула</li>
                                <li>• Не ставь слишком высокий процент</li>
                                <li>• Следи за балансом комиссий</li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Stat
                                label="Комиссия на вывод (%)"
                                value={withdrawalFee}
                            />
                            <Stat
                                label="Собранные комиссии"
                                value={feeCollected}
                            />
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 shadow-lg">
                            <h2 className="text-lg font-medium mb-4">
                                Текущие параметры
                            </h2>

                            {loading ? (
                                <p className="text-gray-400">Загрузка...</p>
                            ) : (
                                <div className="space-y-2 text-gray-300">
                                    <p>
                                        Комиссия на вывод:{" "}
                                        <span className="text-white font-semibold">
                                            {withdrawalFee}%
                                        </span>
                                    </p>
                                    <p>
                                        Накопленные комиссии:{" "}
                                        <span className="text-white font-semibold">
                                            {feeCollected}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 shadow-lg space-y-4">
                            <h2 className="text-lg font-medium">
                                Изменить комиссию
                            </h2>

                            <input
                                type="number"
                                placeholder="Процент (0–100)"
                                value={newFee}
                                onChange={(e) => setNewFee(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                            />

                            <button
                                onClick={() => setWithdrawalFeePercent(newFee)}
                                className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl font-semibold hover:scale-105 transition"
                            >
                                Обновить комиссию
                            </button>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 shadow-lg space-y-4">
                            <h2 className="text-lg font-medium">
                                Вывод комиссий
                            </h2>

                            <p className="text-gray-400 text-sm">
                                Доступно: {feeCollected}
                            </p>

                            <input
                                type="number"
                                placeholder="Сумма вывода"
                                value={withdrawAmount}
                                onChange={(e) =>
                                    setWithdrawAmount(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                            />

                            <button
                                onClick={() =>
                                    withdrawCollectedFees(withdrawAmount)
                                }
                                className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl font-semibold hover:scale-105 transition"
                            >
                                Вывести средства
                            </button>
                        </div>

                        {txStatus && (
                            <p className="text-yellow-400 text-center">
                                {txStatus}
                            </p>
                        )}

                        {errorMessage && (
                            <p className="text-red-400 text-center">
                                {errorMessage}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-gray-800/60 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-white font-semibold text-lg">
                {value ?? "Loading..."}
            </p>
        </div>
    );
}
