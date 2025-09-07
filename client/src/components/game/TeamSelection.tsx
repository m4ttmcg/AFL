import { useState } from "react";
import { useFooty } from "../../lib/stores/useFooty";
import { TEAMS } from "../../lib/game/Teams";

export default function TeamSelection() {
  const { setGameState, setHomeTeam, setAwayTeam } = useFooty();
  const [selectedHome, setSelectedHome] = useState(0);
  const [selectedAway, setSelectedAway] = useState(1);
  const [selectingTeam, setSelectingTeam] = useState<'home' | 'away'>('home');

  const handleTeamSelect = () => {
    if (selectingTeam === 'home') {
      setSelectingTeam('away');
    } else {
      setHomeTeam(TEAMS[selectedHome]);
      setAwayTeam(TEAMS[selectedAway]);
      setGameState('playing');
    }
  };

  const navigateTeam = (direction: 'up' | 'down') => {
    if (selectingTeam === 'home') {
      if (direction === 'up') {
        setSelectedHome((prev) => prev > 0 ? prev - 1 : TEAMS.length - 1);
      } else {
        setSelectedHome((prev) => prev < TEAMS.length - 1 ? prev + 1 : 0);
      }
    } else {
      if (direction === 'up') {
        setSelectedAway((prev) => prev > 0 ? prev - 1 : TEAMS.length - 1);
      } else {
        setSelectedAway((prev) => prev < TEAMS.length - 1 ? prev + 1 : 0);
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#1a472a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, monospace',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '800px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 0 40px 0',
          color: '#ffd700',
          textShadow: '2px 2px 0px #000'
        }}>
          SELECT TEAMS
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Home Team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: selectingTeam === 'home' ? '3px solid #ffd700' : '3px solid #4a7c59',
            padding: '30px',
            backgroundColor: '#2d5a3d',
            minWidth: '300px'
          }}>
            <h2 style={{
              fontSize: '24px',
              margin: '0 0 20px 0',
              color: selectingTeam === 'home' ? '#ffd700' : 'white'
            }}>
              HOME TEAM
            </h2>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: TEAMS[selectedHome].primaryColor,
              border: '3px solid #000',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: TEAMS[selectedHome].textColor
            }}>
              {TEAMS[selectedHome].name.charAt(0)}
            </div>
            <h3 style={{
              fontSize: '20px',
              margin: '0',
              color: 'white'
            }}>
              {TEAMS[selectedHome].name}
            </h3>
            <p style={{
              fontSize: '14px',
              margin: '10px 0 0 0',
              color: '#90ee90'
            }}>
              {TEAMS[selectedHome].city}
            </p>
          </div>

          {/* VS */}
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ffd700',
            textShadow: '2px 2px 0px #000'
          }}>
            VS
          </div>

          {/* Away Team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: selectingTeam === 'away' ? '3px solid #ffd700' : '3px solid #4a7c59',
            padding: '30px',
            backgroundColor: '#2d5a3d',
            minWidth: '300px'
          }}>
            <h2 style={{
              fontSize: '24px',
              margin: '0 0 20px 0',
              color: selectingTeam === 'away' ? '#ffd700' : 'white'
            }}>
              AWAY TEAM
            </h2>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: TEAMS[selectedAway].primaryColor,
              border: '3px solid #000',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: TEAMS[selectedAway].textColor
            }}>
              {TEAMS[selectedAway].name.charAt(0)}
            </div>
            <h3 style={{
              fontSize: '20px',
              margin: '0',
              color: 'white'
            }}>
              {TEAMS[selectedAway].name}
            </h3>
            <p style={{
              fontSize: '14px',
              margin: '10px 0 0 0',
              color: '#90ee90'
            }}>
              {TEAMS[selectedAway].city}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <button
            onClick={() => navigateTeam('up')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2d5a3d',
              color: 'white',
              border: '2px solid #4a7c59',
              cursor: 'pointer',
              fontFamily: 'Inter, monospace'
            }}
          >
            ↑ Previous
          </button>
          <button
            onClick={handleTeamSelect}
            style={{
              padding: '10px 30px',
              fontSize: '18px',
              backgroundColor: '#4a7c59',
              color: '#ffd700',
              border: '2px solid #ffd700',
              cursor: 'pointer',
              fontFamily: 'Inter, monospace',
              fontWeight: 'bold'
            }}
          >
            {selectingTeam === 'home' ? 'Select Home Team' : 'Start Match'}
          </button>
          <button
            onClick={() => navigateTeam('down')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2d5a3d',
              color: 'white',
              border: '2px solid #4a7c59',
              cursor: 'pointer',
              fontFamily: 'Inter, monospace'
            }}
          >
            ↓ Next
          </button>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          color: '#90ee90'
        }}>
          Arrow keys to navigate • ENTER to select • ESC to go back
        </div>
      </div>
    </div>
  );
}
