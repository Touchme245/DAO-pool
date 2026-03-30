import usePoolGovernance from "@/hooks/usePoolGovernance";

export default function ProposalDetails({ proposal }) {
    const {
        vote,
        finalizeProposal,
        executeProposal,
        cancelProposal,
        withdrawFromProposal,
        roles,
    } = usePoolGovernance();

    return (
        <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
            <h1 className="text-2xl font-semibold">
                Предложение #{proposal.id}
            </h1>

            <div className="bg-gray-900 rounded-xl p-4 space-y-2">
                <p>{proposal.description}</p>
                <p className="text-sm text-gray-400">
                    Стратегия: {proposal.strategyId}
                </p>
                <p className="text-sm">Статус: {proposal.stateStr}</p>
                <p>
                    👍 {proposal.forVotes} | 👎 {proposal.againstVotes}
                </p>
            </div>

            {proposal.stateStr === "Active" && (
                <div className="flex gap-3">
                    <button
                        onClick={() => vote(proposal.id, true)}
                        className="bg-green-600 px-4 py-2 rounded"
                    >
                        За
                    </button>
                    <button
                        onClick={() => vote(proposal.id, false)}
                        className="bg-red-600 px-4 py-2 rounded"
                    >
                        Против
                    </button>
                </div>
            )}

            {roles.isAdmin && proposal.stateStr === "Active" && (
                <button
                    onClick={() => finalizeProposal(proposal.id)}
                    className="bg-blue-600 px-4 py-2 rounded"
                >
                    Финализировать
                </button>
            )}

            {proposal.stateStr === "Succeeded" && (
                <button
                    onClick={() => executeProposal(proposal.id)}
                    className="bg-purple-600 px-4 py-2 rounded"
                >
                    Исполнить
                </button>
            )}

            {roles.isAdmin && proposal.stateStr === "Executed" && (
                <button
                    onClick={() => withdrawFromProposal(proposal.id)}
                    className="bg-pink-600 px-4 py-2 rounded"
                >
                    Выйти из стратегии
                </button>
            )}

            {roles.isAdmin &&
                (proposal.stateStr === "Active" ||
                    proposal.stateStr === "Pending") && (
                    <button
                        onClick={() => cancelProposal(proposal.id)}
                        className="bg-yellow-600 px-4 py-2 rounded"
                    >
                        Отменить
                    </button>
                )}
        </div>
    );
}
