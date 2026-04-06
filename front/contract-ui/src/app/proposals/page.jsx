"use client";

import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import usePoolGovernance from "./usePoolGovernance";

const STATUS_LABELS = {
    0: "Активно",
    1: "Отклонено",
    2: "Принято",
    3: "Исполнено",
    4: "Закрыто",
};

export default function ProposalsPage() {
    const { proposals, loading } = usePoolGovernance();
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredProposals =
        statusFilter === "all"
            ? proposals
            : proposals.filter((p) => String(p.state) === statusFilter);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto mt-12 px-6 space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Предложения DAO
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Голосуйте за изменения и управляйте пулом через DAO
                        </p>
                    </div>

                    <Link
                        href="/proposals/create"
                        className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition text-center"
                    >
                        + Создать предложение
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        active={statusFilter === "all"}
                        onClick={() => setStatusFilter("all")}
                        label="Все"
                    />

                    {Object.entries(STATUS_LABELS).map(([id, label]) => (
                        <FilterButton
                            key={id}
                            active={statusFilter === id}
                            onClick={() => setStatusFilter(id)}
                            label={label}
                        />
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {loading && (
                        <p className="text-gray-400 col-span-full text-center">
                            Загрузка...
                        </p>
                    )}

                    {!loading && filteredProposals.length === 0 && (
                        <p className="text-gray-400 col-span-full text-center">
                            Предложений пока нет
                        </p>
                    )}

                    {filteredProposals.map((p) => (
                        <Link
                            key={p.id}
                            href={`/proposals/${p.id}`}
                            className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:bg-gray-800/60 transition flex flex-col justify-between"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">
                                    {p.title}
                                </h2>

                                <p className="text-gray-400 text-sm">
                                    Дата создания:{" "}
                                    {new Date(
                                        p.startTimestamp * 1000,
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <span
                                    className={`px-4 py-1 rounded-full text-sm ${
                                        p.state === 0
                                            ? "bg-green-500/20 text-green-300"
                                            : p.state === 2
                                            ? "bg-blue-500/20 text-blue-300"
                                            : p.state === 1
                                            ? "bg-red-500/20 text-red-300"
                                            : "bg-gray-700 text-gray-300"
                                    }`}
                                >
                                    {STATUS_LABELS[p.state]}
                                </span>

                                <span className="text-gray-500 text-sm">
                                    ID: {p.id}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

function FilterButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                active
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
        >
            {label}
        </button>
    );
}
