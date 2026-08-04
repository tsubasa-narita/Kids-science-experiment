"use client";
/* Relative <img> URLs keep the same static build working at the site root and
   under the GitHub Pages repository base path. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";

export type ExperimentId = "flower" | "rainbow" | "shadow";

type CaptionCue = {
  text: string;
  delay: number;
  duration: number;
};

export type PhenomenonConfig = {
  id: ExperimentId;
  title: string;
  frames: readonly [string, string, string, string, string];
  captions: readonly CaptionCue[];
  conclusion: string;
  description: string;
  srDescription: string;
  reducedLabels: readonly [string, string, string];
  phaseLabels: readonly [string, string, string];
  fallbackAlt: string;
  showOnly?: boolean;
  safetyNotice?: string;
};

type ImagePhenomenonProps = {
  config: PhenomenonConfig;
  onBack: () => void;
  onTry?: () => void;
};

type AssetState = "loading" | "ready" | "error";

const cue = (text: string, delay: number, duration: number): CaptionCue => ({ text, delay, duration });

export const phenomenonConfigs: Record<ExperimentId, PhenomenonConfig> = {
  flower: {
    id: "flower",
    title: "ひらく 紙の花",
    frames: [
      "flower-story/frame-01-closed.webp",
      "flower-story/frame-02-contact.webp",
      "flower-story/frame-03-absorbing.webp",
      "flower-story/frame-04-half-open.webp",
      "flower-story/frame-05-open.webp",
    ],
    captions: [
      cue("おみずに ふれた！", 1280, 1560),
      cue("すーっ… かみが みずを すう", 2860, 2180),
      cue("じわ〜… おりめが ゆるむ", 5000, 2260),
      cue("ぱあっ！ はなが ひらいた", 7280, 1700),
    ],
    conclusion: "みずを すって、ひらいた！",
    description: "このショーは、へんかを 10びょうに まとめた えだよ。ほんものは もっと ゆっくりだったり、すこしだけ ひらくことも あるよ。",
    srDescription: "おりたたんだ紙の花を水に浮かべると、水を吸って花びらがゆっくり開くようすを、5枚の絵で順番に示しています。",
    reducedLabels: ["とじた はな", "みずが すすむ", "ぜんぶ ひらく"],
    phaseLabels: ["おく", "すう", "ひらく"],
    fallbackAlt: "おりたたんだ紙の花の絵",
  },
  rainbow: {
    id: "rainbow",
    title: "あるく いろみず",
    frames: [
      "rainbow-story/frame-01-dry.webp",
      "rainbow-story/frame-02-climb.webp",
      "rainbow-story/frame-03-cross.webp",
      "rainbow-story/frame-04-arrive.webp",
      "rainbow-story/frame-05-green.webp",
    ],
    captions: [
      cue("きいろと あおを かみで つなぐ", 100, 1180),
      cue("すーっ… いろみずを すう", 1280, 1540),
      cue("うえまで のぼって…", 2860, 2060),
      cue("まんなかの コップへ", 5000, 2100),
      cue("きいろと あおで、みどり！", 7280, 1700),
    ],
    conclusion: "みずが わたって、いろが まざった！",
    description: "このショーは、いろみずの へんかを 10びょうに まとめた えだよ。ほんものは もっと じかんが かかるよ。",
    srDescription: "黄色と青の色水が紙を伝って中央のコップへ移動し、緑色に混ざるようすを、5枚の絵で順番に示しています。",
    reducedLabels: ["かみで つなぐ", "いろみずが すすむ", "みどりに まざる"],
    phaseLabels: ["つなぐ", "すすむ", "まざる"],
    fallbackAlt: "黄色と青の色水を紙でつないだ絵",
    showOnly: true,
  },
  shadow: {
    id: "shadow",
    title: "LEDで 影くらべ",
    frames: [
      "shadow-story/frame-01-far.webp",
      "shadow-story/frame-02-nearer.webp",
      "shadow-story/frame-03-middle.webp",
      "shadow-story/frame-04-close.webp",
      "shadow-story/frame-05-nearest.webp",
    ],
    captions: [
      cue("ライト → もの → かべ", 100, 1180),
      cue("ライトを ちかづけると…", 1280, 1540),
      cue("かげが すこし おおきい", 2860, 2060),
      cue("もっと ちかづける", 5000, 2100),
      cue("ぐーん！ かげが おおきい", 7280, 1700),
    ],
    conclusion: "ライトが ちかいと、かげが おおきい！",
    description: "ものと かべは うごかさず、ライトだけを すこしずつ ちかづけた えだよ。",
    srDescription: "物と壁の位置は変えず、ライトだけを物へ近づけると、壁に映る影が大きくなるようすを、5枚の絵で順番に示しています。",
    reducedLabels: ["ライトが とおい", "すこし ちかい", "いちばん ちかい"],
    phaseLabels: ["とおい", "ちかづく", "おおきい"],
    fallbackAlt: "ライトと物と壁に映る影の絵",
    showOnly: true,
    safetyNotice: "ライトを めに むけたり、のぞきこんだり しないでね。",
  },
};

const frameTiming = [
  { delay: 0, duration: 1500, fadeIn: false, keep: false },
  { delay: 1250, duration: 2200, fadeIn: true, keep: false },
  { delay: 2850, duration: 2750, fadeIn: true, keep: false },
  { delay: 4950, duration: 3000, fadeIn: true, keep: false },
  { delay: 7250, duration: 2750, fadeIn: true, keep: true },
] as const;

export function ImagePhenomenon({ config, onBack, onTry }: ImagePhenomenonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const firstFinishButtonRef = useRef<HTMLButtonElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const runRef = useRef(0);
  const completeRef = useRef(false);
  const [assetState, setAssetState] = useState<AssetState>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [complete, setComplete] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const canTry = !config.showOnly && Boolean(onTry);
  const completionAnnouncement = canTry
    ? "ショーが おわりました。やってみたい、もういちど みる、ほかの ふしぎを えらべます"
    : "ショーが おわりました。もういちど みる、ほかの ふしぎを えらべます";

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
    const animate = (selector: string, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (element) animations.push(element.animate(keyframes, { fill: "both", ...options }));
    };

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
      animations.push(frame.animate(keyframes, { delay: timing.delay, duration: timing.duration, easing: "linear", fill: "both" }));
    });

    config.captions.forEach((caption, index) => {
      animate(`.phenomenon-caption-${index + 1}`, [
        { opacity: 0, transform: "translate3d(-50%,7px,0)" },
        { opacity: 1, offset: 0.16, transform: "translate3d(-50%,0,0)" },
        { opacity: 1, offset: 0.82, transform: "translate3d(-50%,0,0)" },
        { opacity: 0, transform: "translate3d(-50%,-4px,0)" },
      ], { delay: caption.delay, duration: caption.duration, easing: "cubic-bezier(.22,1,.36,1)" });
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
      if (shouldMoveFocus) requestAnimationFrame(() => firstFinishButtonRef.current?.focus({ preventScroll: true }));
    }).catch(() => undefined);
    if (focusPauseAfterStart) requestAnimationFrame(() => pauseButtonRef.current?.focus({ preventScroll: true }));
  }, [cancelAnimations, completionAnnouncement, config]);

  useEffect(() => {
    let active = true;
    cancelAnimations();
    const preload = (source: string) => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.decode().then(resolve).catch(reject);
      image.onerror = () => reject(new Error(`Could not load ${source}`));
      image.src = source;
    });
    Promise.all(config.frames.map(preload)).then(() => {
      if (active) setAssetState("ready");
    }).catch(() => {
      if (active) setAssetState("error");
    });
    return () => { active = false; };
  }, [cancelAnimations, config, loadAttempt]);

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
  }, [cancelAnimations, completionAnnouncement]);

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
    animationsRef.current.forEach((animation) => paused ? animation.play() : animation.pause());
    setPaused((value) => !value);
  };
  const leaveShow = () => { cancelAnimations(); onBack(); };
  const retry = () => { setAssetState("loading"); setLoadAttempt((attempt) => attempt + 1); };

  const heading = <>
    <span className="phenomenon-visual-badge">えで みてみよう</span>
    <p className="eyebrow">10びょう ふしぎショー</p>
    <h2 ref={headingRef} tabIndex={-1}>{config.title}</h2>
    <p className="phenomenon-description">{config.description}</p>
    {config.safetyNotice && <p className="phenomenon-safety-note">！ {config.safetyNotice}</p>}
    <p className="sr-only">{config.srDescription}</p>
  </>;
  const showOnlyNotice = config.showOnly && <aside className="phenomenon-recipe-notice">
    <b>おうちで やる レシピは じゅんび中</b>
    <p>安全な材料と手順を確認中です。絵だけを見て再現しないでください。</p>
  </aside>;

  if (assetState === "loading") return <section className={`phenomenon-shell phenomenon-${config.id}`} ref={rootRef}>
    {heading}<div className="phenomenon-loading" role="status"><span aria-hidden="true" />ショーを じゅんびしているよ</div>
    <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
  </section>;

  if (assetState === "error") return <section className={`phenomenon-shell phenomenon-${config.id}`} ref={rootRef}>
    {heading}<div className="phenomenon-error"><img src={config.frames[0]} alt={config.fallbackAlt} />
      <p><b>ショーを よみこめなかったよ</b><br />つうしんを たしかめて、もういちど おしてね。</p>
      <button onClick={retry}>もういちど よみこむ</button></div>
    <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
  </section>;

  if (reducedMotion) return <section className={`phenomenon-shell phenomenon-reduced phenomenon-${config.id}`} ref={rootRef}>
    {heading}<div className="phenomenon-storyboard phenomenon-image-storyboard" aria-hidden="true">
      {[0, 2, 4].map((frame, index) => <div key={frame}><b>{index + 1}. {config.phaseLabels[index]}</b>
        <img src={config.frames[frame]} alt="" /><small>{config.reducedLabels[index]}</small></div>)}
    </div><p className="phenomenon-reduced-conclusion">{config.conclusion}</p>{showOnlyNotice}
    <div className="phenomenon-finish-actions">
      {canTry && <button className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>}
      <button className="back" onClick={onBack} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
    </div>
  </section>;

  return <section className={`phenomenon-shell phenomenon-${config.id}`} ref={rootRef}>
    {heading}<div className="phenomenon-scene phenomenon-image-scene" aria-hidden="true">
      {config.frames.map((source, index) => <img className={`phenomenon-frame phenomenon-frame-${index + 1}`} src={source} alt="" key={source} />)}
      {config.captions.map((caption, index) => <span className={`phenomenon-caption phenomenon-caption-${index + 1}`} key={caption.text}>{caption.text}</span>)}
      <p className="phenomenon-conclusion">{config.conclusion}</p>
    </div>
    <div className="phenomenon-phases" aria-label="ショーの段階" role="list">
      {config.phaseLabels.map((label, index) => <span className="phenomenon-phase" role="listitem" key={label}><b>{index + 1}</b> {label}</span>)}
    </div>
    {!complete && <button ref={pauseButtonRef} className="phenomenon-pause" onClick={togglePause} aria-label={paused ? "ショーの つづきを みる" : "ショーを いったん とめる"}>{paused ? "つづきを みる" : "いったん とめる"}</button>}
    {complete && <>{showOnlyNotice}<div className="phenomenon-finish-actions">
      {canTry && <button ref={firstFinishButtonRef} className="primary" onClick={onTry} aria-label="やってみたい。おうちのひとへ わたす">やってみたい！ <span>→</span></button>}
      <button ref={canTry ? undefined : firstFinishButtonRef} className="phenomenon-replay" onClick={() => startShow(true)} aria-label="10びょうショーを もういちど みる">もういちど みる</button>
      <button className="back" onClick={leaveShow} aria-label="ほかの ふしぎへ もどる">← ほかの ふしぎ</button>
    </div></>}
    <p className="sr-only" aria-live="polite">{announcement}</p>
  </section>;
}
