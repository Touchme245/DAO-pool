"use client";

import React, { useState } from "react";
import useToken from "./useToken";
import Layout from "../components/Layout";

export default function TokenManager() {
    const { account, balance, price, supply, marketCap, txStatus, buy, sell } =
        useToken();
    const [activeTab, setActiveTab] = useState("buy"); // "buy" или "sell"
    const [buyAmount, setBuyAmount] = useState("");
    const [sellAmount, setSellAmount] = useState("");

    if (!account) {
        return (
            <Layout>
                <div className="max-w-lg mx-auto bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg mt-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Token Bonding Curve Exchange
                    </h1>
                    <p className="text-gray-300">
                        Connect your wallet to start trading
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-12 space-y-6">
                {/* --- Статистика --- */}
                <div className="grid grid-cols-2 gap-6 text-center">
                    <Stat label="Your Balance" value={balance} />
                    <Stat label="Current Price (ETH)" value={price} />
                    <Stat label="Total Supply" value={supply} />
                    <Stat label="Market Cap (ETH)" value={marketCap} />
                </div>

                {/* --- Таб переключения --- */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-center mb-4 space-x-4">
                        <button
                            className={`px-6 py-2 rounded-xl font-semibold ${
                                activeTab === "buy"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300"
                            }`}
                            onClick={() => setActiveTab("buy")}
                        >
                            Buy
                        </button>

                        <button
                            className={`px-6 py-2 rounded-xl font-semibold ${
                                activeTab === "sell"
                                    ? "bg-red-500 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300"
                            }`}
                            onClick={() => setActiveTab("sell")}
                        >
                            Sell
                        </button>
                    </div>

                    {/* --- Контент блока --- */}
                    {activeTab === "buy" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                buy(buyAmount);
                            }}
                            className="flex flex-col items-center space-y-3"
                        >
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                placeholder="ETH amount"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                Buy
                            </button>
                        </form>
                    )}

                    {activeTab === "sell" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sell(sellAmount);
                            }}
                            className="flex flex-col items-center space-y-3"
                        >
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={sellAmount}
                                onChange={(e) => setSellAmount(e.target.value)}
                                placeholder="Token amount"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                Sell
                            </button>
                        </form>
                    )}

                    {/* --- Статус транзакции --- */}
                    {txStatus && (
                        <p className="text-center text-yellow-400 mt-3">
                            {txStatus}
                        </p>
                    )}
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
