"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import usePoolGovernance from "../usePoolGovernance";

const STATE = {
    Active: 0,
    Defeated: 1,
    Succeeded: 2,
    Executed: 3,
    Closed: 4,
};

export default function ProposalDetailsPage() {
    const { id } = useParams();

    const {
        proposals,
        strategies,
        vote,
        finalizeProposal,
        executeProposal,
        startCancelVoting,
        voteCancel,
        finalizeCancelVote,
        loading,
        txStatus,
        errorMessage,
    } = usePoolGovernance();

    const proposal = proposals.find((p) => p.id === id);
    const now = Math.floor(Date.now() / 1000);

    const [cancelPeriod, setCancelPeriod] = useState(10);
    const [finalizedLocally, setFinalizedLocally] = useState(false);
    const [cancelFinalizedLocally, setCancelFinalizedLocally] = useState(false);

    if (loading || !proposal) {
        return (
            <Layout>
                <p className="text-center text-gray-400 mt-12">
                    Загрузка предложения...
                </p>
            </Layout>
        );
    }

    const isActive = proposal.state === STATE.Active;
    const isSucceeded = proposal.state === STATE.Succeeded;
    const isExecuted = proposal.state === STATE.Executed;

    const votingEnded = now > proposal.endTimestamp;
    const alreadyVoted = proposal.voted;

    const cancelActive = proposal.cancelActive;
    const cancelEnded =
        proposal.cancelEndTimestamp && now > proposal.cancelEndTimestamp;
    const alreadyVotedCancel = proposal.votedCancel;

    const strategy = strategies.find(
        (s) => s.id.toString() === proposal.strategyId,
    );
    const strategyName = strategy ? strategy.name : proposal.strategyId;

    const handleFinalize = async () => {
        await finalizeProposal(proposal.id);
        setFinalizedLocally(true);
    };

    const handleFinalizeCancel = async () => {
        await finalizeCancelVote(proposal.id);
        setCancelFinalizedLocally(true);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto mt-12 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-lg space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {proposal.title}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Статус:{" "}
                        <span className="text-blue-400 font-semibold">
                            {proposal.stateStr}
                        </span>
                    </p>
                </div>

                <Section title="Описание">
                    <p className="text-gray-300 whitespace-pre-line">
                        {proposal.description}
                    </p>
                </Section>

                <Section title="Основная информация">
                    <InfoGrid
                        items={[
                            ["Автор", shorten(proposal.proposer)],
                            ["Стратегия", strategyName],
                            ["Сумма", proposal.amount],
                            ["Период голосования (мин)", proposal.votingPeriod],
                        ]}
                    />
                </Section>

                <Section title="Временные рамки">
                    <InfoGrid
                        items={[
                            [
                                "Начало голосования",
                                formatDate(proposal.startTimestamp),
                            ],
                            [
                                "Окончание голосования",
                                formatDate(proposal.endTimestamp),
                            ],
                            [
                                "Голосование завершено",
                                votingEnded ? "Да" : "Нет",
                            ],
                        ]}
                    />
                </Section>

                <Section title="Голосование">
                    <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                label="За"
                                value={proposal.forVotes / 10 ** 18}
                                color="text-green-400"
                            />
                            <StatCard
                                label="Против"
                                value={proposal.againstVotes / 10 ** 18}
                                color="text-red-400"
                            />
                            <StatCard
                                label="Ваш голос"
                                value={alreadyVoted ? "Учтён" : "Не голосовали"}
                                color="text-blue-400"
                            />
                        </div>
                        <div className="text-sm text-gray-400">
                            Окончание голосования:{" "}
                            {formatDate(proposal.endTimestamp)}
                        </div>
                    </div>
                </Section>

                {(cancelActive || proposal.state === STATE.Closed) && (
                    <Section title="Голосование за отмену">
                        <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    label="За отмену"
                                    value={proposal.cancelForVotes / 10 ** 18}
                                    color="text-green-400"
                                />
                                <StatCard
                                    label="Против отмены"
                                    value={
                                        proposal.cancelAgainstVotes / 10 ** 18
                                    }
                                    color="text-red-400"
                                />
                                <StatCard
                                    label="Ваш голос"
                                    value={
                                        alreadyVotedCancel
                                            ? "Учтён"
                                            : "Не голосовали"
                                    }
                                    color="text-blue-400"
                                />
                            </div>

                            <div className="text-sm text-gray-400">
                                Окончание голосования:{" "}
                                {formatDate(proposal.cancelEndTimestamp)}
                            </div>
                        </div>
                    </Section>
                )}

                <Section title="Действия">
                    <div className="space-y-4">
                        {isActive && !votingEnded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ActionButton
                                    disabled={alreadyVoted}
                                    color="green"
                                    onClick={() => vote(proposal.id, true)}
                                >
                                    Голосовать ЗА
                                </ActionButton>

                                <ActionButton
                                    disabled={alreadyVoted}
                                    color="red"
                                    onClick={() => vote(proposal.id, false)}
                                >
                                    Голосовать ПРОТИВ
                                </ActionButton>
                            </div>
                        )}

                        {votingEnded &&
                            !finalizedLocally &&
                            proposal.state !== STATE.Executed &&
                            proposal.state !== STATE.Closed && (
                                <ActionButton
                                    color="blue"
                                    onClick={handleFinalize}
                                >
                                    Завершить голосование
                                </ActionButton>
                            )}

                        {isSucceeded && (
                            <ActionButton
                                color="purple"
                                onClick={() => executeProposal(proposal.id)}
                            >
                                Исполнить предложение
                            </ActionButton>
                        )}

                        {isExecuted && !cancelActive && (
                            <div className="bg-gray-900/60 rounded-xl p-5 space-y-4 border border-gray-700">
                                <div className="flex flex-col md:flex-row md:items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Период голосования (в минутах)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={cancelPeriod}
                                            onChange={(e) =>
                                                setCancelPeriod(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div className="md:w-64">
                                        <ActionButton
                                            color="red"
                                            onClick={() =>
                                                startCancelVoting(
                                                    proposal.id,
                                                    cancelPeriod,
                                                )
                                            }
                                        >
                                            Запустить голосование за отмену
                                        </ActionButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {cancelActive && !cancelEnded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ActionButton
                                    disabled={alreadyVotedCancel}
                                    color="green"
                                    onClick={() =>
                                        voteCancel(proposal.id, true)
                                    }
                                >
                                    За отмену
                                </ActionButton>

                                <ActionButton
                                    disabled={alreadyVotedCancel}
                                    color="red"
                                    onClick={() =>
                                        voteCancel(proposal.id, false)
                                    }
                                >
                                    Против отмены
                                </ActionButton>
                            </div>
                        )}

                        {!!cancelEnded &&
                            !cancelFinalizedLocally &&
                            proposal.state !== STATE.Closed && (
                                <ActionButton
                                    color="blue"
                                    onClick={handleFinalizeCancel}
                                >
                                    Завершить голосование за отмену
                                </ActionButton>
                            )}
                    </div>
                </Section>

                {txStatus && (
                    <p className="text-center text-yellow-400">{txStatus}</p>
                )}
                {errorMessage && (
                    <p className="text-center text-red-500">{errorMessage}</p>
                )}
            </div>
        </Layout>
    );
}

/* UI helpers */

function Section({ title, children }) {
    return (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <div className="bg-gray-800/60 rounded-xl p-4">{children}</div>
        </div>
    );
}

function InfoGrid({ items }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(([label, value], i) => (
                <div
                    key={i}
                    className="flex justify-between bg-gray-900/60 rounded-lg px-4 py-2"
                >
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                </div>
            ))}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700">
            <span className="text-sm text-gray-400">{label}</span>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function ActionButton({ children, onClick, disabled, color }) {
    const colors = {
        green: "bg-green-500",
        red: "bg-red-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        gray: "bg-gray-600",
    };

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-full py-3 rounded-xl font-bold text-white ${
                colors[color]
            } ${
                disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:scale-105 transition"
            }`}
        >
            {children}
        </button>
    );
}

function formatDate(ts) {
    if (!ts) return "-";
    return new Date(ts * 1000).toLocaleString();
}

function shorten(addr) {
    if (!addr) return "-";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
