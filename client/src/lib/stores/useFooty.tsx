import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "team_selection" | "playing" | "paused" | "quarter_end" | "match_end";

export interface Team {
  id: string;
  name: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface Score {
  goals: number;
  behinds: number;
}

interface FootyState {
  gameState: GameState;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: Score;
  awayScore: Score;
  quarter: number;
  gameTime: number; // seconds
  showAccuracyBar: boolean;
  
  // Actions
  setGameState: (state: GameState) => void;
  setHomeTeam: (team: Team) => void;
  setAwayTeam: (team: Team) => void;
  addScore: (team: 'home' | 'away', goals: number, behinds: number) => void;
  setQuarter: (quarter: number) => void;
  setGameTime: (time: number) => void;
  setShowAccuracyBar: (show: boolean) => void;
  resetGame: () => void;
}

export const useFooty = create<FootyState>()(
  subscribeWithSelector((set) => ({
    gameState: "menu",
    homeTeam: null,
    awayTeam: null,
    homeScore: { goals: 0, behinds: 0 },
    awayScore: { goals: 0, behinds: 0 },
    quarter: 1,
    gameTime: 1200, // 20 minutes in seconds
    showAccuracyBar: false,
    
    setGameState: (state) => set({ gameState: state }),
    
    setHomeTeam: (team) => set({ homeTeam: team }),
    
    setAwayTeam: (team) => set({ awayTeam: team }),
    
    addScore: (team, goals, behinds) => set((state) => ({
      [team === 'home' ? 'homeScore' : 'awayScore']: {
        goals: (team === 'home' ? state.homeScore.goals : state.awayScore.goals) + goals,
        behinds: (team === 'home' ? state.homeScore.behinds : state.awayScore.behinds) + behinds
      }
    })),
    
    setQuarter: (quarter) => set({ quarter }),
    
    setGameTime: (time) => set({ gameTime: time }),
    
    setShowAccuracyBar: (show) => set({ showAccuracyBar: show }),
    
    resetGame: () => set({
      homeScore: { goals: 0, behinds: 0 },
      awayScore: { goals: 0, behinds: 0 },
      quarter: 1,
      gameTime: 1200,
      showAccuracyBar: false
    })
  }))
);
