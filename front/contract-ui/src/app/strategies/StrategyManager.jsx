"use client";

import React, { useState, useEffect } from "react";
import useStrategy from "./useStrategy";
import Layout from "../components/Layout";

export default function StrategyManager() {
    const {
        strategies,
        fetchStrategies,
        addStrategy,
        toggleStrategy,
        txStatus,
        errorMessage,
        isAdmin,
    } = useStrategy();

    const [newAddress, setNewAddress] = useState("");
    const [newDescription, setNewDescription] = useState("");

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    return (
        <Layout>
            <div className="max-w-3xl mx-auto mt-12 space-y-6">
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                    <h1 className="text-2xl font-bold text-white mb-4 text-center">
                        Управление стратегиями
                    </h1>

                    {isAdmin && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await addStrategy(newAddress, newDescription);
                                setNewAddress("");
                                setNewDescription("");
                            }}
                            className="flex flex-col items-center space-y-3"
                        >
                            <input
                                type="text"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="Адрес стратегии"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />

                            <textarea
                                value={newDescription}
                                onChange={(e) =>
                                    setNewDescription(e.target.value)
                                }
                                placeholder="Описание стратегии"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-2/3 text-center h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />

                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                Добавить стратегию
                            </button>
                        </form>
                    )}

                    {/* --- Список стратегий --- */}
                    <div className="mt-6 space-y-4">
                        {strategies.map((s) => (
                            <div
                                key={s.id}
                                className="bg-gray-800/50 rounded-xl p-4 shadow-lg flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-white font-semibold">
                                        #{s.id} — {s.name}
                                    </p>

                                    <p className="text-gray-400 text-sm break-all">
                                        {s.address}
                                    </p>

                                    <p className="text-gray-400 text-sm">
                                        Баланс: {s.balance}
                                    </p>

                                    {/* новое поле */}
                                    <p className="text-gray-300 text-sm mt-1 italic">
                                        {s.description}
                                    </p>

                                    <p
                                        className={`text-sm mt-1 ${
                                            s.active
                                                ? "text-green-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {s.active ? "Активна" : "Выключена"}
                                    </p>
                                </div>

                                {isAdmin && (
                                    <button
                                        onClick={() =>
                                            toggleStrategy(s.id, !s.active)
                                        }
                                        className={`px-4 py-2 rounded-lg font-semibold ${
                                            s.active
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-green-600 hover:bg-green-700"
                                        } text-white`}
                                    >
                                        {s.active ? "Выключить" : "Включить"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {txStatus && (
                        <p className="text-center text-yellow-400 mt-4">
                            {txStatus}
                        </p>
                    )}
                    {errorMessage && (
                        <p className="text-center text-red-500 mt-2">
                            {errorMessage}
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
