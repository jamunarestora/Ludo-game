import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RotateCcw, Trophy, User, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { 
  PlayerColor, 
  Piece, 
  GameState, 
  Position 
} from './types';
import { 
  PLAYER_COLORS, 
  COMMON_PATH, 
  HOME_PATH, 
  HOME_POSITION, 
  BASE_POSITIONS, 
  START_INDEX, 
  SAFE_INDICES,
  COLOR_CLASSES,
  COLOR_BORDER_CLASSES
} from './constants';

// --- Helper Functions ---

const getGlobalIndex = (color: PlayerColor, relativePos: number): number | null => {
  if (relativePos < 0 || relativePos >= 51) return null;
  return (START_INDEX[color] + relativePos) % 52;
};

const getGlobalCoords = (piece: Piece): Position => {
  if (piece.position === -1) {
    return BASE_POSITIONS[piece.color][piece.id];
  }
  if (piece.position === 57) {
    return HOME_POSITION[piece.color];
  }
  if (piece.position >= 52) {
    return HOME_PATH[piece.color][piece.position - 52];
  }
  
  const globalIndex = getGlobalIndex(piece.color, piece.position);
  return globalIndex !== null ? COMMON_PATH[globalIndex] : { x: 0, y: 0 };
};

// --- Sub-components ---

