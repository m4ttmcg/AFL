import { useEffect, useRef } from "react";
import { useFooty } from "../../lib/stores/useFooty";
import { GameEngine } from "../../lib/game/GameEngine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { homeTeam, awayTeam, gameState } = useFooty();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !homeTeam || !awayTeam) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Initialize game engine
    gameEngineRef.current = new GameEngine(ctx, homeTeam, awayTeam);
    gameEngineRef.current.start();

    const gameLoop = () => {
      if (gameEngineRef.current && gameState === 'playing') {
        gameEngineRef.current.update();
        gameEngineRef.current.render();
      }
      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, [homeTeam, awayTeam, gameState]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a472a'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '3px solid #000',
          backgroundColor: '#228b22',
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}
