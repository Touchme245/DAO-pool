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

    const [activeTab, setActiveTab] = useState("deposit"); // "deposit" или "redeem"

    if (!account) {
        return (
            <Layout>
                <div className="max-w-lg mx-auto bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg mt-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Пул ликвидности
                    </h1>
                    <p className="text-gray-300">
                        Connect your wallet to manage the pool
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto mt-12 space-y-6">
                {/* --- Балансы --- */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-900/40 backdrop-blur-md rounded-xl p-4 text-center shadow-lg">
                        <p className="text-gray-300 text-sm">Ваши доли IPS</p>
                        <p className="text-white font-bold text-lg">
                            {userShares ?? "Loading..."}
                        </p>
                        <p className="text-gray-400 text-xs">
                            Эквивалентная сумма в базовом токене пула:{" "}
                            {userBase ?? "Loading..."}
                        </p>
                    </div>
                    <div className="bg-green-900/40 backdrop-blur-md rounded-xl p-4 text-center shadow-lg">
                        <p className="text-gray-300 text-sm">В пуле</p>
                        <p className="text-white font-bold text-lg">
                            {onContract ?? "Loading..."}
                        </p>
                    </div>
                    <div className="bg-purple-900/40 backdrop-blur-md rounded-xl p-4 text-center shadow-lg">
                        <p className="text-gray-300 text-sm">В стратегиях</p>
                        <p className="text-white font-bold text-lg">
                            {inStrategies ?? "Loading..."}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    {/* --- Таб переключения --- */}
                    <div className="flex justify-center mb-4 space-x-4">
                        <button
                            className={`px-6 py-2 rounded-xl font-semibold ${
                                activeTab === "deposit"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300"
                            }`}
                            onClick={() => setActiveTab("deposit")}
                        >
                            Пополнить
                        </button>
                        <button
                            className={`px-6 py-2 rounded-xl font-semibold ${
                                activeTab === "redeem"
                                    ? "bg-red-500 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300"
                            }`}
                            onClick={() => setActiveTab("redeem")}
                        >
                            Вывести
                        </button>
                    </div>

                    {/* --- Контент блока --- */}
                    {activeTab === "deposit" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleDeposit();
                            }}
                            className="flex flex-col items-center space-y-3"
                        >
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={depositAmount}
                                onChange={(e) =>
                                    setDepositAmount(e.target.value)
                                }
                                placeholder="Сумма для депозита"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                Пополнить
                            </button>
                        </form>
                    )}

                    {activeTab === "redeem" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRedeem();
                            }}
                            className="flex flex-col items-center space-y-3"
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
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                Вывести
                            </button>
                        </form>
                    )}

                    {/* --- Статус и ошибки --- */}
                    {txStatus && (
                        <p className="text-center text-yellow-400 mt-3">
                            {txStatus}
                        </p>
                    )}
                    {errorMessage && (
                        <p className="text-center text-red-500 mt-3">
                            {errorMessage}
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
