// calculator.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Serve calculator form
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kid's Calculator</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .calculator-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
          border: 3px solid #ff6b6b;
        }
        
        h2 {
          color: #4ecdc4;
          margin-bottom: 30px;
          font-size: 2.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .calculator-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .input-row {
          display: flex;
          align-items: center;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        input[type="text"] {
          padding: 15px;
          font-size: 1.2rem;
          border: 3px solid #4ecdc4;
          border-radius: 15px;
          text-align: center;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          width: 120px;
          transition: all 0.3s ease;
        }
        
        input[type="text"]:focus {
          outline: none;
          border-color: #ff6b6b;
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
        }
        
        select {
          padding: 15px;
          font-size: 1.5rem;
          border: 3px solid #45b7d1;
          border-radius: 15px;
          background: #45b7d1;
          color: white;
          font-weight: bold;
          cursor: pointer;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          transition: all 0.3s ease;
        }
        
        select:hover {
          background: #3a9bc1;
          transform: scale(1.05);
        }
        
        button {
          padding: 20px 40px;
          font-size: 1.5rem;
          background: linear-gradient(45deg, #ff6b6b, #ffa726);
          color: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
        }
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .fun-decoration {
          font-size: 2rem;
          margin: 0 10px;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @media (max-width: 480px) {
          .calculator-container {
            padding: 20px;
          }
          
          .input-row {
            flex-direction: column;
          }
          
          input[type="text"] {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="calculator-container">
        <div class="fun-decoration"></div>
        <h2>Kid's Calculator</h2>
        <div class="fun-decoration"></div>
        
        <form method="POST" action="/calculate" class="calculator-form">
          <div class="input-row">
            <input type="text" name="num1" placeholder="First number" required />
            <select name="operation">
              <option value="add">➕ Add</option>
              <option value="subtract">➖ Subtract</option>
              <option value="multiply">✖️ Multiply</option>
              <option value="divide">➗ Divide</option>
            </select>
            <input type="text" name="num2" placeholder="Second number" required />
          </div>
          <button type="submit"> Calculate!</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Handle calculation
app.post("/calculate", (req, res) => {
  const num1 = parseFloat(req.body.num1);
  const num2 = parseFloat(req.body.num2);
  const operation = req.body.operation;

  // Check invalid inputs
  if (isNaN(num1) || isNaN(num2)) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oops!</title>
        <style>
          body {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .message-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 3px solid #ff6b6b;
          }
          h3 {
            color: #ff6b6b;
            font-size: 2rem;
            margin-bottom: 20px;
          }
          .back-btn {
            display: inline-block;
            padding: 15px 30px;
            background: #4ecdc4;
            color: white;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          .back-btn:hover {
            background: #45b7d1;
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="message-container">
          <div style="font-size: 3rem;"></div>
          <h3>Please enter valid numbers only!</h3>
          <a href='/' class="back-btn"> Try Again</a>
        </div>
      </body>
      </html>
    `);
  }

  let result;
  switch (operation) {
    case "add":
      result = num1 + num2;
      break;
    case "subtract":
      result = num1 - num2;
      break;
    case "multiply":
      result = num1 * num2;
      break;
    case "divide":
      if (num2 === 0) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Division Error!</title>
            <style>
              body {
                font-family: 'Comic Sans MS', cursive, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
              }
              .message-container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 3px solid #ff6b6b;
              }
              h3 {
                color: #ff6b6b;
                font-size: 2rem;
                margin-bottom: 20px;
              }
              .back-btn {
                display: inline-block;
                padding: 15px 30px;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                border-radius: 15px;
                font-weight: bold;
                transition: all 0.3s ease;
              }
              .back-btn:hover {
                background: #45b7d1;
                transform: scale(1.05);
              }
            </style>
          </head>
          <body>
            <div class="message-container">
              <div style="font-size: 3rem;"></div>
              <h3>Cannot divide by zero!</h3>
              <p style="color: #666; margin-bottom: 20px;">Division by zero is not allowed in math!</p>
              <a href='/' class="back-btn"> Try Again</a>
            </div>
          </body>
          </html>
        `);
      }
      result = num1 / num2;
      break;
    default:
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Operation!</title>
          <style>
            body {
              font-family: 'Comic Sans MS', cursive, sans-serif;
              background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            .message-container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              border: 3px solid #ff6b6b;
            }
            h3 {
              color: #ff6b6b;
              font-size: 2rem;
              margin-bottom: 20px;
            }
            .back-btn {
              display: inline-block;
              padding: 15px 30px;
              background: #4ecdc4;
              color: white;
              text-decoration: none;
              border-radius: 15px;
              font-weight: bold;
              transition: all 0.3s ease;
            }
            .back-btn:hover {
              background: #45b7d1;
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="message-container">
            <div style="font-size: 3rem;"></div>
            <h3>Invalid operation!</h3>
            <a href='/' class="back-btn">Try Again</a>
          </div>
        </body>
        </html>
      `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Result!</title>
      <style>
        body {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .result-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 3px solid #4ecdc4;
          animation: celebration 0.6s ease-out;
        }
        @keyframes celebration {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        h2 {
          color: #4ecdc4;
          font-size: 2.5rem;
          margin-bottom: 20px;
        }
        .result-number {
          font-size: 3rem;
          color: #ff6b6b;
          font-weight: bold;
          margin: 20px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        .back-btn {
          display: inline-block;
          padding: 20px 40px;
          background: linear-gradient(45deg, #ff6b6b, #ffa726);
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
        }
        .back-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="result-container">
        <div style="font-size: 3rem;"></div>
        <h2>Result:</h2>
        <div class="result-number">${result}</div>
        <a href="/" class="back-btn"> Go Back</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(3002, () => {
  console.log("Calculator app running at http://localhost:3002");
});