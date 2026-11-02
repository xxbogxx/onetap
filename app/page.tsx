 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SaveData = { coins: number; taps: number; power: number; upgradeCost: number; level: number; bestCoins: number };
const INITIAL: SaveData = { coins: 0, taps: 0, power: 1, upgradeCost: 25, level: 1, bestCoins: 0 };
const SAVE_KEY = "onetap-lowpoly-save-v1";

function readSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      coins: Math.max(0, Number(parsed.coins) || 0),
      taps: Math.max(0, Number(parsed.taps) || 0),
      power: Math.max(1, Number(parsed.power) || 1),
      upgradeCost: Math.max(25, Number(parsed.upgradeCost) || 25),
      level: Math.max(1, Number(parsed.level) || 1),
      bestCoins: Math.max(0, Number(parsed.bestCoins) || 0),
    };
  } catch { return INITIAL; }
}

export default function Home() {
  const [game, setGame] = useState<SaveData>(INITIAL);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("Коснись золотого камня!");
  const [floating, setFloating] = useState<{ id: number; x: number; y: number; value: number }[]>([]);
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setGame(readSave());
    setReady(true);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { /* private mode/storage disabled */ }
  }, [game, ready]);

  useEffect(() => {
    if (!floating.length) return;
    const timer = window.setTimeout(() => setFloating((items) => items.slice(1)), 850);
    return () => window.clearTimeout(timer);
  }, [floating]);

  const levelProgress = game.taps % 100;
  const nextLevelAt = 100;
  const tap = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(12, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(12, Math.min(75, ((event.clientY - rect.top) / rect.height) * 100));
    setGame((old) => {
      const taps = old.taps + 1;
      return { ...old, coins: old.coins + old.power, taps, level: 1 + Math.floor(taps / 100), bestCoins: Math.max(old.bestCoins, old.coins + old.power) };
    });
    setFloating((items) => [...items.slice(-4), { id: Date.now() + Math.random(), x, y, value: game.power }]);
    setToast(`+${game.power} монет${game.power === 1 ? "а" : ""}!`);
    if ("vibrate" in navigator) navigator.vibrate(12);
  }, [game.power]);

  const buyUpgrade = () => {
    if (game.coins < game.upgradeCost) { setToast("Пока не хватает монет."); return; }
    setGame((old) => ({ ...old, coins: old.coins - old.upgradeCost, power: old.power + 1, upgradeCost: Math.ceil(old.upgradeCost * 1.65) }));
    setToast("Улучшение куплено! Сила клика выросла.");
  };

  const reset = () => {
    if (!window.confirm("Сбросить весь прогресс на этом устройстве?")) return;
    setGame(INITIAL);
    setToast("Новый остров ждёт приключений!");
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  };

  const formattedCoins = useMemo(() => game.coins.toLocaleString("ru-RU"), [game.coins]);

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">◆</span><div><b>ONETAP</b><small>LOW POLY ISLAND</small></div></div>
        <div className="coin-counter"><span className="coin-icon">◈</span><strong>{formattedCoins}</strong><span className="plus">+</span></div>
        <div className="level-chip"><span>★</span><b>УР. {game.level}</b></div>
      </header>

      <section className="scene" aria-label="Игровой остров">
        <div className="sun" />
        <div className="mountain mountain-back" />
        <div className="mountain mountain-front" />
        <div className="cloud cloud-one" /><div className="cloud cloud-two" />
        <div className="pine pine-one"><i/><i/><i/></div>
        <div className="pine pine-two"><i/><i/><i/></div>
        <div className="pine pine-three"><i/><i/><i/></div>
        <div className="river" />
        <div className="cottage"><div className="roof"/><div className="door"/><div className="window"/></div>
        <div className="chest"><div className="chest-lid"/><div className="chest-body"/><div className="chest-lock">◆</div><span className="chest-coin c1">◈</span><span className="chest-coin c2">◈</span><span className="chest-coin c3">◈</span></div>
        <div className="island-ground" />
        <div className="stone-base" />
        <div className="tap-wrap">
          <button className="tap-button" onPointerDown={tap} aria-label="Нажать и получить монеты">
            <span className="tap-gem">◆</span><b>ТАП</b><small>+{game.power} ЗА КЛИК</small>
            {floating.map((item) => <span key={item.id} className="float-coin" style={{ left: `${item.x}%`, top: `${item.y}%` }}>+{item.value} ◈</span>)}
          </button>
        </div>
        <div className="toast" aria-live="polite">{toast}</div>
        <div className="scene-hint">ТВОЙ ОСТРОВ • КЛИКАЙ, ЧТОБЫ РАЗВИВАТЬСЯ</div>
      </section>

      <section className="stats-grid">
        <div className="stat-card"><span className="stat-symbol">↗</span><div><small>ВСЕГО КЛИКОВ</small><b>{game.taps.toLocaleString("ru-RU")}</b></div></div>
        <div className="stat-card"><span className="stat-symbol">ϟ</span><div><small>СИЛА КЛИКА</small><b>+{game.power}</b></div></div>
        <div className="stat-card"><span className="stat-symbol">★</span><div><small>РЕКОРД БАЛАНСА</small><b>{game.bestCoins.toLocaleString("ru-RU")}</b></div></div>
      </section>

      <section className="shop-card">
        <div className="shop-heading"><div><small>УЛУЧШЕНИЯ</small><h2>Магазин острова</h2></div><span className="shop-bag">▣</span></div>
        <div className="upgrade-row">
          <div className="upgrade-icon">⚡</div>
          <div className="upgrade-copy"><b>Мощный палец</b><small>Добавляет +1 монету за каждый клик</small><em>Следующий уровень: +{game.power + 1} за клик</em></div>
          <div className="upgrade-price"><b>{game.upgradeCost.toLocaleString("ru-RU")}</b><small>◈</small></div>
        </div>
        <button className="buy-button" onClick={buyUpgrade} disabled={game.coins < game.upgradeCost}>КУПИТЬ УЛУЧШЕНИЕ <span>›</span></button>
      </section>

      <section className="progress-card">
        <div className="progress-title"><b>ПРОГРЕСС УРОВНЯ {game.level}</b><small>{levelProgress} / {nextLevelAt} кликов</small></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${levelProgress}%` }} /></div>
      </section>

      <footer><span>ONETAP · PWA</span><button onClick={reset}>Сбросить прогресс</button>{installEvent && <button onClick={install}>Установить приложение</button>}{installed && <span>Установлено ✓</span>}</footer>
    </main>
  );
}
