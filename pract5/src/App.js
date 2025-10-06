import React, { useState, useEffect } from 'react';
import './App.css';
export const App = () => {
  const [result, setResult] = useState("");
  const [previousResult, setPreviousResult] = useState("");
  const safeEvaluate = (expression) => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/.()%\s]/g, '');
      if (!sanitized || /[+\-*/.]{2,}/.test(sanitized)) {
        throw new Error("Invalid expression");
      }
      const tokens = sanitized.match(/(\d+\.?\d*|[+\-*/()])/g);
      if (!tokens) throw new Error("Invalid expression");
      let index = 0;
      const parseExpression = () => {
        let left = parseTerm();
        while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
          const operator = tokens[index++];
          const right = parseTerm();
          left = operator === '+' ? left + right : left - right;
        }
        return left;
      };
      const parseTerm = () => {
        let left = parseFactor();
        while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
          const operator = tokens[index++];
          const right = parseFactor();
          left = operator === '*' ? left * right : left / right;
        }
        return left;
      };
      const parseFactor = () => {
        if (tokens[index] === '(') {
          index++; 
          const result = parseExpression();
          index++; 
          return result;
        }
        if (tokens[index] === '-') {
          index++;
          return -parseFactor();
        }
        const num = parseFloat(tokens[index++]);
        return isNaN(num) ? 0 : num;
      };
      const result = parseExpression();
      if (!isFinite(result)) {
        throw new Error("Invalid result");
      }
      return result;
    } catch (error) {
      throw new Error("Invalid expression");
    }
  };
  const handleClick = React.useCallback((value) => {
    if (value === "=") {
      try {
        const evalResult = safeEvaluate(result);
        setPreviousResult(result + " =");
        setResult(evalResult.toString());
      } catch (error) {
        setResult("Error");
      }
    } else if (value === "C") {
      setResult("");
      setPreviousResult("");
    } else if (value === "⌫") {
      setResult(result.slice(0, -1));
    } else {
      setResult(result + value);
    }
  }, [result]);
  const handleKeyPress = React.useCallback((event) => {
    const key = event.key;
    if (/[0-9+\-*/.=%]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
    }
    if (/[0-9]/.test(key)) {
      handleClick(key);
    }
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
      handleClick(key);
    }
    else if (key === '.') {
      handleClick('.');
    }
    else if (key === '%') {
      handleClick('%');
    }
    else if (key === '=' || key === 'Enter') {
      handleClick('=');
    }
    else if (key === 'Escape' || key === 'Delete') {
      handleClick('C');
    }
    else if (key === 'Backspace') {
      handleClick('⌫');
    }
  }, [handleClick]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  const buttons = [
    ["C", "⌫", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];
  return (
<div className="container" tabIndex="0">
  <div className="calculator">
    <div className="display">
      <div className="previous-result">
        {previousResult}
      </div>
      <div className="current-result">
        {result || "0"}
      </div>
    </div>
    <div className="button-grid">
      {buttons.flat().map((btn, index) => {
        let buttonClass = "button";
        if (btn === "=") {
          buttonClass += " equals";
        } else if (btn === "0") {
          buttonClass += " zero";
        } else if (["+", "-", "*", "/", "%"].includes(btn)) {
          buttonClass += " operator";
        } else if (["C", "⌫"].includes(btn)) {
          buttonClass += " clear";
        } else {
          buttonClass += " number";
        }
        return (
          <button
            key={index}
            onClick={() => handleClick(btn)}
            className={buttonClass}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
          >
            {btn}
          </button>
        );
      })}
    </div>
    <div className="brand">
      23DCS112 Pract 5 Calculator
    </div>
  </div>
</div>

  );
};


export default App;