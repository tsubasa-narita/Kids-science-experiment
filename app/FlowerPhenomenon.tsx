"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FlowerPhenomenonProps = {
  onTry: () => void;
  onBack: () => void;
};

const conclusion = "みずを すって、ひらいた！";
const completionAnnouncement = "ショーが おわりました。やってみたい、もういちど みる、ほかの ふしぎを えらべます";

export function FlowerPhenomenon({ onTry, onBack }: FlowerPhenomenonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const tryButtonRef = useRef<HTMLButtonElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const runRef = useRef(0);
  const completeRef = useRef(false);
  const [complete, setComplete] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const cancelAnimations = useCallback(() => {
    runRef.current += 1;
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
  }, []);

  const startShow = useCallback((focusPauseAfterStart = false) => {
    const root = rootRef.current;
    if (!root) return;

    cancelAnimations();
    const currentRun = runRef.current;
    completeRef.current = false;
    setComplete(false);
    setPaused(false);
    setAnnouncement(focusPauseAfterStart ? "もういちど はじめるよ" : "");

    const animations: Animation[] = [];
    const animate = (
      selector: string,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (!element) return;
      animations.push(element.animate(keyframes, { fill: "both", ...options }));
    };

    animate(".phenomenon-scene", [
      { opacity: 0.72, transform: "translate3d(0,8px,0) scale(.992)" },
      { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
    ], { duration: 550, easing: "cubic-bezier(.22,1,.36,1)" });

    animate(".phenomenon-flower", [
      { transform: "translate3d(0,-82px,0)" },
      { transform: "translate3d(0,0,0)", offset: 0.88 },
      { transform: "translate3d(0,2px,0)" },
    ], { delay: 550, duration: 800, easing: "cubic-bezier(.22,1,.36,1)" });

    animate(".phenomenon-ripple-one", [
      { opacity: 0, transform: "translate3d(-50%,0,0) scaleX(.2)" },
      { opacity: 0.8, offset: 0.35, transform: "translate3d(-50%,0,0) scaleX(.72)" },
      { opacity: 0, transform: "translate3d(-50%,0,0) scaleX(1.18)" },
    ], { delay: 1240, duration: 820, easing: "cubic-bezier(.22,1,.36,1)" });
    animate(".phenomenon-ripple-two", [
      { opacity: 0, transform: "translate3d(-50%,0,0) scaleX(.25)" },
      { opacity: 0.55, offset: 0.35, transform: "translate3d(-50%,0,0) scaleX(.8)" },
      { opacity: 0, transform: "translate3d(-50%,0,0) scaleX(1.25)" },
    ], { delay: 1370, duration: 900, easing: "cubic-bezier(.22,1,.36,1)" });
    animate(".phenomenon-word-splash", [
      { opacity: 0, transform: "translate3d(0,7px,0) scale(.96)" },
      { opacity: 1, offset: 0.25, transform: "translate3d(0,0,0) scale(1)" },
      { opacity: 0, transform: "translate3d(0,-4px,0) scale(1)" },
    ], { delay: 1180, duration: 900, easing: "cubic-bezier(.22,1,.36,1)" });

    root.querySelectorAll<HTMLElement>(".phenomenon-absorb-line").forEach((line, index) => {
      animations.push(line.animate([
        { opacity: 0, transform: "scaleY(.05)" },
        { opacity: 0.82, offset: 0.28, transform: "scaleY(.34)" },
        { opacity: 0.9, transform: "scaleY(1)" },
      ], {
        delay: 1350 + index * 120,
        duration: 1880,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both",
      }));
    });
    root.querySelectorAll<HTMLElement>(".phenomenon-petal-wet").forEach((wet, index) => {
      animations.push(wet.animate([
        { opacity: 0, transform: "scaleY(.05)" },
        { opacity: 0.5, transform: "scaleY(1)" },
      ], {
        delay: 1760 + index * 120,
        duration: 1480,
        easing: "ease-out",
        fill: "both",
      }));
    });
    animate(".phenomenon-word-absorb", [
      { opacity: 0, transform: "translate3d(0,6px,0)" },
      { opacity: 1, offset: 0.28, transform: "translate3d(0,0,0)" },
      { opacity: 1, offset: 0.78, transform: "translate3d(0,0,0)" },
      { opacity: 0, transform: "translate3d(0,-3px,0)" },
    ], { delay: 1480, duration: 2200, easing: "cubic-bezier(.22,1,.36,1)" });

    root.querySelectorAll<HTMLElement>(".phenomenon-petal").forEach((petal, index) => {
      animations.push(petal.animate([
        { transform: "perspective(260px) rotateX(70deg) scaleY(.65)" },
        { transform: "perspective(260px) rotateX(20deg) scaleY(.9)", offset: 0.68 },
        { transform: "perspective(260px) rotateX(0deg) scaleY(1)" },
      ], {
        delay: 4350 + index * 120,
        duration: 3500 - index * 120,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both",
      }));
    });
    animate(".phenomenon-word-open", [
      { opacity: 0, transform: "translate3d(0,7px,0)" },
      { opacity: 1, offset: 0.25, transform: "translate3d(0,0,0)" },
      { opacity: 1, offset: 0.82, transform: "translate3d(0,0,0)" },
      { opacity: 0, transform: "translate3d(0,-3px,0)" },
    ], { delay: 4520, duration: 2800, easing: "cubic-bezier(.22,1,.36,1)" });
    animate(".phenomenon-full-ring", [
      { opacity: 0, transform: "translate3d(-50%,-50%,0) scale(.72)" },
      { opacity: 0.68, offset: 0.35, transform: "translate3d(-50%,-50%,0) scale(1)" },
      { opacity: 0, transform: "translate3d(-50%,-50%,0) scale(1.12)" },
    ], { delay: 7850, duration: 1250, easing: "cubic-bezier(.22,1,.36,1)" });
    animate(".phenomenon-word-full", [
      { opacity: 0, transform: "translate3d(0,7px,0) scale(.96)" },
      { opacity: 1, offset: 0.3, transform: "translate3d(0,0,0) scale(1)" },
      { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
    ], { delay: 7850, duration: 1250, easing: "cubic-bezier(.22,1,.36,1)" });
    animate(".phenomenon-conclusion", [
      { opacity: 0, transform: "translate3d(0,6px,0)" },
      { opacity: 1, transform: "translate3d(0,0,0)" },
    ], { delay: 9100, duration: 600, easing: "cubic-bezier(.22,1,.36,1)" });

    [0, 1, 2].forEach((index) => {
      const delays = [550, 1350, 4350];
      animate(`.phenomenon-phase:nth-child(${index + 1})`, [
        { opacity: 0.48, transform: "translate3d(0,0,0) scale(1)" },
        { opacity: 1, transform: "translate3d(0,-2px,0) scale(1.035)" },
      ], { delay: delays[index], duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
    });

    const clock = root.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 10000 });
    animations.push(clock);
    animationsRef.current = animations;
    clock.finished.then(() => {
      if (runRef.current !== currentRun) return;
      const shouldMoveFocus = document.activeElement === pauseButtonRef.current;
      completeRef.current = true;
      setComplete(true);
      setPaused(false);
      setAnnouncement(completionAnnouncement);
      if (shouldMoveFocus) {
        requestAnimationFrame(() => tryButtonRef.current?.focus({ preventScroll: true }));
      }
    }).catch(() => undefined);

    if (focusPauseAfterStart) {
      requestAnimationFrame(() => pauseButtonRef.current?.focus({ preventScroll: true }));
    }
  }, [cancelAnimations]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => {
      cancelAnimations();
      setReducedMotion(media.matches);
      completeRef.current = media.matches;
      setComplete(media.matches);
      setPaused(false);
      setAnnouncement(media.matches ? completionAnnouncement : "");
      if (!media.matches) requestAnimationFrame(() => startShow());
    };
    const onVisibilityChange = () => {
      if (document.hidden && !completeRef.current) {
        animationsRef.current.forEach((animation) => animation.pause());
        setPaused(true);
      }
    };

    media.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (media.matches) {
      setReducedMotion(true);
      completeRef.current = true;
      setComplete(true);
      setAnnouncement(completionAnnouncement);
    } else {
      requestAnimationFrame(() => startShow());
    }

    return () => {
      media.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimations();
    };
  }, [cancelAnimations, startShow]);

  const togglePause = () => {
    if (paused) {
      animationsRef.current.forEach((animation) => animation.play());
      setPaused(false);
    } else {
      animationsRef.current.forEach((animation) => animation.pause());
      setPaused(true);
    }
  };

  const leaveShow = () => {
    cancelAnimations();
    onBack();
  };

  if (reducedMotion) {
    return (
      <section className="phenomenon-shell phenomenon-reduced" ref={rootRef}>
        <p className="eyebrow">10びょう ふしぎショー</p>
        <h2 ref={headingRef} tabIndex={-1}>ひらく 紙の花</h2>
        <p className="phenomenon-description">おりたたんだ かみの はなを おみずに うかべると、みずを すって はなびらが ゆっくり ひらくよ。</p>
        <div className="phenomenon-storyboard" aria-label="紙の花が開く3つの段階" role="list">
          <div role="listitem"><b>① おく</b><span className="phenomenon-static-flower closed"><i /><i /><i /><i /><em>●</em><span className="phenomenon-static-water" /></span><small>とじた はな</small></div>
          <span className="phenomenon-story-arrow" aria-hidden="true"><b className="arrow-wide">→</b><b className="arrow-small">↓</b><small>つぎへ</small></span>
          <div role="listitem"><b>② みずを すう</b><span className="phenomenon-static-flower half"><i /><i /><i /><i /><em>●</em><span className="phenomenon-static-absorb" /><span className="phenomenon-static-water" /></span><small>みずが すすむ</small></div>
          <span className="phenomenon-story-arrow" aria-hidden="true"><b className="arrow-wide">→</b><b className="arrow-small">↓</b><small>つぎへ</small></span>
          <div role="listitem"><b>③ ひらく</b><span className="phenomenon-static-flower open"><i /><i /><i /><i /><em>●</em><span className="phenomenon-static-water" /></span><small>ぜんぶ ひらく</small></div>
        </div>
        <p className="phenomenon-reduced-conclusion">{conclusion}</p>
        <div className="phenomenon-finish-actions">
          <button className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>
          <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
        </div>
      </section>
    );
  }

  return (
    <section className="phenomenon-shell" ref={rootRef}>
      <p className="eyebrow">10びょう ふしぎショー</p>
      <h2 ref={headingRef} tabIndex={-1}>ひらく 紙の花</h2>
      <p className="phenomenon-description">おりたたんだ かみの はなを おみずに うかべると、みずを すって はなびらが ゆっくり ひらくよ。</p>
      <div className="phenomenon-scene" aria-hidden="true">
        <div className="phenomenon-sky" />
        <div className="phenomenon-full-ring" />
        <div className="phenomenon-flower">
          {[0, 1, 2, 3].map((petal) => (
            <span className={`phenomenon-petal-arm arm-${petal}`} key={petal}>
              <i className="phenomenon-petal"><span className="phenomenon-petal-wet" /><span className="phenomenon-absorb-line" /></i>
            </span>
          ))}
          <b className="phenomenon-center" />
        </div>
        <div className="phenomenon-water" />
        <div className="phenomenon-ripple phenomenon-ripple-one" />
        <div className="phenomenon-ripple phenomenon-ripple-two" />
        <span className="phenomenon-word phenomenon-word-splash">そっと</span>
        <span className="phenomenon-word phenomenon-word-absorb">すーっ</span>
        <span className="phenomenon-word phenomenon-word-open">じわ〜</span>
        <span className="phenomenon-word phenomenon-word-full">ぱあっ</span>
        <p className="phenomenon-conclusion">{conclusion}</p>
      </div>
      <div className="phenomenon-phases" aria-label="ショーの段階" role="list">
        <span className="phenomenon-phase" role="listitem"><b>1</b> おく</span>
        <span className="phenomenon-phase" role="listitem"><b>2</b> すう</span>
        <span className="phenomenon-phase" role="listitem"><b>3</b> ひらく</span>
      </div>
      {!complete && <button ref={pauseButtonRef} className="phenomenon-pause" onClick={togglePause} aria-label={paused ? "ショーの つづきを みる" : "ショーを いったん とめる"}>{paused ? "▶ つづきを みる" : "Ⅱ いったん とめる"}</button>}
      {complete && <div className="phenomenon-finish-actions">
        <button ref={tryButtonRef} className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>
        <button className="phenomenon-replay" onClick={() => startShow(true)} aria-label="10びょうショーを もういちど みる">↻ もういちど みる</button>
        <button className="back" onClick={leaveShow} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
      </div>}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  );
}
