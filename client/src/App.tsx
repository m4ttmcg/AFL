import { useEffect, useState } from "react";
import { useFooty } from "./lib/stores/useFooty";
import MainMenu from "./components/game/MainMenu";
import TeamSelection from "./components/game/TeamSelection";
import GameCanvas from "./components/game/GameCanvas";
import GameUI from "./components/game/GameUI";
import "@fontsource/inter";

function App() {
  const { gameState } = useFooty();
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    setShowGame(true);
  }, []);

  if (!showGame) {
    return (
      <div 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#1a472a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        Loading Aussie Rules Footy...
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#1a472a'
    }}>
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'team_selection' && <TeamSelection />}
      {(gameState === 'playing' || gameState === 'paused' || gameState === 'quarter_end' || gameState === 'match_end') && (
        <>
          <GameCanvas />
          <GameUI />
        </>
      )}
    </div>
  );
}

export default App;
