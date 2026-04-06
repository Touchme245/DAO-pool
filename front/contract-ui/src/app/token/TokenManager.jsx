"use client";

import React, { useState } from "react";
import useToken from "./useToken";
import Layout from "../components/Layout";

export default function TokenManager() {
    const { account, balance, price, supply, marketCap, txStatus, buy, sell } =
        useToken();

    const [activeTab, setActiveTab] = useState("buy");
    const [amount, setAmount] = useState("");

    if (!account) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg mt-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Обмен токена
                    </h1>
                    <p className="text-gray-300">
                        Подключите кошелёк, чтобы начать работу
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
                            <h2 className="text-white text-lg mb-3">Кошелёк</h2>
                            <p className="text-gray-400 text-sm">Адрес</p>
                            <p className="text-white break-all text-sm">
                                {account}
                            </p>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-4">Ваши данные</h2>
                            <Stat label="Баланс" value={balance} />
                            <Stat label="Цена токена (ETH)" value={price} />
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">
                                Как это работает
                            </h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>• Цена токена фиксирована</li>
                                <li>• Покупка и продажа без проскальзывания</li>
                                <li>
                                    • Обмен происходит напрямую с контрактом
                                </li>
                                <li>• Ликвидность обеспечивается системой</li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <Stat label="Цена" value={price} />
                            <Stat label="Общее предложение" value={supply} />
                            <Stat label="Капитализация" value={marketCap} />
                            <Stat label="Ваш баланс" value={balance} />
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg">
                            <div className="flex justify-center mb-6 space-x-4">
                                <button
                                    className={`px-6 py-2 rounded-xl font-semibold ${
                                        activeTab === "buy"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                    onClick={() => setActiveTab("buy")}
                                >
                                    Купить
                                </button>

                                <button
                                    className={`px-6 py-2 rounded-xl font-semibold ${
                                        activeTab === "sell"
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                    onClick={() => setActiveTab("sell")}
                                >
                                    Продать
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    activeTab === "buy"
                                        ? buy(amount)
                                        : sell(amount);
                                }}
                                className="flex flex-col items-center space-y-4"
                            >
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={
                                        activeTab === "buy"
                                            ? "Сумма в ETH"
                                            : "Количество токенов"
                                    }
                                    className="px-4 py-3 rounded-lg bg-gray-800 text-white w-full max-w-md text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />

                                <button
                                    type="submit"
                                    className={`px-10 py-3 font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all ${
                                        activeTab === "buy"
                                            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                                            : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                                    }`}
                                >
                                    {activeTab === "buy"
                                        ? "Купить токены"
                                        : "Продать токены"}
                                </button>
                            </form>

                            {txStatus && (
                                <p className="text-center text-yellow-400 mt-4">
                                    {txStatus}
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6 text-gray-300 text-sm">
                            <p>
                                Этот токен использует модель фиксированной цены.
                                Вы можете покупать и продавать его по одной и
                                той же стоимости без проскальзывания.
                            </p>
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
            <p className="text-purpleLight font-semibold text-lg">
                {value ?? "Loading..."}
            </p>
        </div>
    );
}
