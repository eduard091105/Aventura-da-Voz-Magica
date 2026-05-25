import { BoardView } from "../components/BoardView";
import { ScreenShell } from "../components/ScreenShell";
import { useGameStore } from "../store/gameStore";
import { audio } from "../utils/audio";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const BoardPage = () => {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const turnResult = useGameStore((s) => s.turnResult);
  const rollDice = useGameStore((s) => s.rollDice);
  const resolvePendingBack = useGameStore((s) => s.resolvePendingBack);
  const nextTurn = useGameStore((s) => s.nextTurn);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [showDiceOverlay, setShowDiceOverlay] = useState(false);
  const [centerNotice, setCenterNotice] = useState<string | null>(null);
  const [centerSideEvent, setCenterSideEvent] = useState<{ image: string; text: string } | null>(null);
  const [cardStage, setCardStage] = useState<"none" | "mystery" | "revealed">("none");
  const [cardRevealedForHud, setCardRevealedForHud] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);

  const current = players[currentPlayerIndex];
  const isSkipNotice = Boolean(centerNotice && centerNotice.toLowerCase().includes("pulada"));

  useEffect(() => {
    if (!current?.name) return;
    setCenterNotice(`Vez de ${current.name}`);
    const timeout = setTimeout(() => setCenterNotice(null), 1200);
    return () => clearTimeout(timeout);
  }, [currentPlayerIndex, current?.name]);

  useEffect(() => {
    if (turnResult?.card) {
      setCardStage("mystery");
      setCardRevealedForHud(false);
    } else {
      setCardStage("none");
      setCardRevealedForHud(false);
    }
  }, [turnResult]);

  useEffect(() => {
    if (turnResult?.sideEvent && turnResult.rolled > 0) {
      setCenterSideEvent(turnResult.sideEvent);
    } else {
      setCenterSideEvent(null);
    }
  }, [turnResult?.sideEvent, turnResult?.rolled]);

  useEffect(() => {
    if (!turnResult || turnResult.winner || turnResult.extraTurn) {
      setAwaitingContinue(false);
      return;
    }
    setAwaitingContinue(Boolean(turnResult.sideEvent || turnResult.card));
  }, [turnResult]);

  const needsContinueHint = useMemo(() => {
    if (showDiceOverlay || expandedCard) return false;
    if (cardStage === "mystery") return false;
    if (cardStage === "revealed") return true;
    if (centerSideEvent) return true;
    return awaitingContinue;
  }, [showDiceOverlay, expandedCard, cardStage, centerSideEvent, awaitingContinue]);

  const advanceTurnIfNeeded = () => {
    if (!turnResult || turnResult.winner || turnResult.extraTurn) return;
    setAwaitingContinue(false);
    nextTurn();
  };

  const handleContinue = () => {
    if (showDiceOverlay || expandedCard) return;

    if (centerNotice && isSkipNotice) {
      setCenterNotice(null);
      if (awaitingContinue) {
        setAwaitingContinue(false);
        nextTurn();
      }
      return;
    }

    if (cardStage === "revealed") {
      setCardStage("none");
      advanceTurnIfNeeded();
      return;
    }

    if (centerSideEvent) {
      setCenterSideEvent(null);
      advanceTurnIfNeeded();
      return;
    }

    if (awaitingContinue && turnResult && !turnResult.winner && !turnResult.extraTurn && cardStage === "none") {
      if (turnResult.pendingBackSteps) {
        setAwaitingContinue(false);
        resolvePendingBack();
        setTimeout(() => nextTurn(), 950);
        return;
      }
      setAwaitingContinue(false);
      nextTurn();
    }
  };

  const handleRevealCard = () => {
    if (!turnResult?.card) return;
    setCardRevealedForHud(true);
    setCardStage("revealed");
  };

  const handleRollDice = async () => {
    if (isRolling || !current) return;

    if (current.skipTurn) {
      rollDice();
      setCenterNotice(`Rodada pulada: ${current.name}`);
      setAwaitingContinue(true);
      return;
    }

    setIsRolling(true);
    setShowDiceOverlay(true);
    audio.playDice();

    const finalRoll = Math.floor(Math.random() * 6) + 1;

    for (let i = 0; i < 10; i += 1) {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      await sleep(75);
    }

    setDiceValue(finalRoll);
    await sleep(400);

    rollDice(finalRoll);
    setShowDiceOverlay(false);
    setIsRolling(false);
  };

  return (
    <ScreenShell className="h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#fff7cc_0,#c2f0ff_40%,#9be8b0_100%)] p-1">
      <div className="grid h-full items-start gap-2 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="-mt-2 h-full">
          <BoardView />
        </div>
        <aside className="flex h-full min-h-0 flex-col rounded-3xl bg-white/90 p-3 shadow-xl">
          <h2 className="text-lg font-bold">Turno atual</h2>
          <p className="mt-1 text-xl font-extrabold">{current?.name}</p>
          <button
            type="button"
            onClick={handleRollDice}
            disabled={isRolling || needsContinueHint}
            className="mt-3 h-16 w-full rounded-2xl bg-blue-600 text-xl font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRolling ? "Rolando..." : "Rolar Dado"}
          </button>
          {turnResult && (
            <div className="mt-3 rounded-xl bg-slate-100 p-2">
              <p className="text-sm">{turnResult.message}</p>
              {turnResult.card?.image && cardRevealedForHud && (
                <button type="button" onClick={() => setExpandedCard(turnResult.card!.image!)} className="mt-2 block w-full">
                  <img src={turnResult.card.image} alt="Carta" className="max-h-44 w-full rounded-lg object-contain" />
                  <p className="mt-1 text-xs text-slate-600">Toque na carta para ampliar</p>
                </button>
              )}
              {turnResult.extraTurn && <p className="mt-2 text-sm font-semibold text-green-700">Turno extra! Role o dado novamente.</p>}
            </div>
          )}
          <div className="mt-3 flex-1 space-y-1 overflow-hidden text-xs leading-tight">
            {players.map((p) => (
              <p key={p.id}>
                {p.name}: {p.position === 0 ? "Inicio" : `Casa ${p.position}`} {p.skipTurn ? "(perde proxima)" : ""}
              </p>
            ))}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {centerNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${isSkipNotice ? "pointer-events-auto" : "pointer-events-none"} fixed inset-0 z-30 grid place-items-center`}
            onClick={isSkipNotice ? handleContinue : undefined}
          >
            <div
              className={`min-w-[640px] rounded-2xl px-14 py-7 text-center text-5xl font-black text-white shadow-2xl ${
                centerNotice.toLowerCase().includes("pulada") ? "bg-red-600/95" : "bg-black/75"
              }`}
            >
              {centerNotice}
              {isSkipNotice && <p className="mt-4 text-xl font-semibold text-white/90">clique para continuar</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {centerSideEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="fixed inset-0 z-35 grid place-items-center"
            onClick={handleContinue}
          >
            <div className="flex min-w-[820px] items-center justify-center gap-6 rounded-3xl bg-white/95 px-12 py-8 shadow-2xl">
              <img src={centerSideEvent.image} alt="Evento da casa" className="h-36 w-36 rounded-2xl object-contain" />
              <div>
                <p className="text-6xl font-black leading-tight text-slate-900">{centerSideEvent.text}</p>
                <p className="mt-4 text-xl font-semibold text-slate-600">clique para continuar</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {turnResult?.card && cardStage === "mystery" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-45 grid place-items-center bg-black/40"
          >
            <button type="button" onClick={handleRevealCard} className="group">
              <div
                className={`grid h-72 w-52 place-items-center rounded-3xl border-4 border-white text-8xl font-black text-white shadow-2xl transition-transform group-hover:scale-105 ${
                  turnResult.cardSource === "YELLOW"
                    ? "bg-yellow-400"
                    : turnResult.cardSource === "CHALLENGE"
                      ? "bg-[linear-gradient(90deg,#22c55e_0%,#22c55e_50%,#ef4444_50%,#ef4444_100%)]"
                      : "bg-green-500"
                }`}
              >
                ?
              </div>
              <p className="mt-3 text-center text-xl font-bold text-white">Toque para revelar a carta</p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {turnResult?.card && cardStage === "revealed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-45 grid place-items-center bg-black/45"
            onClick={handleContinue}
          >
            <div className="grid place-items-center">
              <img src={turnResult.card.image} alt="Carta revelada" className="max-h-[78vh] w-[420px] rounded-2xl object-contain shadow-2xl" />
              <p className="mt-4 text-2xl font-black text-white">clique para continuar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiceOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/45"
          >
            <motion.div
              key={diceValue}
              initial={{ scale: 0.7, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="grid h-48 w-48 place-items-center rounded-[2rem] border-8 border-white bg-blue-600 text-8xl font-black text-white shadow-2xl"
            >
              {diceValue}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {awaitingContinue && !centerNotice && !centerSideEvent && cardStage === "none" && !showDiceOverlay && !turnResult?.card && !turnResult?.sideEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-32 grid place-items-center"
            onClick={handleContinue}
          >
            <div className="rounded-2xl bg-black/70 px-10 py-5 text-3xl font-black text-white shadow-2xl">
              clique para continuar
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {expandedCard && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedCard(null)}
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setExpandedCard(null)}
              className="absolute right-2 top-2 rounded-md bg-slate-800 px-3 py-1 text-sm text-white"
            >
              Fechar
            </button>
            <img src={expandedCard} alt="Carta ampliada" className="max-h-[80vh] w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </ScreenShell>
  );
};
