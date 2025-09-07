import { useFooty } from "../../lib/stores/useFooty";

export default function MainMenu() {
  const { setGameState } = useFooty();

  const menuItems = [
    { label: "Exhibition Match", action: () => setGameState('team_selection') },
    { label: "Season Mode", action: () => setGameState('team_selection') },
    { label: "Training", action: () => setGameState('team_selection') },
    { label: "Options", action: () => {} }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#1a472a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, monospace',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '60px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#ffd700',
          textShadow: '3px 3px 0px #000'
        }}>
          AUSSIE RULES FOOTY
        </h1>
        <p style={{
          fontSize: '18px',
          margin: '0',
          color: '#90ee90'
        }}>
          NES Classic Recreation - 1991
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: '#2d5a3d',
              color: 'white',
              border: '3px solid #4a7c59',
              borderRadius: '0',
              cursor: 'pointer',
              fontFamily: 'Inter, monospace',
              minWidth: '280px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px #000'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4a7c59';
              e.currentTarget.style.color = '#ffd700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d5a3d';
              e.currentTarget.style.color = 'white';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        fontSize: '14px',
        color: '#90ee90'
      }}>
        Press ENTER to select • Arrow keys to navigate
      </div>
    </div>
  );
}
