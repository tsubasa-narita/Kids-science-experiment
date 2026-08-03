"use client";
/* The five decoded story frames intentionally use relative <img> URLs so the
   same build works at both the site root and the GitHub Pages base path. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";

type FlowerPhenomenonProps = {
  onTry: () => void;
  onBack: () => void;
};

type AssetState = "loading" | "ready" | "error";

const frameSources = [
  "flower-story/frame-01-closed.webp",
  "flower-story/frame-02-contact.webp",
  "flower-story/frame-03-absorbing.webp",
  "flower-story/frame-04-half-open.webp",
  "flower-story/frame-05-open.webp",
] as const;

const conclusion = "みずを すって、ひらいた！";
const visualDescription = "おりたたんだ紙の花を水に浮かべると、水を吸って花びらがゆっくり開くようすを、5枚の絵で順番に示しています。";
const completionAnnouncement = "ショーが おわりました。やってみたい、もういちど みる、ほかの ふしぎを えらべます";

export function FlowerPhenomenon({ onTry, onBack }: FlowerPhenomenonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const tryButtonRef = useRef<HTMLButtonElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const runRef = useRef(0);
  const completeRef = useRef(false);
  const [assetState, setAssetState] = useState<AssetState>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
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

    const frameTiming = [
      { delay: 0, duration: 1500, fadeIn: false, keep: false },
      { delay: 1250, duration: 2200, fadeIn: true, keep: false },
      { delay: 2850, duration: 2750, fadeIn: true, keep: false },
      { delay: 4950, duration: 3000, fadeIn: true, keep: false },
      { delay: 7250, duration: 2750, fadeIn: true, keep: true },
    ];

    root.querySelectorAll<HTMLElement>(".phenomenon-frame").forEach((frame, index) => {
      const timing = frameTiming[index];
      const startOpacity = timing.fadeIn ? 0 : 1;
      const keyframes: Keyframe[] = timing.keep
        ? [
            { opacity: startOpacity, transform: "scale(1.008)" },
            { opacity: 1, offset: 0.13, transform: "scale(1.004)" },
            { opacity: 1, transform: "scale(1)" },
          ]
        : [
            { opacity: startOpacity, transform: "scale(1.008)" },
            { opacity: 1, offset: timing.fadeIn ? 0.13 : 0, transform: "scale(1.004)" },
            { opacity: 1, offset: 0.84, transform: "scale(1.001)" },
            { opacity: 0, transform: "scale(1)" },
          ];
      animations.push(frame.animate(keyframes, {
        delay: timing.delay,
        duration: timing.duration,
        easing: "linear",
        fill: "both",
      }));
    });

    const captions = [
      { selector: ".phenomenon-caption-contact", delay: 1280, duration: 1560 },
      { selector: ".phenomenon-caption-absorb", delay: 2860, duration: 2180 },
      { selector: ".phenomenon-caption-loosen", delay: 5000, duration: 2260 },
      { selector: ".phenomenon-caption-open", delay: 7280, duration: 1700 },
    ];
    captions.forEach(({ selector, delay, duration }) => {
      animate(selector, [
        { opacity: 0, transform: "translate3d(-50%,7px,0)" },
        { opacity: 1, offset: 0.16, transform: "translate3d(-50%,0,0)" },
        { opacity: 1, offset: 0.82, transform: "translate3d(-50%,0,0)" },
        { opacity: 0, transform: "translate3d(-50%,-4px,0)" },
      ], { delay, duration, easing: "cubic-bezier(.22,1,.36,1)" });
    });
    animate(".phenomenon-conclusion", [
      { opacity: 0, transform: "translate3d(0,6px,0)" },
      { opacity: 1, transform: "translate3d(0,0,0)" },
    ], { delay: 9100, duration: 600, easing: "cubic-bezier(.22,1,.36,1)" });

    [0, 1, 2].forEach((index) => {
      const delays = [0, 2850, 4950];
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
    let active = true;
    cancelAnimations();

    const preload = (source: string) => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        image.decode().then(resolve).catch(reject);
      };
      image.onerror = () => reject(new Error(`Could not load ${source}`));
      image.src = source;
    });

    Promise.all(frameSources.map(preload)).then(() => {
      if (active) setAssetState("ready");
    }).catch(() => {
      if (active) setAssetState("error");
    });

    return () => {
      active = false;
    };
  }, [cancelAnimations, loadAttempt]);

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
    };
    const onVisibilityChange = () => {
      if (document.hidden && !completeRef.current) {
        animationsRef.current.forEach((animation) => animation.pause());
        setPaused(true);
      }
    };

    completeRef.current = media.matches;
    setReducedMotion(media.matches);
    media.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      media.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimations();
    };
  }, [cancelAnimations]);

  useEffect(() => {
    if (assetState !== "ready") return;
    if (reducedMotion) {
      completeRef.current = true;
      return;
    }
    const frame = requestAnimationFrame(() => {
      startShow();
      if (document.hidden) {
        animationsRef.current.forEach((animation) => animation.pause());
        setPaused(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [assetState, reducedMotion, startShow]);

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

  const sharedHeading = <>
    <span className="phenomenon-visual-badge">えで みてみよう</span>
    <p className="eyebrow">10びょう ふしぎショー</p>
    <h2 ref={headingRef} tabIndex={-1}>ひらく 紙の花</h2>
    <p className="phenomenon-description">このショーは、へんかを 10びょうに まとめた えだよ。ほんものは もっと ゆっくりだったり、すこしだけ ひらくことも あるよ。</p>
    <p className="sr-only">{visualDescription}</p>
  </>;

  if (assetState === "loading") {
    return <section className="phenomenon-shell" ref={rootRef}>
      {sharedHeading}
      <div className="phenomenon-loading" role="status"><span aria-hidden="true" />ショーを じゅんびしているよ</div>
      <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
    </section>;
  }

  if (assetState === "error") {
    return <section className="phenomenon-shell" ref={rootRef}>
      {sharedHeading}
      <div className="phenomenon-error">
        <img src={frameSources[0]} alt="おりたたんだ紙の花の絵" />
        <p><b>ショーを よみこめなかったよ</b><br />つうしんを たしかめて、もういちど おしてね。</p>
        <button onClick={() => {
          setAssetState("loading");
          setLoadAttempt((attempt) => attempt + 1);
        }}>もういちど よみこむ</button>
      </div>
      <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
    </section>;
  }

  if (reducedMotion) {
    return <section className="phenomenon-shell phenomenon-reduced" ref={rootRef}>
      {sharedHeading}
      <div className="phenomenon-storyboard phenomenon-image-storyboard" aria-hidden="true">
        {[0, 2, 4].map((frame, index) => <div key={frame}>
          <b>{index + 1}. {index === 0 ? "おく" : index === 1 ? "みずを すう" : "ひらく"}</b>
          <img src={frameSources[frame]} alt="" />
          <small>{index === 0 ? "とじた はな" : index === 1 ? "みずが すすむ" : "ぜんぶ ひらく"}</small>
        </div>)}
      </div>
      <p className="phenomenon-reduced-conclusion">{conclusion}</p>
      <div className="phenomenon-finish-actions">
        <button className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>
        <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
      </div>
    </section>;
  }

  return <section className="phenomenon-shell" ref={rootRef}>
    {sharedHeading}
    <div className="phenomenon-scene phenomenon-image-scene" aria-hidden="true">
      {frameSources.map((source, index) => <img
        className={`phenomenon-frame phenomenon-frame-${index + 1}`}
        src={source}
        alt=""
        key={source}
      />)}
      <span className="phenomenon-caption phenomenon-caption-contact">おみずに ふれた！</span>
      <span className="phenomenon-caption phenomenon-caption-absorb">すーっ… かみが みずを すう</span>
      <span className="phenomenon-caption phenomenon-caption-loosen">じわ〜… おりめが ゆるむ</span>
      <span className="phenomenon-caption phenomenon-caption-open">ぱあっ！ はなが ひらいた</span>
      <p className="phenomenon-conclusion">{conclusion}</p>
    </div>
    <div className="phenomenon-phases" aria-label="ショーの段階" role="list">
      <span className="phenomenon-phase" role="listitem"><b>1</b> おく</span>
      <span className="phenomenon-phase" role="listitem"><b>2</b> すう</span>
      <span className="phenomenon-phase" role="listitem"><b>3</b> ひらく</span>
    </div>
    {!complete && <button ref={pauseButtonRef} className="phenomenon-pause" onClick={togglePause} aria-label={paused ? "ショーの つづきを みる" : "ショーを いったん とめる"}>{paused ? "つづきを みる" : "いったん とめる"}</button>}
    {complete && <div className="phenomenon-finish-actions">
      <button ref={tryButtonRef} className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>
      <button className="phenomenon-replay" onClick={() => startShow(true)} aria-label="10びょうショーを もういちど みる">もういちど みる</button>
      <button className="back" onClick={leaveShow} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
    </div>}
    <p className="sr-only" aria-live="polite">{announcement}</p>
  </section>;
}
