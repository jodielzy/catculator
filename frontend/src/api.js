import axios from 'axios';

const API_BASE_URL = 'https://catculator-backend.onrender.com';

// Room
export const createRoom = async () => axios.post(`${API_BASE_URL}/rooms`);
export const getUsers = async (roomCode) => axios.get(`${API_BASE_URL}/rooms/${roomCode}/users`);
export const addUser = async (roomCode, name) =>
  axios.post(`${API_BASE_URL}/rooms/${roomCode}/users`, { name });

// Expenses
export const addExpense = async (roomCode, expense) =>
  axios.post(`${API_BASE_URL}/rooms/${roomCode}/expenses`, expense);
export const getSummary = async (roomCode) =>
  axios.get(`${API_BASE_URL}/rooms/${roomCode}/summary`);
export const getExpenses = async (roomCode) =>
  axios.get(`${API_BASE_URL}/rooms/${roomCode}/expenses`);
export const deleteExpense = async (expenseId) =>
  axios.delete(`${API_BASE_URL}/expenses/${expenseId}`);

