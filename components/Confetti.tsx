import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  spin: number;
  colour: string;
  animationDuration: number;
  animationDelay: number;
}

/**
 * The app's own colours, read from the tokens so the paper matches the theme
 * it falls in front of. Results first: it is a result being celebrated.
 */
const COLOURS = ["--win", "--accent", "--draw", "--info", "--loss"].map(
  (token) => `hsl(var(${token}))`
);

/**
 * A shower of paper when a result is saved.
 *
 * Pure decoration, so it is not drawn at all for anyone who has asked for
 * less motion — a frozen scatter of squares over the page would only be in
 * the way.
 */
const Confetti = () => {
  const reduced = useReducedMotion();
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 50 }, (_, id) => ({
        id,
        x: Math.random() * 100,
        // Just above the top of the screen.
        y: -5 - Math.random() * 10,
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
        spin: 360 + Math.random() * 360,
        colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        animationDuration: 1 + Math.random() * 3,
        animationDelay: Math.random() * 0.5,
      }))
    );
    return () => setPieces([]);
  }, []);

  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.colour,
            ["--spin" as string]: `${piece.spin}deg`,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.animationDuration}s linear ${piece.animationDelay}s infinite`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes confetti-fall {
            from { transform: translateY(0) rotate(0deg); }
            to { transform: translateY(105vh) rotate(var(--spin)); }
          }
        `}
      </style>
    </div>
  );
};

export default Confetti;
