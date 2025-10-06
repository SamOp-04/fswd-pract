
import React, { useEffect, useState } from 'react';
function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  useEffect(() => {
    document.title = "Pract3";
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(new Date().toLocaleDateString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Welcome to Charusat</h1>
      <p className="time">Time: {currentTime}</p>
      <p className="date">Date: {currentDate}</p>

      <style jsx>{`
    .App {
      text-align: center;
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #e0f7fa, #80deea);
      color: #263238;
      animation: fadeIn 1s ease-in-out;
      transition: all 0.4s ease-in-out;
      box-shadow: inset 0 0 100px rgba(255, 255, 255, 0.4);
    }

    h1 {
      font-size: 3rem;
      background: linear-gradient(to right, #00796b, #004d40);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
      animation: pulse 2s infinite alternate;
    }

    .time, .date {
      font-size: 1.5rem;
      margin: 10px 0;
      padding: 10px 20px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, background-color 0.3s ease;
    }

    .time:hover, .date:hover {
      transform: scale(1.05);
      background-color: rgba(255, 255, 255, 0.5);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.05);
      }
    }
  `}</style>
    </div>
  );
}

export default App;
