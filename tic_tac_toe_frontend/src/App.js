import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color variables (see App.css) for theme:
 * --primary: #1976d2
 * --secondary: #424242
 * --accent: #ffca28
 */

// Board utility helpers
const emptyBoard = () => Array(9).fill(null);

// PUBLIC_INTERFACE
function checkWinner(squares) {
  /** Returns "X", "O", or null if no winner. */
  const winLines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];
  for (let [a,b,c] of winLines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
  }
  return null;
}

// PUBLIC_INTERFACE
function isBoardFull(squares) {
  /** Returns true if no nulls (board full) */
  return squares.every((v) => v !== null);
}

// PUBLIC_INTERFACE
function getAIMove(squares) {
  /** Basic AI: 1. win if can, 2. block win, 3. center, 4. random empty */
  const winLines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  // 1: Win if possible as O
  for (let line of winLines) {
    const [a,b,c] = line, chars = [squares[a], squares[b], squares[c]];
    if (chars.filter(x => x === 'O').length===2 && chars.includes(null)) {
      return line[chars.indexOf(null)];
    }
  }
  // 2: Block X's win
  for (let line of winLines) {
    const [a,b,c] = line, chars = [squares[a], squares[b], squares[c]];
    if (chars.filter(x => x === 'X').length===2 && chars.includes(null)) {
      return line[chars.indexOf(null)];
    }
  }
  // 3: Take center if empty
  if (!squares[4]) return 4;
  // 4: Choose a random available square
  const empties = squares.map((v,i)=>v?null:i).filter(v=>v!==null);
  if (empties.length>0) {
    return empties[Math.floor(Math.random()*empties.length)];
  }
  return null;
}

