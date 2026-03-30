export default function ProposalFilter({ value, onChange }) {
    const statuses = [
        "ALL",
        "Active",
        "Pending",
        "Succeeded",
        "Executed",
        "Defeated",
        "Cancelled",
        "Closed",
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-3 py-1 rounded ${
                        value === s
                            ? "bg-blue-600"
                            : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
}
