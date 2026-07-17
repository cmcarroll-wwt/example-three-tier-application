'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
  }, [generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver && e.key === ' ') {
        resetGame();
        return;
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      const directionMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        W: 'UP',
        s: 'DOWN',
        S: 'DOWN',
        a: 'LEFT',
        A: 'LEFT',
        d: 'RIGHT',
        D: 'RIGHT',
      };

      const newDirection = directionMap[e.key];
      if (newDirection) {
        e.preventDefault();
        setNextDirection((currentNext) => {
          // Prevent reversing direction
          const opposites: Record<Direction, Direction> = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
          };
          if (opposites[currentNext] === newDirection) {
            return currentNext;
          }
          return newDirection;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, resetGame]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setDirection(nextDirection);
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const directionDeltas: Record<Direction, Position> = {
          UP: { x: 0, y: -1 },
          DOWN: { x: 0, y: 1 },
          LEFT: { x: -1, y: 0 },
          RIGHT: { x: 1, y: 0 },
        };

        const delta = directionDeltas[nextDirection];
        const newHead = {
          x: head.x + delta.x,
          y: head.y + delta.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood(newSnake));
          setScore((prev) => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          // Increase speed slightly
          setSpeed((prev) => Math.max(50, prev - SPEED_INCREMENT));
          return newSnake; // Don't remove tail (snake grows)
        }

        // Remove tail (snake moves)
        newSnake.pop();
        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [nextDirection, food, gameOver, isPaused, speed, generateFood, highScore]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#18181b'; // zinc-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#22c55e'; // green-500
      } else {
        // Body
        ctx.fillStyle = '#4ade80'; // green-400
      }
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = '16px sans-serif';
      ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 20);
    }

    // Draw pause overlay
    if (isPaused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  }, [snake, food, gameOver, isPaused]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Snake Game
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            ← Back to To-Do List
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          {/* Score display */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-zinc-900 dark:text-zinc-50">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Score: </span>
              <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="text-zinc-900 dark:text-zinc-50">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">High Score: </span>
              <span className="text-2xl font-bold">{highScore}</span>
            </div>
          </div>

          {/* Game canvas */}
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-2 border-zinc-300 dark:border-zinc-600 rounded"
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                disabled={gameOver}
                className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetGame}
                className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                New Game
              </button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">Controls:</p>
              <ul className="space-y-1 ml-4">
                <li>• Arrow keys or WASD to move</li>
                <li>• Space or P to pause</li>
                <li>• Space to restart after game over</li>
              </ul>
              <p className="mt-4">
                Eat the red food to grow and increase your score. Don't hit the walls or yourself!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
