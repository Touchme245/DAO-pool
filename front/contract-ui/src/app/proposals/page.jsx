"use client";

import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import usePoolGovernance from "./usePoolGovernance";

const STATUS_LABELS = {
    0: "Active",
    1: "Defeated",
    2: "Succeeded",
    3: "Executed",
    4: "Closed",
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
            <div className="max-w-4xl mx-auto mt-12 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">
                        Предложения
                    </h1>

                    <Link
                        href="/proposals/create"
                        className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition"
                    >
                        + Создать предложение
                    </Link>
                </div>

                {/* --- Фильтр --- */}
                <div className="flex space-x-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg"
                    >
                        <option value="all">Все статусы</option>
                        {Object.entries(STATUS_LABELS).map(([id, label]) => (
                            <option key={id} value={id}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Список --- */}
                <div className="space-y-4">
                    {loading && (
                        <p className="text-gray-400 text-center">Загрузка...</p>
                    )}

                    {!loading && filteredProposals.length === 0 && (
                        <p className="text-gray-400 text-center">
                            Предложений нет
                        </p>
                    )}

                    {filteredProposals.map((p) => (
                        <Link
                            key={p.id}
                            href={`/proposals/${p.id}`}
                            className="block bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:bg-gray-800/60 transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {p.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        {new Date(
                                            p.startTimestamp * 1000
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <span className="px-4 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300">
                                    {STATUS_LABELS[p.state]}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
