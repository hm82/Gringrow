import React from "react";

const QuickActions: React.FC = () => {
  const actions = [
    { name: "Send Money", icon: "send" },
    { name: "Pay Bills", icon: "credit_card" },
    { name: "Deposit", icon: "payments" },
    { name: "Investments", icon: "trending_up" },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm p-5 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.name}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="material-icons text-primary-600 mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
