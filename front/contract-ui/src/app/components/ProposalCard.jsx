import Link from "next/link";

export default function ProposalCard({ proposal }) {
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between">
                <div>
                    <p className="text-sm text-gray-400">
                        #{proposal.id} · Стратегия {proposal.strategyId}
                    </p>
                    <p className="font-semibold">
                        {proposal.description || "Без описания"}
                    </p>
                </div>

                <span className="text-sm text-blue-400">
                    {proposal.stateStr}
                </span>
            </div>

            <div className="mt-3 flex justify-between items-center text-sm text-gray-400">
                <div>
                    👍 {proposal.forVotes} | 👎 {proposal.againstVotes}
                </div>

                <Link
                    href={`/proposals/${proposal.id}`}
                    className="text-blue-400 hover:underline"
                >
                    Подробнее →
                </Link>
            </div>
        </div>
    );
}
