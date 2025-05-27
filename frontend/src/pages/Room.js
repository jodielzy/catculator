import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsers,
  addUser,
  addExpense,
  getSummary,
  getExpenses,
  deleteExpense,
} from '../api';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import { getRandomAvatar } from '../assets/avatar'; 
import '../styles/Room.css';

function Room() {
  const roomCode = typeof window !== 'undefined' && window.localStorage
    ? localStorage.getItem('roomCode') || ''
    : '';
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [involved, setInvolved] = useState([]);

  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    const res = await getUsers(roomCode);
    const enriched = res.data.map(u => ({
      ...u,
      avatar: getRandomAvatar()
    }));
    setUsers(enriched);
  }, [roomCode]);

  const loadSummary = useCallback(async () => {
    const res = await getSummary(roomCode);
    setSummary(res.data);
  }, [roomCode]);

  const loadExpenses = useCallback(async () => {
    const res = await getExpenses(roomCode);
    setExpenses(res.data);
  }, [roomCode]);

  const handleAddUser = async () => {
    if (!name.trim()) return;
    const avatar = getRandomAvatar();
    const res = await addUser(roomCode, name);
    const newUser = { id: res.data.user_id, name, avatar };
    setUsers(prev => [...prev, newUser]);
    setName('');
  };

  const toggleInvolved = (userId) => {
    setInvolved(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddExpense = async () => {
    if (!title || !amount || !paidBy || involved.length === 0) {
      alert("Please fill out all fields.");
      return;
    }

    await addExpense(roomCode, {
      title,
      amount: parseFloat(amount),
      paid_by: paidBy,
      involved,
    });

    setTitle('');
    setAmount('');
    setPaidBy('');
    setInvolved([]);

    loadSummary();
    loadExpenses();
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    loadSummary();
    loadExpenses();
  };

  const handleExit = () => {
    localStorage.removeItem('roomCode');
    navigate('/');
  };

  useEffect(() => {
    if (roomCode) {
      loadUsers();
      loadSummary();
      loadExpenses();
    }
  }, [roomCode, loadUsers, loadSummary, loadExpenses]);

  return (
    <div className="room-container">
      <h2 className="room-title">Room: {roomCode}</h2>

      <div className="row">
        <label>Add Member</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"/>
        <button onClick={handleAddUser}>Add</button>
      </div>

      <div className="row">
        <label>Add Expense</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (Without $)" />
      </div>

      <div className="section">
        <label>Paid By</label>
        <div className="user-select">
          {users.map(user => (
            <div
              key={user.id}
              className={`user-pill ${paidBy === user.id ? 'selected' : ''}`}
              onClick={() => setPaidBy(user.id)}
            >
              <img src={user.avatar} alt="avatar" className="pill-avatar" />
              <span className="pill-name">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <label>Persons Involved</label>
        <div className="user-select">
          {users.map(user => (
            <div
              key={user.id}
              className={`user-pill ${involved.includes(user.id) ? 'selected' : ''}`}
              onClick={() => toggleInvolved(user.id)}
            >
              <img src={user.avatar} alt="avatar" className="pill-avatar" />
              <span className="pill-name">{user.name}</span>
            </div>
          ))}
        </div>
        <button onClick={handleAddExpense}>Add</button>
      </div>

      <Summary summary={summary} users={users} />
      <TransactionList expenses={expenses} users={users} onDelete={handleDeleteExpense} />

      <button className="exit-button" onClick={handleExit}>🚪 Exit Room</button>
    </div>
  );
}

export default Room;
