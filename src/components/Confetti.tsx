
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  animationDuration: number;
  animationDelay: number;
}

const COLORS = [
  "#1E40AF", // dark blue
  "#2563EB", // blue
  "#3B82F6", // primary blue
  "#60A5FA", // light blue
  "#E11D48", // red
  "#F43F5E", // light red
  "#FECDD3", // pink
  "#22C55E", // green
  "#4ADE80", // light green
];

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate random confetti pieces
    const newPieces: ConfettiPiece[] = [];
    const piecesCount = 50; // Number of confetti pieces
    
    for (let i = 0; i < piecesCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // random position across screen width (%)
        y: -5 - Math.random() * 10, // start just above the viewport
        size: 5 + Math.random() * 10, // random size
        rotation: Math.random() * 360, // random initial rotation
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDuration: 1 + Math.random() * 3, // random duration between 1-4s
        animationDelay: Math.random() * 0.5, // random delay
      });
    }
    
    setPieces(newPieces);
    
    // Cleanup
    return () => {
      setPieces([]);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `
              confetti-fall ${piece.animationDuration}s linear ${piece.animationDelay}s infinite,
              confetti-sway ${piece.animationDuration * 0.5}s ease-in-out ${piece.animationDelay}s infinite alternate
            `,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(${Math.random() * 360}deg);
          }
          100% {
            transform: translateY(100vh) rotate(${Math.random() * 360 + 360}deg);
          }
        }
        
        @keyframes confetti-sway {
          0% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
