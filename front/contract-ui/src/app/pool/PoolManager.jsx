"use client";

import React, { useState } from "react";
import usePool from "./usePool";
import Layout from "../components/Layout";

export default function PoolManager() {
    const {
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
    } = usePool();

    const [activeTab, setActiveTab] = useState("deposit");

    if (!account) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg mt-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Пул ликвидности
                    </h1>
                    <p className="text-gray-300">
                        Подключите кошелёк для управления пулом
                    </p>
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
                                Обзор пула
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Вы можете пополнять пул или выводить средства.
                                Ваши средства распределяются по стратегиям и
                                приносят доход.
                            </p>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Ваши позиции</h2>
                            <Stat label="Ваши доли (IPS)" value={userShares} />
                            <Stat
                                label="Эквивалент в базовом токене"
                                value={userBase}
                            />
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Подсказки</h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>
                                    • Пополнение увеличивает вашу долю в пуле
                                </li>
                                <li>• Вывод сжигает ваши доли</li>
                                <li>• Доход зависит от стратегий</li>
                                <li>• Средства автоматически распределяются</li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <Stat label="Общие активы" value={totalAssets} />
                            <Stat label="В пуле" value={onContract} />
                            <Stat label="В стратегиях" value={inStrategies} />
                            <Stat label="Ваши доли" value={userShares} />
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg">
                            <div className="flex justify-center mb-6 space-x-4">
                                <button
                                    className={`px-6 py-2 rounded-xl font-semibold ${
                                        activeTab === "deposit"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                    onClick={() => setActiveTab("deposit")}
                                >
                                    Пополнить
                                </button>

                                <button
                                    className={`px-6 py-2 rounded-xl font-semibold ${
                                        activeTab === "redeem"
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                    onClick={() => setActiveTab("redeem")}
                                >
                                    Вывести
                                </button>
                            </div>

                            {activeTab === "deposit" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleDeposit();
                                    }}
                                    className="flex flex-col items-center space-y-4"
                                >
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={depositAmount}
                                        onChange={(e) =>
                                            setDepositAmount(e.target.value)
                                        }
                                        placeholder="Сумма для пополнения"
                                        className="px-4 py-3 rounded-lg bg-gray-800 text-white w-full max-w-md text-center"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="px-10 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition"
                                    >
                                        Пополнить пул
                                    </button>
                                </form>
                            )}

                            {activeTab === "redeem" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleRedeem();
                                    }}
                                    className="flex flex-col items-center space-y-4"
                                >
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={redeemAmount}
                                        onChange={(e) =>
                                            setRedeemAmount(e.target.value)
                                        }
                                        placeholder="Сумма для вывода"
                                        className="px-4 py-3 rounded-lg bg-gray-800 text-white w-full max-w-md text-center"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="px-10 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold rounded-xl hover:scale-105 transition"
                                    >
                                        Вывести средства
                                    </button>
                                </form>
                            )}

                            {txStatus && (
                                <p className="text-yellow-400 text-center mt-4">
                                    {txStatus}
                                </p>
                            )}

                            {errorMessage && (
                                <p className="text-red-500 text-center mt-4">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-gray-800/60 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-white font-semibold text-lg">
                {value ?? "Загрузка..."}
            </p>
        </div>
    );
}
