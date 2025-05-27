import React, { useState } from 'react';

function AddUser({ onAdd }) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name);
      setName('');
    }
  };

  return (
    <>
      <h3>Add Member</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <button onClick={handleAdd}>Add</button>
    </>
  );
}

export default AddUser;
