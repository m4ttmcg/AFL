import { useEffect, useState } from "react";
import { useFooty } from "../../lib/stores/useFooty";

export default function AccuracyBar() {
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const { setShowAccuracyBar } = useFooty();

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        const newPos = prev + direction * 2;
        if (newPos >= 95) {
          setDirection(-1);
          return 95;
        }
        if (newPos <= 5) {
          setDirection(1);
          return 5;
        }
        return newPos;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [direction, isActive]);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'KeyJ' || event.code === 'Space') {
      setIsActive(false);
      // Calculate accuracy based on how close to center (50%)
      const accuracy = 100 - Math.abs(50 - position) * 2;
      console.log('Kick accuracy:', accuracy);
      
      setTimeout(() => {
        setShowAccuracyBar(false);
      }, 300);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [position]);

  const getBarColor = () => {
    const distance = Math.abs(50 - position);
    if (distance < 10) return '#00ff00'; // Green - very accurate
    if (distance < 20) return '#ffff00'; // Yellow - good
    if (distance < 30) return '#ffa500'; // Orange - okay
    return '#ff0000'; // Red - poor
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '120px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '400px',
      height: '60px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '3px solid #ffd700',
      borderRadius: '10px',
      padding: '15px',
      fontFamily: 'Inter, monospace',
      pointerEvents: 'all'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        ACCURACY BAR - Press J or SPACE to kick!
      </div>
      
      <div style={{
        position: 'relative',
        width: '100%',
        height: '20px',
        backgroundColor: '#333',
        border: '2px solid #fff',
        borderRadius: '10px'
      }}>
        {/* Target zone in center */}
        <div style={{
          position: 'absolute',
          left: '40%',
          width: '20%',
          height: '100%',
          backgroundColor: 'rgba(0, 255, 0, 0.3)',
          borderRadius: '8px'
        }} />
        
        {/* Moving indicator */}
        <div style={{
          position: 'absolute',
          left: `${position}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '24px',
          backgroundColor: getBarColor(),
          border: '1px solid #000',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
        }} />
      </div>
    </div>
  );
}
