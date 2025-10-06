import { useState } from "react";
function App() {
  const [counter, setCounter] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const incrementSmoothly = (by) => {
    let i = 0;
    const interval = setInterval(() => {
      setCounter(prev => {
        return prev + 1;
      });
      i++;
      if (i >= by) {
        clearInterval(interval);
      }
    }, 100);
  };
  return (
    <div className="App">
      <h1>Counter App</h1>
      <p>Current Count: {counter}</p>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
      <button onClick={() => setCounter(counter - 1)}>Decrement</button>
      <button onClick={() => setCounter(0)}>Reset</button>
      <button onClick={() => incrementSmoothly(5)}>Add 5</button>
      <h2>Welcome to CHARUSAT!!!</h2>
      <div>
        <label>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>
      <div style={{ marginTop: "10px" }}>
        <label>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>First Name: {firstName}</p>
        <p>Last Name: {lastName}</p>
      </div>
      <style>
        {`
        .App {
          text-align: center;
          padding: 20px;
          background-color: #121212;
          color: #ffffff;
          font-family: Arial, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        body {
          background-color: #121212;
          color: #ffffff;
          font-family: Arial, sans-serif;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        h1 {
          color: #bb86fc;
          font-size: 2.5em;
          margin-bottom: 20px;
        }
        p {
          font-size: 1.5em;
          margin: 20px 0;
          transition: all 0.3s ease-in-out;
        }
        button {
          background-color: #03dac6;
          color: #000000;
          border: none;
          padding: 10px 20px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        button:hover {
          background-color: #018786;
          transform: scale(1.05);
        }
        button:active {
          background-color: #03dac6;
          transform: scale(0.95);
        }
        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(3, 218, 198, 0.5);
        }
        input {
          padding: 8px;
          border: 1px solid #03dac6;
          border-radius: 4px;
          background-color: #121212;
          color: #ffffff;
          width: 200px;
          transition: border-color 0.3s ease;
        }
        input:focus {
          border-color: #bb86fc;
          outline: none;
        }
        label {
          font-size: 1.2em;
          color: #03dac6;
          display: block;
          margin-bottom: 10px;
        }
        div {
          margin: 10px 0;
          display: flex;
          flex-direction: column;
        }
        h2 {
          color: #03dac6;
          font-size: 2em;
          margin-top: 20px;
        }
        `}
      </style>
    </div>
  );
}
export default App;
