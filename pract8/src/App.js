import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const res = await axios.get('http://localhost:5000/count');
    setCount(res.data.count);
  };

  const updateCount = async (newCount) => {
    await axios.post('http://localhost:5000/count', { count: newCount });
    setCount(newCount);
  };

  const resetCount = async () => {
    await axios.post('http://localhost:5000/reset');
    setCount(0);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="app">
      <h1>Gym Rep Counter</h1>
      <div className="counter">{count}</div>
      <div>
        <button onClick={() => updateCount(Math.max(count - 1, 0))}>-</button>
        <button onClick={() => updateCount(count + 1)}>+</button>
      </div>
      <button className="reset" onClick={resetCount}>Reset</button>
    </div>
  );
}

export default App;
