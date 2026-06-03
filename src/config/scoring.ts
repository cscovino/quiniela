export const SCORING = {
  MATCH: {
    EXACT: 3, // exact scoreline predicted correctly
    WINNER: 1, // correct outcome (win/draw) but wrong score
    DRAW: 1, // draw correctly predicted
    WRONG: 0, // completely wrong outcome
  },
  GROUP: {
    EXACT_POSITION: 3, // SCORE-01: team finishes in exact predicted position
    QUALIFIED: 1, // SCORE-01: team qualifies but wrong position
    WIN: 3, // points per group-stage win (used by updateGroupStandings)
    DRAW: 1, // points per draw
    LOSS: 0, // points per loss
  },
  FINAL_FOUR: {
    EXACT_POSITION: 5, // SCORE-02: exact 1st/2nd/3rd/4th position
    QUALIFIED: 3, // SCORE-02: among final four, wrong position
  },
  BEST_PLAYER: {
    CORRECT: 5, // SCORE-03: correct top scorer or best goalkeeper pick
  },
} as const;
