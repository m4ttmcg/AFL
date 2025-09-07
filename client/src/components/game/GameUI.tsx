import { useFooty } from "../../lib/stores/useFooty";
import AccuracyBar from "./AccuracyBar";

export default function GameUI() {
  const { 
    homeTeam, 
    awayTeam, 
    homeScore, 
    awayScore, 
    quarter, 
    gameTime, 
    showAccuracyBar,
    gameState 
  } = useFooty();

  if (!homeTeam || !awayTeam) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreString = (goals: number, behinds: number) => {
    const total = goals * 6 + behinds;
    return `${goals}.${behinds} (${total})`;
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      fontFamily: 'Inter, monospace',
      color: 'white'
    }}>
      {/* Top Score Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '3px solid #ffd700'
      }}>
        {/* Home Team Score */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: homeTeam.primaryColor,
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: homeTeam.textColor
          }}>
            {homeTeam.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {homeTeam.name}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>
              {getScoreString(homeScore.goals, homeScore.behinds)}
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', color: '#90ee90' }}>
            Quarter {quarter}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {formatTime(gameTime)}
          </div>
        </div>

        {/* Away Team Score */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexDirection: 'row-reverse'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: awayTeam.primaryColor,
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: awayTeam.textColor
          }}>
            {awayTeam.name.charAt(0)}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {awayTeam.name}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>
              {getScoreString(awayScore.goals, awayScore.behinds)}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '5px',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Controls:</div>
        <div>WASD - Move Player</div>
        <div>J - Kick/Handball</div>
        <div>K - Mark/Tackle</div>
        <div>L - Block/Push</div>
        <div>Space - Special Move</div>
      </div>

      {/* Accuracy Bar */}
      {showAccuracyBar && <AccuracyBar />}

      {/* Pause Menu */}
      {gameState === 'paused' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all'
        }}>
          <div style={{
            backgroundColor: '#1a472a',
            padding: '40px',
            border: '3px solid #ffd700',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              margin: '0 0 30px 0',
              color: '#ffd700'
            }}>
              GAME PAUSED
            </h2>
            <div style={{ fontSize: '16px' }}>
              Press ESC to resume
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
