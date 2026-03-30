"use client";

import React from "react";
import Link from "next/link";
import {
    FiArrowRight,
    FiDatabase,
    FiUsers,
    FiTrendingUp,
    FiShield,
    FiLayers,
} from "react-icons/fi";

import Layout from "./components/Layout";

const features = [
    {
        icon: FiTrendingUp,
        title: "Инвестиционные стратегии",
        description:
            "Инвестируйте токены в стратегии, управляемые стратегами DAO.",
    },
    {
        icon: FiUsers,
        title: "Управление DAO",
        description:
            "Сообщество голосует за новые стратегии, изменения протокола и развитие проекта.",
    },
    {
        icon: FiShield,
        title: "Полная прозрачность",
        description:
            "Все операции происходят в смарт-контрактах и полностью проверяемы.",
    },
];

const steps = [
    {
        icon: FiDatabase,
        title: "1. Подключите кошелек",
        description: "Подключите MetaMask или другой Web3 кошелек.",
    },
    {
        icon: FiLayers,
        title: "2. Внесите токены",
        description: "Депонируйте токены в инвестиционный пул.",
    },
    {
        icon: FiTrendingUp,
        title: "3. Получайте доход",
        description: "Ваши средства участвуют в стратегиях и приносят доход.",
    },
];

export default function HomeView({ account }) {
    return (
        <Layout>
            {/* HERO */}
            <section className="flex flex-col items-center text-center mt-20 px-6 gap-8">
                <h1 className="text-5xl md:text-6xl font-bold text-purpleLight flex items-center gap-3">
                    <FiDatabase />
                    DAO Invest Pool
                </h1>

                <p className="text-gray-300 text-lg md:text-xl max-w-3xl">
                    Децентрализованный инвестиционный пул, управляемый
                    сообществом. Участвуйте в стратегиях, голосуйте за
                    предложения и помогайте формировать будущее DeFi.
                </p>

                {!account && (
                    <p className="text-purpleLight text-lg">
                        Подключите кошелек чтобы начать
                    </p>
                )}

                {account && (
                    <Link
                        href="/pool"
                        className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-purpleLight to-purple hover:from-purple hover:to-purpleLight text-white font-semibold rounded-xl shadow-xl transform hover:scale-105 transition duration-300"
                    >
                        Перейти в пул
                        <FiArrowRight className="ml-3 text-xl" />
                    </Link>
                )}
            </section>

            {/* FEATURES */}
            <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="bg-purpleDark/30 rounded-2xl p-8 text-center hover:bg-purpleDark/50 transition duration-300 shadow-lg"
                    >
                        <feature.icon className="mx-auto text-5xl text-purpleLight mb-5" />

                        <h3 className="text-2xl font-semibold text-purpleLight mb-3">
                            {feature.title}
                        </h3>

                        <p className="text-gray-300">{feature.description}</p>
                    </div>
                ))}
            </section>

            {/* HOW IT WORKS */}
            <section className="mt-28 px-6">
                <h2 className="text-4xl font-bold text-center text-purpleLight mb-14">
                    Как это работает
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {steps.map((step) => (
                        <div
                            key={step.title}
                            className="bg-purpleDark/30 rounded-2xl p-8 text-center hover:bg-purpleDark/50 transition shadow-lg"
                        >
                            <step.icon className="mx-auto text-5xl text-purpleLight mb-4" />

                            <h3 className="text-xl font-semibold text-purpleLight mb-2">
                                {step.title}
                            </h3>

                            <p className="text-gray-300">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mt-32 mb-20 flex flex-col items-center text-center gap-6">
                <h2 className="text-4xl font-bold text-purpleLight">
                    Присоединяйтесь к DAO
                </h2>

                <p className="text-gray-300 max-w-xl">
                    Инвестируйте вместе с сообществом и участвуйте в развитии
                    децентрализованных финансов.
                </p>

                {account && (
                    <Link
                        href="/proposals"
                        className="inline-flex items-center px-8 py-4 bg-purple hover:bg-purpleLight text-white font-semibold rounded-xl transition"
                    >
                        Посмотреть предложения
                        <FiArrowRight className="ml-2" />
                    </Link>
                )}
            </section>
        </Layout>
    );
}
