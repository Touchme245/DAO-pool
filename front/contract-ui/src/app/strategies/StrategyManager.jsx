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
            <div className="max-w-7xl mx-auto mt-12 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                            <h2 className="text-white text-lg mb-3">
                                Стратегии инвестирования
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Стратегии - это контракты, в которые пул
                                размещает средства для получения дохода. Только
                                активные стратегии участвуют в распределении
                                средств.
                            </p>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">
                                Как это работает
                            </h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>
                                    • Пул автоматически распределяет средства
                                </li>
                                <li>
                                    • Активные стратегии получают инвестиции
                                </li>
                                <li>• Неактивные стратегии игнорируются</li>
                                <li>• Доход возвращается обратно в пул</li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/40 rounded-2xl p-6">
                            <h2 className="text-white mb-3">Подсказки</h2>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>
                                    • Добавляйте только проверенные контракты
                                </li>
                                <li>
                                    • Описание помогает понять риск стратегии
                                </li>
                                <li>
                                    • Активные стратегии доступны для
                                    предложений
                                </li>
                                <li>
                                    • DAO голосует за использование стратегий
                                </li>
                            </ul>
                        </div>

                        {isAdmin && (
                            <div className="bg-gray-900/40 rounded-2xl p-6">
                                <h2 className="text-white mb-4">
                                    Добавить стратегию
                                </h2>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        await addStrategy(
                                            newAddress,
                                            newDescription,
                                        );
                                        setNewAddress("");
                                        setNewDescription("");
                                    }}
                                    className="space-y-3"
                                >
                                    <input
                                        type="text"
                                        value={newAddress}
                                        onChange={(e) =>
                                            setNewAddress(e.target.value)
                                        }
                                        placeholder="Адрес контракта стратегии"
                                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
                                        required
                                    />

                                    <textarea
                                        value={newDescription}
                                        onChange={(e) =>
                                            setNewDescription(e.target.value)
                                        }
                                        placeholder="Краткое описание (что делает стратегия)"
                                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white h-24"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl font-semibold hover:scale-105 transition"
                                    >
                                        Добавить стратегию
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <h1 className="text-2xl font-bold text-white">
                            Список стратегий
                        </h1>

                        <div className="grid md:grid-cols-2 gap-6">
                            {strategies.map((s) => (
                                <div
                                    key={s.id}
                                    className="bg-gray-900/50 backdrop-blur rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <p className="text-white font-semibold">
                                            #{s.id} — {s.name}
                                        </p>

                                        <p className="text-gray-400 text-xs break-all">
                                            {s.address}
                                        </p>

                                        <p className="text-gray-300 text-sm">
                                            Баланс: {s.balance}
                                        </p>

                                        <p className="text-gray-400 text-sm italic">
                                            {s.description}
                                        </p>

                                        <p
                                            className={`text-sm ${
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
                                            className={`mt-4 py-2 rounded-lg font-semibold ${
                                                s.active
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                            } text-white`}
                                        >
                                            {s.active
                                                ? "Выключить"
                                                : "Включить"}
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
            </div>
        </Layout>
    );
}
