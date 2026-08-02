"use client";

import { useEffect, useRef, useState } from "react";
import { FlowerPhenomenon } from "./FlowerPhenomenon";

type Screen = "home" | "show" | "handoff" | "check" | "steps" | "observe" | "why" | "coming";

const flowerSteps = [
  ["こども", "はなを おりたたもう", "かみを はなの かたちに おって、はなびらを まんなかへ たたもう。", "✿"],
  ["おとな", "おみずを いれる", "おさらに おみずを いれよう。さらの そこが ぬれるくらいで じゅうぶん。", "◌"],
  ["こども", "はなを うかべる", "たたんだ はなを、おみずの うえに そっと おこう。", "⌁"],
  ["こども", "じっと みる", "ゆっくり かわるかな？ おめめで よく みてみよう。", "◉"],
];

const checks = [
  "おとなと いっしょに やります",
  "水や ぬれた紙を 口に いれません",
  "ぬれた手で たんまつを さわりません",
  "タオルと ひくい つくえを よういしました",
];

function SpeakButton({ text }: { text: string }) {
  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.82;
      window.speechSynthesis.speak(utterance);
    }
  };
  return <button className="listen" onClick={speak} aria-label="この文を よみあげる">♪ きく</button>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState("ひらく紙の花");
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const [step, setStep] = useState(0);
  const [observation, setObservation] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    headingRef.current?.focus({ preventScroll: true });
  }, [screen, step]);

  const chooseExperiment = (name: string) => {
    setSelected(name);
    setScreen(name === "ひらく紙の花" ? "show" : "coming");
  };
  const reset = () => { setObservation(""); setChecked([false, false, false, false]); setStep(0); setScreen("home"); };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="ホームへ もどる"><span>✦</span> ふしぎのたね</button>
        <span className="adult-badge">おうちで あそぶ かがく</span>
      </header>

      <div className={`screen screen--${screen}`} key={screen}>
      {screen === "home" && <section className="home">
        <p className="eyebrow">きょうは どの ふしぎ？</p>
        <h1 ref={headingRef} tabIndex={-1}>どの ふしぎを<br /><em>みる？</em></h1>
        <p className="lead">カードを おすと、10びょうで<br />ぜんぶ みられるよ。</p>
        <div className="experiment-grid">
          <button className="experiment-card flower-card" onClick={() => chooseExperiment("ひらく紙の花")} aria-label="ひらく紙の花を 10びょうで みる">
            <div className="card-status">いま できる</div><div className="scene flower-scene"><i /><i /><i /><i /><b>⌁</b></div>
            <span className="tag">みず × かみ</span><strong>ひらく 紙の花</strong><small>おみずで はなびらが…？</small><span className="card-go">10びょうで みる →</span>
          </button>
          <button className="experiment-card rainbow-card" onClick={() => chooseExperiment("ペーパータオルの虹")} aria-label="ペーパータオルの虹の よこくを みる。じゅんび中">
            <div className="card-status quiet">じゅんび中</div><div className="scene rainbow-scene"><i /><i /><i /><b>⌇</b></div>
            <span className="tag">いろ × みず</span><strong>ペーパータオルの虹</strong><small>いろが あるいていく？</small><span className="card-go">よこくをみる →</span>
          </button>
          <button className="experiment-card shadow-card" onClick={() => chooseExperiment("LEDで影くらべ")} aria-label="LEDで影くらべの よこくを みる。じゅんび中">
            <div className="card-status quiet">じゅんび中</div><div className="scene shadow-scene"><b>●</b><i>▲</i><span>▲</span></div>
            <span className="tag">ひかり × かげ</span><strong>LEDで 影くらべ</strong><small>かげは どこまで のびる？</small><span className="card-go">よこくをみる →</span>
          </button>
        </div>
        <aside className="device-note"><span>⌁</span><p><b>だいじな おやくそく</b><br />おみずを つかうときは、ききや タブレットを おみずから はなそう。</p></aside>
      </section>}

      {screen === "show" && <FlowerPhenomenon onTry={() => setScreen("handoff")} onBack={reset} />}

      {screen === "handoff" && <section className="flow-screen handoff-screen">
        <p className="eyebrow">おうちのひとへ</p>
        <h2 ref={headingRef} tabIndex={-1}>おうちのひとに<br /><em>わたしてね</em></h2>
        <div className="handoff-mark" aria-hidden="true"><span>こども</span><b>→</b><span>おとな</span></div>
        <p className="lead">ここからは おとなのひとと<br />いっしょに。</p>
        <button className="primary" onClick={() => setScreen("check")}>おとなが かくにんする <span>→</span></button>
        <button className="back" onClick={() => setScreen("show")}>← ショーへ もどる</button>
      </section>}

      {screen === "check" && <section className="flow-screen guardian-screen">
        <p className="eyebrow">おとなの かたへ</p><h2 ref={headingRef} tabIndex={-1}>はじめる まえに<br /><em>4つ チェック</em></h2>
        <div className="materials"><span>用意するもの</span><b>15cmくらいの おりがみ・水・あさい プラスチックのさら・タオル</b><small>※大人が10cm以上の、4まい花びらの形に切ります。小さい切れは片づけてから始めます。水は皿の底がぬれるくらいで十分です。</small></div>
        <div className="checklist">{checks.map((item, index) => <label key={item}><input type="checkbox" checked={checked[index]} onChange={() => setChecked(prev => prev.map((value, i) => i === index ? !value : value))} /><span className="checkmark">✓</span>{item}</label>)}</div>
        <p className="water-warning">⌁ おみずを こぼしたら、いったん おやすみ。おとなと タオルで ふこう。ききは ぬらさないでね。</p>
        <button className="primary" disabled={!checked.every(Boolean)} onClick={() => setScreen("steps")}>じゅんび できた！ <span>→</span></button>
      </section>}

      {screen === "steps" && <section className="flow-screen steps-screen">
        <p className="progress">{step + 1} / {flowerSteps.length}</p><span className={`role role-${flowerSteps[step][0]}`}>{flowerSteps[step][0]} の しごと</span><div className={`step-visual step-visual-${step}`} key={step} aria-hidden="true"><i /><i /><i /><i /><b>●</b><span>⌁ ⌁ ⌁</span><em>◌</em></div>
        <h2 ref={headingRef} tabIndex={-1}>{flowerSteps[step][1]}</h2><p className="step-copy">{flowerSteps[step][2]}</p><SpeakButton text={flowerSteps[step][2]} />
        <div className="step-dots">{flowerSteps.map((_, i) => <span key={i} className={i === step ? "active" : i < step ? "done" : ""}>{i + 1}</span>)}</div>
        <button className="primary" onClick={() => step < flowerSteps.length - 1 ? setStep(step + 1) : setScreen("observe")}>{step < flowerSteps.length - 1 ? "できた！ つぎへ" : "みてみよう！"} <span>→</span></button>
        {step > 0 && <button className="back" onClick={() => setStep(step - 1)}>← ひとつ もどる</button>}
      </section>}

      {screen === "observe" && <section className="flow-screen observe-screen">
        <p className="eyebrow">みつけた！</p><h2 ref={headingRef} tabIndex={-1}>どんなふうに<br /><em>なった？</em></h2>
        <div className={`observation-scene ${observation || "waiting"}`}><b>{observation ? "きみが みつけた ようす" : "？"}</b><div className="result-flower" aria-hidden="true"><i /><i /><i /><i /><em>●</em></div><span>⌁ ⌁ ⌁</span></div>
        <p className="prompt">みえたことを えらんでね。<br />どれも だいじな はっけんだよ。</p>
        <div className="observation-options">
          {[["open", "ひらいた"], ["little", "すこし ひらいた"], ["still", "かわらなかった"]].map(([id, label]) => <button key={id} className={observation === id ? "selected" : ""} onClick={() => setObservation(id)} aria-pressed={observation === id}>{label}</button>)}
        </div>
        {observation && <div className="talk-chip">{observation === "open" ? "ひらいたところを みつけたね。どこから うごいたかな？" : observation === "little" ? "すこしの へんかも だいじな はっけん。もうすこし みてみよう。" : "かわらなかったのも だいじな はっけん。紙の あつさや おりかたで ちがってみえることが あるよ。"}</div>}
        <button className="primary" disabled={!observation} onClick={() => setScreen("why")}>ふしぎの ひみつ <span>→</span></button>
      </section>}

      {screen === "why" && <section className="flow-screen why-screen">
        <p className="eyebrow">ふしぎの ひみつ</p><h2 ref={headingRef} tabIndex={-1}>紙は おみずを<br /><em>すいこむんだ。</em></h2>
        <div className="secret-visual"><b>かみ</b><i>⌁</i><span>おみず</span></div>
        <p className="step-copy">紙が おみずを すいこむと、紙の なかが ふくらむよ。おりたたんだ 花びらが、ゆっくり ひらいていくんだ。</p><SpeakButton text="紙が おみずを すいこむと、紙の なかが ふくらむよ。おりたたんだ 花びらが、ゆっくり ひらいていくんだ。" />
        <div className="try-more"><b>こんどは ためしてみよう</b><span>ちがう あつさの紙だと、ひらく はやさは かわるかな？ ひらきにくいときは、かどを きつく おりすぎていないか みてみよう。</span></div>
        <div className="cleanup"><b>おわったら かたづけよう</b><span>おとなと 水を すてて、さらと つくえを タオルで ふこう。</span></div>
        <button className="primary" onClick={reset}>ほかの ふしぎを みる <span>→</span></button>
      </section>}

      {screen === "coming" && <section className="flow-screen coming"><p className="eyebrow">{selected}</p><div className="coming-icon">✦</div><h2 ref={headingRef} tabIndex={-1}>この ふしぎは<br /><em>じゅんび中！</em></h2><p className="lead">もうすぐ カードから よそうして<br />あそべるように なるよ。</p><button className="primary" onClick={reset}>ほかの カードを みる <span>→</span></button></section>}
      </div>
      <footer>ふしぎは みて、ためして、はなしてみよう。</footer>
    </main>
  );
}
