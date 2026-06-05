import { describe, expect, it } from 'vitest';

import { scoreFinalFourBet } from '../calculateFinalFourResults';

import './setup';

describe('scoreFinalFourBet', () => {
  it('awards 20 pts for all 4 exact positions', () => {
    const bet = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 5,
      secondPoints: 5,
      thirdPoints: 5,
      fourthPoints: 5,
      totalPoints: 20,
    });
  });

  it('awards 10 pts for 2 exact + 0 qualified (FRA/JPN not in final four)', () => {
    // ARG, BRA exact (5+5=10); FRA not in final four=0, JPN not in final four=0 → total=10
    const bet = { first: 'ARG', second: 'BRA', third: 'FRA', fourth: 'JPN' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 5,
      secondPoints: 5,
      thirdPoints: 0,
      fourthPoints: 0,
      totalPoints: 10,
    });
  });

  it('awards 13 pts for 2 exact + 1 qualified + 1 not in final four', () => {
    // bet: ARG (1st, exact), CHI (2nd, qualified - in final four but wrong), MEX (3rd, exact), JPN (4th, not in final four)
    // standings: ARG (1st), BRA (2nd), MEX (3rd), CHI (4th)
    // first: ARG exact=5, second: CHI qualified=3, third: MEX exact=5, fourth: JPN not in final four=0 → total=13
    const bet = { first: 'ARG', second: 'CHI', third: 'MEX', fourth: 'JPN' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 5,
      secondPoints: 3,
      thirdPoints: 5,
      fourthPoints: 0,
      totalPoints: 13,
    });
  });

  it('awards 15 pts for 3 exact + 1 not in final four', () => {
    // bet: ARG, BRA, MEX, JPN vs standings: ARG, BRA, MEX, CHI
    // first: ARG exact=5, second: BRA exact=5, third: MEX exact=5, fourth: JPN not in final four=0 → total=15
    const bet = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'JPN' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 5,
      secondPoints: 5,
      thirdPoints: 5,
      fourthPoints: 0,
      totalPoints: 15,
    });
  });

  it('awards 0 pts when no predictions match final four', () => {
    const bet = { first: 'USA', second: 'ENG', third: 'GER', fourth: 'FRA' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 0,
      secondPoints: 0,
      thirdPoints: 0,
      fourthPoints: 0,
      totalPoints: 0,
    });
  });

  it('handles partial standings (only third/fourth populated)', () => {
    // Only third and fourth positions are known
    const bet = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'JPN' };
    const standings = { third: 'MEX', fourth: 'CHI' }; // first/second undefined
    const result = scoreFinalFourBet(bet, standings);
    // first: ARG not in final four (no position) = 0 (since finalFour = [MEX, CHI])
    // second: BRA not in final four = 0
    // third: MEX exact=5, fourth: JPN not in final four=0 → total=5
    expect(result).toEqual({
      firstPoints: 0,
      secondPoints: 0,
      thirdPoints: 5,
      fourthPoints: 0,
      totalPoints: 5,
    });
  });

  it('handles empty bet object (all undefined)', () => {
    const bet = { first: '', second: '', third: '', fourth: '' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result).toEqual({
      firstPoints: 0,
      secondPoints: 0,
      thirdPoints: 0,
      fourthPoints: 0,
      totalPoints: 0,
    });
  });

  it('handles empty standings (all undefined)', () => {
    const bet = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const standings = {};
    const result = scoreFinalFourBet(bet, standings);
    // No final four positions defined, so all predictions score 0
    expect(result).toEqual({
      firstPoints: 0,
      secondPoints: 0,
      thirdPoints: 0,
      fourthPoints: 0,
      totalPoints: 0,
    });
  });

  it('is case-insensitive: uppercase bet vs lowercase standings (legacy data)', () => {
    const bet = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const standings = { first: 'arg', second: 'bra', third: 'mex', fourth: 'chi' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result.totalPoints).toBe(20);
  });

  it('is case-insensitive: lowercase bet vs uppercase standings (canonical)', () => {
    const bet = { first: 'arg', second: 'bra', third: 'mex', fourth: 'chi' };
    const standings = { first: 'ARG', second: 'BRA', third: 'MEX', fourth: 'CHI' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result.totalPoints).toBe(20);
  });

  it('is case-insensitive for QUALIFIED scoring', () => {
    const bet = { first: 'BRA', second: 'ARG', third: 'JPN', fourth: 'KOR' };
    const standings = { first: 'arg', second: 'bra', third: 'mex', fourth: 'chi' };
    const result = scoreFinalFourBet(bet, standings);
    expect(result.firstPoints).toBe(3);
    expect(result.secondPoints).toBe(3);
    expect(result.thirdPoints).toBe(0);
    expect(result.fourthPoints).toBe(0);
    expect(result.totalPoints).toBe(6);
  });
});
