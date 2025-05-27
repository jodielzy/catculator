import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getUsers } from '../api';
import '../styles/Home.css';

import catsImg from '../assets/cats.png';
import yarnImg from '../assets/yarn.png';

function Home() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    const res = await createRoom();
    localStorage.setItem('roomCode', res.data.room_code);
    navigate('/room');
  };

  const handleJoin = async () => {
    if (code.length !== 6) return alert("Enter a 6-digit room code.");
    try {
      await getUsers(code);
      localStorage.setItem('roomCode', code);
      navigate('/room');
    } catch {
      alert("Room not found.");
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">
        Catculator <span className="emoji">💸</span>
      </h1>

      <div className="input-with-cat">
        <img src={catsImg} alt="cute cats" className="home-image" />
        <div className="input-wrapper">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter 6-digit room code"
            className="home-input"
            maxLength={6}
          />
        </div>
      </div>

      <button className="home-button" onClick={handleJoin}>Join Room</button>
      <button className="home-button" onClick={handleCreate}>Create New Room</button>

      <div className="yarn-bottom">
        <img src={yarnImg} alt="yarn ball" />
      </div>
    </div>
  );
}

export default Home;
