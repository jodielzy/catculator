import React from 'react';

function TransactionList({ expenses, users, onDelete }) {
  const getName = (id) => users.find(u => u.id === id)?.name || id;

  return (
    <div>
      <h3>All Transactions</h3>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.title} — ${Number(exp.amount).toFixed(2)} — Paid by {getName(exp.paid_by)}
            <button onClick={() => onDelete(exp.id)} style={{ marginLeft: '10px' }}>
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
