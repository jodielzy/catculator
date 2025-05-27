import React, { useState } from 'react';

function AddExpense({ users, onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [involved, setInvolved] = useState([]);

  const handleToggleInvolved = (userId) => {
    setInvolved((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paidBy || involved.length === 0) {
      alert("Please select who paid and who is involved.");
      return;
    }

    try {
      await onAdd({
        title,
        amount: parseFloat(amount),
        paid_by: paidBy,
        involved
      });
      setTitle('');
      setAmount('');
      setPaidBy('');
      setInvolved([]);
    } catch (err) {
      alert("Failed to add expense: " + err.response?.data?.error || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />

      <div>
        <h3>Paid By</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {users.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => setPaidBy(user.id)}
              className={paidBy === user.id ? 'btn-selected' : 'btn'}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3>Persons Involved</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {users.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleToggleInvolved(user.id)}
              className={involved.includes(user.id) ? 'btn-selected' : 'btn'}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      <button type="submit">➕ Add Expense</button>
    </form>
  );
}

export default AddExpense;
