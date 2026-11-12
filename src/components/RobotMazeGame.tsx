import React, { useState } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface RobotMazeGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

export const RobotMazeGame: React.FC<RobotMazeGameProps> = ({ language, onSuccess }) => {
  const t = translations[language];
  const gridSize = 4; // 4x4 grid
  const [robotPos, setRobotPos] = useState<Position>({ x: 0, y: 3 });
  const [robotDir, setRobotDir] = useState<Direction>('UP');
  const targetPos: Position = { x: 3, y: 0 };
  const [commands, setCommands] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [logMessage, setLogMessage] = useState('');

  const addCommand = (cmd: string) => {
    if (commands.length < 8 && !isRunning) {
      setCommands([...commands, cmd]);
    }
  };

  const clearCommands = () => {
    if (!isRunning) {
      setCommands([]);
      setRobotPos({ x: 0, y: 3 });
      setRobotDir('UP');
      setGameStatus('idle');
      setLogMessage('');
    }
  };

  const runCommands = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    setGameStatus('idle');
    setLogMessage(language === 'ar' ? 'جارٍ تنفيذ الأوامر البرمجية...' : 'Executing code sequence...');

    let currentX = 0;
    let currentY = 3;
    let currentDir: Direction = 'UP';

    setRobotPos({ x: currentX, y: currentY });
    setRobotDir(currentDir);

    for (let i = 0; i < commands.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      const cmd = commands[i];

      if (cmd === 'FORWARD') {
        if (currentDir === 'UP' && currentY > 0) currentY--;
        else if (currentDir === 'DOWN' && currentY < gridSize - 1) currentY++;
        else if (currentDir === 'LEFT' && currentX > 0) currentX--;
        else if (currentDir === 'RIGHT' && currentX < gridSize - 1) currentX++;
      } else if (cmd === 'LEFT') {
        if (currentDir === 'UP') currentDir = 'LEFT';
        else if (currentDir === 'LEFT') currentDir = 'DOWN';
        else if (currentDir === 'DOWN') currentDir = 'RIGHT';
        else if (currentDir === 'RIGHT') currentDir = 'UP';
      } else if (cmd === 'RIGHT') {
        if (currentDir === 'UP') currentDir = 'RIGHT';
        else if (currentDir === 'RIGHT') currentDir = 'DOWN';
        else if (currentDir === 'DOWN') currentDir = 'LEFT';
        else if (currentDir === 'LEFT') currentDir = 'UP';
      }

      setRobotPos({ x: currentX, y: currentY });
      setRobotDir(currentDir);
    }

    await new Promise((r) => setTimeout(r, 400));
    setIsRunning(false);

    if (currentX === targetPos.x && currentY === targetPos.y) {
      setGameStatus('success');
      setLogMessage(t.robotGame.success);
      onSuccess(5);
    } else {
      setGameStatus('fail');
      setLogMessage(t.robotGame.fail);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-red-100 dark:border-slate-800">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          {language === 'ar' ? '🤖 متاهة الروبوت سمارتي التفاعلية' : '🤖 Interactive Robot Maze'}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-sm">
          {t.robotGame.instructions}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Grid View */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl shadow-inner border-2 border-red-200 dark:border-slate-700 w-72 h-72">
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);
              const isRobot = robotPos.x === x && robotPos.y === y;
              const isTarget = targetPos.x === x && targetPos.y === y;

              return (
                <div
                  key={index}
                  className={`relative rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isRobot
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : isTarget
                      ? 'bg-amber-100 dark:bg-amber-900/40 border-2 border-dashed border-amber-500 animate-pulse'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isRobot && (
                    <div className="flex flex-col items-center animate-bounce">
                      <span className="text-2xl">🤖</span>
                      <span className="text-[10px] font-bold bg-black/40 px-1 rounded text-white">
                        {robotDir === 'UP' ? '⬆️' : robotDir === 'DOWN' ? '⬇️' : robotDir === 'LEFT' ? '⬅️' : '➡️'}
                      </span>
                    </div>
                  )}
                  {isTarget && !isRobot && <span className="text-3xl">⭐</span>}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {gameStatus === 'success' && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              <span>{logMessage}</span>
            </div>
          )}
          {gameStatus === 'fail' && (
            <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-4 py-2 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span>{logMessage}</span>
            </div>
          )}
          {gameStatus === 'idle' && logMessage && (
            <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
              {logMessage}
            </div>
          )}
        </div>

        {/* Controls & Commands */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
              {t.robotGame.commandQueue} ({commands.length}/8)
            </h4>
            <div className="min-h-[50px] flex flex-wrap gap-2 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              {commands.length === 0 ? (
                <span className="text-slate-400 text-xs italic">
                  {language === 'ar' ? 'اختر الأوامر من الأسفل...' : 'Select commands below...'}
                </span>
              ) : (
                commands.map((cmd, i) => (
                  <span
                    key={i}
                    className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    {cmd === 'FORWARD' && '⬆️ Forward'}
                    {cmd === 'LEFT' && '⬅️ Left'}
                    {cmd === 'RIGHT' && '➡️ Right'}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addCommand('LEFT')}
              disabled={isRunning || commands.length >= 8}
              className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-indigo-100 transition-colors disabled:opacity-50 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs">Left</span>
            </button>
            <button
              onClick={() => addCommand('FORWARD')}
              disabled={isRunning || commands.length >= 8}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-md"
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs">Forward</span>
            </button>
            <button
              onClick={() => addCommand('RIGHT')}
              disabled={isRunning || commands.length >= 8}
              className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-indigo-100 transition-colors disabled:opacity-50 shadow-sm"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-xs">Right</span>
            </button>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={runCommands}
              disabled={isRunning || commands.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>{t.runCode}</span>
            </button>
            <button
              onClick={clearCommands}
              disabled={isRunning}
              className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.reset}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
