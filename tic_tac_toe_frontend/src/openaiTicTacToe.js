//
// OpenAI-powered Tic Tac Toe AI integration
//
// This module exports a single async function: getOpenAIMove(board)
// It takes the current board (array of 9, with "X", "O", or null) and returns the index (0-8) of AI's move for "O".
// Uses REACT_APP_OPENAI_API_KEY from environment.
//

// PUBLIC_INTERFACE
export async function getOpenAIMove(board) {
  /**
   * Calls OpenAI API to determine the next move for the Tic Tac Toe AI ("O").
   * Returns: integer [0-8] — index of the desired move, or null on error.
   */
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    // eslint-disable-next-line no-console
    console.error("Missing REACT_APP_OPENAI_API_KEY in environment variables.");
    return null;
  }

  // Make a simple prompt representing the board state and requesting a single move as an index (0-8).
  // Board: [["X",null,"O"],["X","O",null],[null,null,"X"]]
  // Return ONLY the move as an integer 0-8 (left to right, top to bottom).
  const prompt = `
You are a skilled Tic Tac Toe AI. 
Given the current board, always play as O.
Return ONLY the index (0-8) of your next move, as an integer (no text).
Board (row major order: 0-2 first row, 3-5 second row, 6-8 third row):
${JSON.stringify(board)}
`;


  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        temperature: 0.2,
        max_tokens: 8,
      }),
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error("OpenAI API error:", response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    const txt = data.choices?.[0]?.message?.content?.trim();
    // Attempt to parse the index from response
    // Acceptable responses: "4", " 6\n", "2", etc.
    const match = txt && txt.match(/\d+/);
    if (match && match[0] >= 0 && match[0] <= 8) {
      return Number(match[0]);
    }
    // eslint-disable-next-line no-console
    console.warn("OpenAI API move unparseable:", txt);
    return null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to call OpenAI API:", e);
    return null;
  }
}