const Dice = ({ value, isRolling, onClick, disabled, color }: { 
  value: number | null, 
  isRolling: boolean, 
  onClick: () => void, 
  disabled: boolean,
  color: PlayerColor
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-slate-800 rounded-2xl shadow-xl flex items-center justify-center transition-all overflow-hidden",
        disabled ? "opacity-30" : "cursor-pointer"
      )}
    >
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div
            key="rolling"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
          >
            <Dices className="w-10 h-10 text-slate-800" />
          </motion.div>
        ) : (
          <motion.div
            key={value || 'null'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid grid-cols-2 gap-2"
          >
            {value ? (
              Array.from({ length: value }).slice(0, 4).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-slate-800 rounded-full" />
              ))
            ) : (
              <div className="text-2xl font-black text-slate-300">?</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const PieceComponent = ({ piece, isActive, isSelectable, onSelect }: { 
  piece: Piece, 
  isActive: boolean, 
  isSelectable: boolean,
  onSelect: () => void,
  key?: string 
}) => {
  const coords = getGlobalCoords(piece);
  const size = 100 / 15;

  return (
    <motion.div
      layoutId={`piece-${piece.color}-${piece.id}`}
      onClick={isSelectable ? onSelect : undefined}
      animate={{
        left: `${coords.x * size + size/2}%`,
        top: `${coords.y * size + size/2}%`,
        scale: isSelectable ? [1, 1.3, 1] : 1,
        boxShadow: isSelectable 
          ? "0 25px 40px -10px rgba(0, 0, 0, 0.5), 0 15px 20px -5px rgba(0, 0, 0, 0.3)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
      }}
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 30,
        scale: isSelectable ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}
      }}
      className={cn(
        "absolute w-[5.5%] h-[5.5%] rounded-full z-30 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all",
        COLOR_CLASSES[piece.color],
        "border-[3px] border-black/40",
        isSelectable && "cursor-pointer ring-12 ring-white/10 z-40",
        !isActive && !isSelectable && "opacity-90 scale-90"
      )}
    >
      {/* Dynamic Selection Halo */}
      {isSelectable && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 rounded-full bg-white ring-8 ring-white/20"
        />
      )}

      {/* 3D Highlight/Bevel */}
      <div className="absolute inset-0 rounded-full border-t-2 border-white/50 border-l-2 border-white/20" />
      <div className="absolute inset-0 rounded-full border-b-2 border-black/30 border-r-2 border-black/10" />
      
      {/* Inner design */}
      <div className="w-[50%] h-[50%] rounded-full bg-white/20 shadow-inner flex items-center justify-center">
        <div className="w-[40%] h-[40%] rounded-full bg-white/60 blur-[1px]" />
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [game, setGame] = useState<GameState>({
    players: {
      RED: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'RED', position: -1, isHome: false, isBase: true })),
      GREEN: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'GREEN', position: -1, isHome: false, isBase: true })),
      YELLOW: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'YELLOW', position: -1, isHome: false, isBase: true })),
      BLUE: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'BLUE', position: -1, isHome: false, isBase: true })),
    },
    activePlayers: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
    currentPlayer: 'RED',
    diceValue: null,
    isRolling: false,
    gameStatus: 'SETUP',
    winners: [],
    canRoll: true,
    lastRollWasSix: false,
    previousState: null,
  });

  const [lastKillPos, setLastKillPos] = useState<Position | null>(null);

  const skipTurn = useCallback((prev: GameState): GameState => {
    const currentIndex = PLAYER_COLORS.indexOf(prev.currentPlayer);
    let nextIndex = (currentIndex + 1) % 4;
    let nextPlayer = PLAYER_COLORS[nextIndex];
    
    // Find next active player who hasn't finished
    while (!prev.activePlayers.includes(nextPlayer) || prev.winners.includes(nextPlayer)) {
      nextIndex = (nextIndex + 1) % 4;
      nextPlayer = PLAYER_COLORS[nextIndex];
      if (nextIndex === currentIndex) break; // Should not happen if game is still going
    }

    return {
      ...prev,
      currentPlayer: nextPlayer,
      diceValue: null,
      canRoll: true
    };
  }, []);

  const rollDice = useCallback(() => {
    if (!game.canRoll || game.isRolling) return;

    setGame(prev => ({ ...prev, isRolling: true, diceValue: null }));

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      
      setGame(prev => {
        const canMoveAny = prev.players[prev.currentPlayer].some(p => {
          if (newValue === 6 && p.position === -1) return true;
          if (p.position === -1) return false;
          if (p.position + newValue <= 57) return true;
          return false;
        });

        if (!canMoveAny) {
          // If no pieces can move, skip turn
          setTimeout(() => {
            setGame(p => skipTurn(p));
          }, 1000);

          return { ...prev, isRolling: false, diceValue: newValue, canRoll: false };
        }

        return { ...prev, isRolling: false, diceValue: newValue, canRoll: false };
      });
    }, 600);
  }, [game.canRoll, game.isRolling, skipTurn]);

  const movePiece = (pieceId: number) => {
    const dice = game.diceValue;
    if (dice === null) return;

    setGame(prev => {
      const newPlayers = { ...prev.players };
      const playerPieces = [...newPlayers[prev.currentPlayer]];
      const piece = { ...playerPieces[pieceId] };

      let newRelativePos = piece.position;
      if (piece.position === -1) {
        if (dice === 6) newRelativePos = 0;
        else return prev;
      } else {
        newRelativePos += dice;
      }

      if (newRelativePos > 57) return prev;

      piece.position = newRelativePos;
      piece.isBase = newRelativePos === -1;
      piece.isHome = newRelativePos === 57;
      playerPieces[pieceId] = piece;
      newPlayers[prev.currentPlayer] = playerPieces;

      // Check for kills
      const newGlobalPos = getGlobalIndex(piece.color, newRelativePos);
      let hitSomeone = false;
      
      if (newGlobalPos !== null && !SAFE_INDICES.includes(newGlobalPos)) {
        PLAYER_COLORS.forEach(color => {
          if (color === prev.currentPlayer) return;
          newPlayers[color] = newPlayers[color].map(p => {
            const pGlobal = getGlobalIndex(color, p.position);
            if (pGlobal === newGlobalPos) {
              hitSomeone = true;
              setLastKillPos(getGlobalCoords(p));
              setTimeout(() => setLastKillPos(null), 800);
              return { ...p, position: -1, isBase: true };
            }
            return p;
          });
        });
      }

      // Check win condition for player
      const allHome = playerPieces.every(p => p.position === 57);
      let newWinners = [...prev.winners];
      if (allHome && !newWinners.includes(prev.currentPlayer)) {
        newWinners.push(prev.currentPlayer);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [prev.currentPlayer.toLowerCase()]
        });
      }

      // Turn logic
      const nextGame = skipTurn(prev);
      const nextPlayer = dice === 6 || hitSomeone ? prev.currentPlayer : nextGame.currentPlayer;

      const results = {
        ...prev,
        players: newPlayers,
        currentPlayer: nextPlayer,
        diceValue: null,
        canRoll: true,
        winners: newWinners,
        previousState: prev, // Save previous state for undo
      };

      const gameFinished = newWinners.length >= prev.activePlayers.length - 1 && prev.activePlayers.length > 1;
      results.gameStatus = gameFinished ? 'FINISHED' : 'PLAYING';

      return results;
    });
  };

  const resetGame = () => {
    setGame(prev => ({
      ...prev,
      players: {
        RED: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'RED', position: -1, isHome: false, isBase: true })),
        GREEN: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'GREEN', position: -1, isHome: false, isBase: true })),
        YELLOW: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'YELLOW', position: -1, isHome: false, isBase: true })),
        BLUE: Array.from({ length: 4 }, (_, i) => ({ id: i, color: 'BLUE', position: -1, isHome: false, isBase: true })),
      },
      currentPlayer: prev.activePlayers[0] || 'RED',
      diceValue: null,
      isRolling: false,
      gameStatus: 'SETUP',
      winners: [],
      canRoll: true,
      lastRollWasSix: false,
    }));
  };

  const togglePlayer = (color: PlayerColor) => {
    setGame(prev => {
      const active = [...prev.activePlayers];
      if (active.includes(color)) {
        if (active.length > 2) {
          return { ...prev, activePlayers: active.filter(c => c !== color) };
        }
        return prev;
      }
      return { ...prev, activePlayers: [...active, color] };
    });
  };

  const startGame = () => {
    setGame(prev => ({
      ...prev,
      gameStatus: 'PLAYING',
      currentPlayer: prev.activePlayers[0]
    }));
  };

  const undoMove = () => {
    if (game.previousState) {
      setGame(game.previousState);
    }
  };

  const isPieceSelectable = (p: Piece) => {
    if (game.canRoll || game.isRolling || game.diceValue === null) return false;
    if (p.color !== game.currentPlayer) return false;
    if (p.position === -1 && game.diceValue !== 6) return false;
    if (p.position + game.diceValue > 57) return false;
    return true;
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-row font-sans overflow-hidden">
      
      {/* Left Area: The Board Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 transition-all">
        <motion.div 
          animate={lastKillPos ? { 
            x: [0, -10, 10, -10, 10, 0],
            rotate: [0, -1, 1, -1, 1, 0]
          } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-[600px] aspect-square bg-white shadow-2xl border-8 border-slate-800 flex flex-wrap overflow-hidden"
        >
          <BoardBackground />

          {/* Capture Flash Effect */}
          <AnimatePresence>
            {lastKillPos && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 4, 0], opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                style={{
                  left: `${lastKillPos.x * (100/15) + (100/30)}%`,
                  top: `${lastKillPos.y * (100/15) + (100/30)}%`,
                }}
                className="absolute w-[5%] h-[5%] bg-white rounded-full z-50 pointer-events-none blur-xl"
              />
            )}
          </AnimatePresence>
          
          {/* Pieces */}
          {(Object.values(game.players).flat() as Piece[]).map(piece => (
            <PieceComponent 
              key={`${piece.color}-${piece.id}`}
              piece={piece}
              isActive={game.currentPlayer === piece.color}
              isSelectable={isPieceSelectable(piece)}
              onSelect={() => movePiece(piece.id)}
            />
          ))}

          {/* Setup/Winner Overlay */}
          {(game.gameStatus === 'SETUP' || game.gameStatus === 'FINISHED') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-8"
            >
              <div className="text-center space-y-6 text-white w-full max-w-sm">
                {game.gameStatus === 'FINISHED' ? (
                  <>
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
                    <h2 className="text-5xl font-black tracking-tighter uppercase">Ludo Champion!</h2>
                    <div className="space-y-3">
                      {game.winners.map((color, i) => (
                        <div key={color} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20">
                          <span className="font-black text-white/50 text-xl uppercase">#{i + 1}</span>
                          <span className={cn("font-black px-6 py-2 rounded-lg text-lg uppercase tracking-widest", COLOR_CLASSES[color], "text-white")}>
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={resetGame}
                      className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest"
                    >
                      New Match
                    </button>
                  </>
                ) : (
                  <>
                    <User className="w-20 h-20 text-white mx-auto" />
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Pick Players</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Select at least 2 colors to start</p>
                    <div className="grid grid-cols-2 gap-4 my-8">
                      {PLAYER_COLORS.map(color => {
                        const isSelected = game.activePlayers.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => togglePlayer(color)}
                            className={cn(
                              "p-6 rounded-2xl border-4 transition-all flex flex-col items-center gap-3",
                              isSelected ? "border-white bg-white/20 scale-105 shadow-xl" : "border-transparent bg-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                            )}
                          >
                            <div className={cn("w-12 h-12 rounded-full border-4 border-slate-900", COLOR_CLASSES[color])} />
                            <span className="font-black tracking-widest text-xs uppercase">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      onClick={startGame}
                      disabled={game.activePlayers.length < 2}
                      className={cn(
                        "w-full py-5 font-black rounded-2xl transition-all uppercase tracking-widest text-lg shadow-2xl",
                        game.activePlayers.length >= 2 ? "bg-white text-slate-900 hover:scale-105" : "bg-slate-700 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      Start Royale
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Sidebar: Controls and Info */}
      <div className="hidden lg:flex w-96 bg-white border-l-2 border-slate-200 p-10 flex-col shadow-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ludo Royale</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase mt-2">Royal Strategy Board</p>
        </div>

        <div className="space-y-4 mb-auto">
          {PLAYER_COLORS.map(color => {
            const isPlayerActive = game.activePlayers.includes(color);
            const isActive = game.currentPlayer === color;
            const isWinner = game.winners.includes(color);
            return (
              <div 
                key={color}
                className={cn(
                  "flex items-center gap-4 p-4 transition-all duration-300 rounded-xl border-2",
                  isActive ? cn("border-slate-800 bg-slate-50", COLOR_BORDER_CLASSES[color]) : "border-transparent opacity-40 grayscale",
                  isWinner && "opacity-100 grayscale-0 bg-yellow-50",
                  !isPlayerActive && "hidden"
                )}
              >
                <div className={cn("w-10 h-10 rounded-full shadow-inner border-2 border-white", COLOR_CLASSES[color])} />
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{color} PLAYER</div>
                  <div className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                    {isActive ? (isWinner ? "CHAMPION" : "YOUR TURN") : "WAITING..."}
                  </div>
                </div>
                {isActive && !isWinner && (
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", COLOR_CLASSES[color])} />
                )}
                {isWinner && <Trophy className="w-5 h-5 text-yellow-500" />}
              </div>
            );
          })}
        </div>

        <div className="pt-10 flex flex-col items-center border-t-2 border-slate-50">
          <div className="relative mb-8 group">
            <Dice 
              value={game.diceValue} 
              isRolling={game.isRolling} 
              onClick={rollDice} 
              disabled={!game.canRoll || game.winners.includes(game.currentPlayer)}
              color={game.currentPlayer}
            />
          </div>
          
          <div className="w-full space-y-3">
             <div className="text-center mb-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Game Controls</span>
             </div>
             <button 
                onClick={rollDice}
                disabled={!game.canRoll}
                className={cn(
                  "w-full py-5 text-white font-black rounded-2xl transition-all uppercase tracking-[0.15em] text-sm shadow-xl",
                  game.canRoll ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-200 cursor-not-allowed"
                )}
              >
                Roll The Dice
              </button>
              <button 
                onClick={resetGame}
                className="w-full py-4 border-2 border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest"
              >
                Quit Session
              </button>

              {game.previousState && game.gameStatus === 'PLAYING' && (
                <button 
                  onClick={undoMove}
                  className="w-full py-3 bg-red-50 text-red-500 font-black rounded-2xl border-2 border-red-100 hover:bg-red-100 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo Last Move
                </button>
              )}
          </div>
        </div>
      </div>
      
      {/* Mobile Dice/Controls (Overlay bottom) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white border-4 border-slate-800 rounded-3xl p-4 shadow-2xl flex items-center gap-4 z-40">
        <Dice 
          value={game.diceValue} 
          isRolling={game.isRolling} 
          onClick={rollDice} 
          disabled={!game.canRoll}
          color={game.currentPlayer}
        />
        <div className="flex-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{game.currentPlayer} TURN</div>
          <div className="text-sm font-black text-slate-900 uppercase">
             {game.isRolling ? "Rolling..." : game.diceValue ? `Roll: ${game.diceValue}` : "Ready to Roll"}
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Background Visuals ---

function BoardBackground() {
  const cells = Array.from({ length: 225 });

  const getCellType = (index: number) => {
    const x = index % 15;
    const y = Math.floor(index / 15);
    if (x < 6 && y < 6) return 'GREEN_BASE';
    if (x > 8 && y < 6) return 'YELLOW_BASE';
    if (x > 8 && y > 8) return 'BLUE_BASE';
    if (x < 6 && y > 8) return 'RED_BASE';
    if (x >= 6 && x <= 8 && y >= 6 && y <= 8) return 'CENTER';
    if (y === 7) {
      if (x > 0 && x < 6) return 'RED_HOME_PATH';
      if (x > 8 && x < 14) return 'YELLOW_HOME_PATH';
    }
    if (x === 7) {
      if (y > 0 && y < 6) return 'GREEN_HOME_PATH';
      if (y > 8 && y < 14) return 'BLUE_HOME_PATH';
    }
    if (x === 1 && y === 6) return 'RED_START';
    if (x === 8 && y === 1) return 'GREEN_START';
    if (x === 13 && y === 8) return 'YELLOW_START';
    if (x === 6 && y === 13) return 'BLUE_START';
    return 'DEFAULT';
  };

  return (
    <div className="grid grid-cols-15 w-full h-full relative bg-slate-100">
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {cells.map((_, i) => {
        const type = getCellType(i);
        return (
          <div 
            key={i} 
            className={cn(
              "border-[0.5px] border-slate-200 flex items-center justify-center relative overflow-hidden",
              type === 'DEFAULT' ? "bg-white" :
              type === 'RED_BASE' ? "bg-red-500 shadow-inner" :
              type === 'GREEN_BASE' ? "bg-green-500 shadow-inner" :
              type === 'YELLOW_BASE' ? "bg-yellow-400 shadow-inner" :
              type === 'BLUE_BASE' ? "bg-blue-500 shadow-inner" :
              type === 'RED_HOME_PATH' ? "bg-red-50" :
              type === 'GREEN_HOME_PATH' ? "bg-green-50" :
              type === 'YELLOW_HOME_PATH' ? "bg-yellow-50" :
              type === 'BLUE_HOME_PATH' ? "bg-blue-50" :
              type === 'RED_START' ? "bg-red-50" :
              type === 'GREEN_START' ? "bg-green-50" :
              type === 'YELLOW_START' ? "bg-yellow-50" :
              type === 'BLUE_START' ? "bg-blue-50" :
              type === 'CENTER' ? "bg-slate-900 shadow-2xl" : ""
            )}
          >
            {/* Color Gradients for paths */}
            {type.includes('_HOME_PATH') && (
              <div className={cn("absolute inset-[10%] rounded-sm opacity-90 shadow-sm", 
                type === 'RED_HOME_PATH' ? "bg-gradient-to-br from-red-400 to-red-600" :
                type === 'GREEN_HOME_PATH' ? "bg-gradient-to-br from-green-400 to-green-600" :
                type === 'YELLOW_HOME_PATH' ? "bg-gradient-to-br from-yellow-300 to-yellow-500" :
                type === 'BLUE_HOME_PATH' ? "bg-gradient-to-br from-blue-400 to-blue-600" : ""
              )} />
            )}

            {/* Start Indicators with pulsing ring */}
             {type.includes('_START') && (
              <div className={cn("absolute inset-2 border-2 border-slate-800 rounded shadow-md z-10", 
                type === 'RED_START' ? 'bg-red-500' : 
                type === 'GREEN_START' ? 'bg-green-500' : 
                type === 'YELLOW_START' ? 'bg-yellow-400' : 
                'bg-blue-500'
              )} />
            )}

            {/* Base Decoration */}
            {type.includes('_BASE') && (
              <div className="absolute inset-4 bg-white/95 rounded-2xl border-2 border-slate-800/20 shadow-xl flex items-center justify-center">
                 {/* Internal Base Texture */}
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }} />
              </div>
            )}

            {/* Center Art */}
            {type === 'CENTER' && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rotate-45">
                 <div className="grid grid-cols-2 w-[140%] h-[140%]">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 border border-black/10" />
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 border border-black/10" />
                    <div className="bg-gradient-to-br from-red-500 to-red-600 border border-black/10" />
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 border border-black/10" />
                 </div>
                 <div className="absolute inset-4 border-2 border-white/20 rounded-full mix-blend-overlay" />
              </div>
            )}
            
            {/* Safe indicators (stars) */}
            {SAFE_INDICES.includes(getGlobalIndex_internal(type, i % 15, Math.floor(i / 15))) && !type.includes('START') && type === 'DEFAULT' && (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shadow-sm" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Internal helper for background rendering
function getGlobalIndex_internal(type: string, x: number, y: number): number {
  if (type !== 'DEFAULT' && !type.includes('START')) return -1;
  // A bit hacky since it's just visual, but matches constants
  return COMMON_PATH.findIndex(p => p.x === x && p.y === y);
}
