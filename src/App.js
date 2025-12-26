import { useEffect, useRef, useState } from "react";
import './App.css';
const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_SPEED = 200;

const getRandomFood = () => ({
  x: Math.floor(Math.random() * BOARD_SIZE),
  y: Math.floor(Math.random() * BOARD_SIZE),
});

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(getRandomFood());
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const eatSound = useRef(null);
  const gameOverSound = useRef(null);

  // تحميل الأصوات
  useEffect(() => {
    eatSound.current = new Audio("/eat.mp3");
    gameOverSound.current = new Audio("/gameover.mp3");
  }, []);

  // حركة الدودة
  useEffect(() => {
    if (gameOver || !soundEnabled) return;

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [snake, direction, speed, gameOver, soundEnabled]);

  // تحكم الكيبورد
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") setDirection("UP");
      if (e.key === "ArrowDown") setDirection("DOWN");
      if (e.key === "ArrowLeft") setDirection("LEFT");
      if (e.key === "ArrowRight") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const playEatSound = () => {
    if (!soundEnabled || !eatSound.current) return;
    eatSound.current.currentTime = 0;
    eatSound.current.play().catch(() => {});
  };

  const playGameOverSound = () => {
    if (!soundEnabled || !gameOverSound.current) return;
    gameOverSound.current.play().catch(() => {});
  };

  const moveSnake = () => {
    const head = { ...snake[0] };

    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;

    // اصطدام
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= BOARD_SIZE ||
      head.y >= BOARD_SIZE ||
      snake.some((p) => p.x === head.x && p.y === head.y)
    ) {
      playGameOverSound();
      setGameOver(true);
      return;
    }

    const newSnake = [head, ...snake];

    // أكل الطعام
    if (head.x === food.x && head.y === food.y) {
      playEatSound();
      setFood(getRandomFood());
      setScore((prev) => prev + 1);

      if ((score + 1) % 5 === 0) {
        setSpeed((prev) => Math.max(prev - 20, 60));
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(getRandomFood());
    setDirection("RIGHT");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial" }}>
      <h1>🐍 لعبة الدودة</h1>
      <h2>النقاط: {score}</h2>

      {!soundEnabled && (
        <button onClick={() => setSoundEnabled(true)}>
          ابدأ اللعبة 🔊
        </button>
      )}

      {gameOver && (
        <>
          <h2>انتهت اللعبة ❌</h2>
          <button onClick={restartGame}>إعادة التشغيل 🔄</button>
        </>
      )}

      <div
        style={{
          justifyContent:"center",
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
          margin: "20px auto",
        }}
      >
        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
          const x = i % BOARD_SIZE;
          const y = Math.floor(i / BOARD_SIZE);

          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                border: "1px solid #ddd",
                backgroundColor: isSnake
                  ? "green"
                  : isFood
                  ? "red"
                  : "white",
              }}
            />
          );
        })}
      </div>

      {/* أزرار الموبايل */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setDirection("UP")}>⬆️</button>
        <br />
        <button onClick={() => setDirection("LEFT")}>⬅️</button>
        <button onClick={() => setDirection("DOWN")}>⬇️</button>
        <button onClick={() => setDirection("RIGHT")}>➡️</button>
      </div>
    </div>
  );
}