// PUBLIC_INTERFACE
function TicTacToeGame() {
  /**
   * Main Tic Tac Toe game component.
   * Handles game state, mode selection, gameplay, restart, and UI.
   */
  const [squares, setSquares] = useState(emptyBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState(null); // null = not selected, "pvp", "ai"
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({X: 0, O: 0});
  const [showBoard, setShowBoard] = useState(false);

  // For responsive winner display and to prevent multiple effect calls
  useEffect(() => {
    const win = checkWinner(squares);
    setWinner(win);
    if (win) {
      setStatus(`Winner: ${win}`);
    } else if (isBoardFull(squares)) {
      setStatus("It's a draw!");
    } else if (mode) {
      setStatus(`${xIsNext ? 'X' : 'O'}'s turn`);
    }
  // eslint-disable-next-line
  }, [squares, mode]);

  // Tally score when winner found
  useEffect(() => {
    if (winner) {
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    }
    // eslint-disable-next-line
  }, [winner]);

  // AI move when it's AI's turn
  useEffect(() => {
    if (mode === "ai" && !winner && showBoard && !xIsNext) {
      // delay for visual effect
      const timeout = setTimeout(() => {
        const idx = getAIMove(squares);
        if (idx !== null && squares[idx] === null) {
          handleSquareClick(idx);
        }
      }, 550);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [xIsNext, winner, mode, showBoard]);

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    /**
     * Handles click on a square; ignores if not playable.
     */
    if (winner || squares[i]) return;
    if (mode === "ai" && !xIsNext) return; // disable human as O vs ai
    setSquares((sqrs) => {
      const next = [...sqrs];
      next[i] = xIsNext ? 'X' : 'O';
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    /** Start a new game but keep scores and mode. */
    setSquares(emptyBoard());
    setXIsNext(true);
    setWinner(null);
    setStatus('');
  }

  function handleModeSelect(selectedMode) {
    setMode(selectedMode);
    setShowBoard(true);
    setSquares(emptyBoard());
    setScore({X: 0, O: 0});
    setXIsNext(true);
    setWinner(null);
    setStatus('');
  }

  function handleNewGame() {
    setShowBoard(false);
    setMode(null);
    setSquares(emptyBoard());
    setScore({X: 0, O: 0});
    setXIsNext(true);
    setWinner(null);
    setStatus('');
  }

  // Styling classes for modern minimalistic look:
  // Center grid, accent colors, no external libraries.

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="tictactoe-root" style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-secondary)',
        borderRadius: 18,
        margin: '32px 0',
        boxShadow: '0 2px 16px rgba(33,37,41, 0.10)'
      }}>
        <header style={{
          padding: '28px 16px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h1 style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '-0.03em',
            color: 'var(--primary, #1976d2)'
          }}>
            Tic Tac Toe
          </h1>
          <p style={{
            color: 'var(--accent, #ffca28)',
            fontWeight: '500',
            margin: '6px 0 18px 0',
            fontSize: 18
          }}>
            Modern & Minimalistic
          </p>
        </header>
        {!showBoard ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '28px 0 32px 0'
          }}>
            <span style={{
              color: 'var(--text-primary, #282c34)', fontSize: 20
            }}>
              Select Game Mode
            </span>
            <div style={{display:'flex', gap: 20, margin: '22px 0'}}>
              <button
                className="btn mode-btn"
                onClick={() => handleModeSelect("pvp")}
                style={{
                  padding: "12px 24px",
                  background: 'var(--primary, #1976d2)',
                  color: '#fff',
                  borderRadius: 8, border: 'none',
                  fontWeight: 600, fontSize: 17,
                  letterSpacing: '0.02em',
                  cursor: "pointer"
                }}
              >2 Players</button>
              <button
                className="btn mode-btn"
                onClick={() => handleModeSelect("ai")}
                style={{
                  padding: "12px 24px",
                  background: 'var(--accent, #ffca28)',
                  color: 'var(--secondary, #424242)',
                  borderRadius: 8, border: 'none',
                  fontWeight: 600, fontSize: 17,
                  letterSpacing: '0.02em',
                  cursor: "pointer"
                }}
              >VS AI</button>
            </div>
          </div>
        ) : (
          <div style={{padding: '10px 22px 32px 22px', width: "100%"}}>
            {/* Score and Status */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16,
              fontSize: 17
            }}>
              <span style={{
                color: 'var(--primary, #1976d2)', fontWeight: 600, letterSpacing: '0.02em'
              }}>
                X&nbsp;[{score.X}] &nbsp; / &nbsp; O&nbsp;[{score.O}]
              </span>
              <span
                style={{
                  background: winner ? 'var(--accent, #ffca28)' : 'transparent',
                  color: 'var(--secondary, #424242)',
                  borderRadius: 8,
                  padding: '3px 14px',
                  fontWeight: winner ? 700 : 400,
                  transition: 'background 0.2s'
                }}>
                {status}
              </span>
            </div>
            {/* Board */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 64px)',
                gridTemplateRows: 'repeat(3, 64px)',
                gap: 3,
                margin: '10px 0 18px 0'
              }}>
                {squares.map((val, idx) => (
                  <button
                    key={idx}
                    className={`ttt-cell${val ? " filled" : ""}`}
                    style={{
                      width: 62, height: 62,
                      background: 'var(--bg-primary)',
                      color: val === 'X'
                        ? 'var(--primary, #1976d2)'
                        : val === 'O'
                          ? 'var(--accent, #ffca28)'
                          : 'var(--border-color)',
                      fontSize: 38,
                      fontWeight: 700,
                      border: '2px solid var(--border-color, #e9ecef)',
                      borderRadius: 8,
                      boxShadow: val ? '0 2px 4px rgba(33,37,41,0.09)' : '',
                      cursor: (!winner && !val &&
                        (mode === "pvp" || (mode === "ai" && xIsNext)))
                        ? "pointer" : "default",
                      outline: 'none',
                      transition: 'background 0.18s'
                    }}
                    aria-label={`Cell ${idx} ${val ? val : ''}`}
                    onClick={() => handleSquareClick(idx)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 4
            }}>
              <button
                onClick={handleRestart}
                className="btn"
                style={{
                  padding: "10px 22px",
                  background: 'var(--primary, #1976d2)',
                  color: '#fff',
                  borderRadius: 8, border: 'none',
                  fontWeight: 500, fontSize: 16,
                  cursor: 'pointer'
                }}
                aria-label="Restart game"
              >Restart</button>
              <button
                onClick={handleNewGame}
                className="btn"
                style={{
                  padding: "10px 22px",
                  background: 'var(--secondary, #424242)',
                  color: '#fff',
                  borderRadius: 8, border: 'none',
                  fontWeight: 500, fontSize: 16,
                  cursor: 'pointer'
                }}
                aria-label="New game"
              >New Game</button>
            </div>
            {mode === "ai" &&
              <div style={{
                marginTop: 20,
                textAlign: 'center',
                color: 'var(--text-secondary, #61dafb)',
                fontSize: 15,
                fontWeight: 400
              }}>
                You are <span style={{color: 'var(--primary, #1976d2)', fontWeight:700}}>X</span> (AI is O)
              </div>
            }
          </div>
        )}
      </div>
      <footer style={{
        marginTop: 10,
        color: 'var(--text-secondary, #424242)',
        fontSize: 15,
        opacity: 0.82,
        textAlign: 'center'
      }}>
        &copy; {new Date().getFullYear()} Tic Tac Toe &ndash; Modern Minimal KAVIA Template
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Main App wrapper which returns the centered TicTacToeGame.
   */
  const [theme, setTheme] = useState('light');
  // Set app-wide light/dark mode theme (uses CSS vars in App.css)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  return (
    <div className="App">
      <header className="App-header" style={{display: 'none'}}></header>
      {/* Theme toggle button (optional) */}
      <button
        className="theme-toggle"
        style={{position: "absolute", top: 14, right: 14}}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <TicTacToeGame />
    </div>
  );
}

export default App;
