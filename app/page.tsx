"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePhenomenon, phenomenonConfigs, type ExperimentId } from "./ImagePhenomenon";
import { recipeConfigs, recipeOrder, type RecipeRole } from "./recipes";

type Screen = "home" | "show" | "handoff" | "check" | "steps" | "observe" | "why";

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

function CardScene({ id }: { id: ExperimentId }) {
  if (id === "flower") return <div className="scene flower-scene"><i /><i /><i /><i /><b>⌁</b></div>;
  if (id === "rainbow") return <div className="scene rainbow-scene"><i /><i /><i /><b>⌇</b></div>;
  return <div className="scene shadow-scene"><b>●</b><i>▲</i><span>▲</span></div>;
}

function StepVisual({ id, step }: { id: ExperimentId; step: number }) {
  if (id === "flower") return <div className={`step-visual step-visual-${step}`} aria-hidden="true"><i /><i /><i /><i /><b>●</b><span>⌁ ⌁ ⌁</span><em>◌</em></div>;
  if (id === "rainbow") return <div className={`step-visual step-visual--rainbow-${step + 1}`} aria-hidden="true">
    <div className="rainbow-cups"><i /><i /><i /></div><b /><span /><em />
  </div>;
  return <div className={`step-visual step-visual--shadow-${step + 1}`} aria-hidden="true">
    <i className="shadow-light" /><b className="shadow-card-object" /><span className="shadow-wall" /><em className="shadow-beam" />
  </div>;
}

function ObservationVisual({ id }: { id: ExperimentId }) {
  if (id === "flower") return <><div className="result-flower" aria-hidden="true"><i /><i /><i /><i /><em>●</em></div><span aria-hidden="true">⌁ ⌁ ⌁</span></>;
  if (id === "rainbow") return <div className="result-rainbow" aria-hidden="true"><i /><i /><i /><b /></div>;
  return <div className="result-shadow" aria-hidden="true"><i /><b /><span /></div>;
}

function SecretVisual({ id }: { id: ExperimentId }) {
  if (id === "flower") return <div className="secret-visual secret-visual--flower" aria-hidden="true"><b>かみ</b><i>⌁</i><span>おみず</span></div>;
  if (id === "rainbow") return <div className="secret-visual secret-visual--rainbow" aria-hidden="true"><b>いろみず</b><i>→</i><span>紙の すきま</span><i>→</i><em>みどり</em></div>;
  return <div className="secret-visual secret-visual--shadow" aria-hidden="true"><b>ライト</b><i>→</i><span>カード</span><i>→</i><em>かげ</em></div>;
}

const roleClass = (role: RecipeRole) => role === "こども＋おとな" ? "role-いっしょ" : `role-${role}`;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState<ExperimentId>("flower");
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const [step, setStep] = useState(0);
  const [observation, setObservation] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const recipe = recipeConfigs[selected];
  const selectedObservation = recipe.observations.find((choice) => choice.id === observation);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    headingRef.current?.focus({ preventScroll: true });
  }, [screen, step]);

  const clearProgress = () => {
    window.speechSynthesis?.cancel();
    setChecked([false, false, false, false]);
    setStep(0);
    setObservation("");
  };
  const chooseExperiment = (experiment: ExperimentId) => {
    clearProgress();
    setSelected(experiment);
    setScreen("show");
  };
  const reset = () => {
    clearProgress();
    setSelected("flower");
    setScreen("home");
  };

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
          {recipeOrder.map((id) => {
            const card = recipeConfigs[id].card;
            return <button className={`experiment-card ${id}-card`} onClick={() => chooseExperiment(id)} aria-label={`${card.title}を 10びょうで みる。おうちで できる実験`} key={id}>
              <div className="card-status">おうちで できる</div><CardScene id={id} />
              <span className="tag">{card.tag}</span><strong>{card.title}</strong><small>{card.teaser}</small><span className="card-go">10びょうで みる →</span>
            </button>;
          })}
        </div>
        <aside className="device-note"><span>⌁</span><p><b>だいじな おやくそく</b><br />おみずや ライトを つかうときは、おとなと いっしょに。ききや タブレットは じっけんから はなそう。</p></aside>
      </section>}

      {screen === "show" && <ImagePhenomenon key={selected} config={phenomenonConfigs[selected]} onTry={() => setScreen("handoff")} onBack={reset} />}

      {screen === "handoff" && <section className="flow-screen handoff-screen">
        <p className="eyebrow">おうちのひとへ</p>
        <h2 ref={headingRef} tabIndex={-1}>おうちのひとに<br /><em>わたしてね</em></h2>
        <div className="handoff-mark" aria-hidden="true"><span>こども</span><b>→</b><span>おとな</span></div>
        <p className="lead">「{recipe.card.title}」は、ここから<br />おとなのひとと いっしょに。</p>
        <button className="primary" onClick={() => setScreen("check")}>おとなが かくにんする <span>→</span></button>
        <button className="back" onClick={() => setScreen("show")}>← ショーへ もどる</button>
      </section>}

      {screen === "check" && <section className="flow-screen guardian-screen">
        <p className="eyebrow">おとなの かたへ</p><h2 ref={headingRef} tabIndex={-1}>はじめる まえに<br /><em>4つ チェック</em></h2>
        <div className="recipe-time"><span>かかる時間</span><b>{recipe.time}</b>{recipe.firstChange && <small>{recipe.firstChange}</small>}</div>
        <div className="materials"><span>用意するもの</span><ul>{recipe.materials.map((item) => <li key={item}>{item}</li>)}</ul>
          {recipe.materialNote && <small>{recipe.materialNote}</small>}
          {recipe.prohibited && <small className="material-ban"><b>使わないもの</b>{recipe.prohibited}</small>}
        </div>
        <div className="checklist">{recipe.checks.map((item, index) => <label key={item}><input type="checkbox" checked={checked[index]} onChange={() => setChecked((previous) => previous.map((value, itemIndex) => itemIndex === index ? !value : value))} /><span className="checkmark">✓</span>{item}</label>)}</div>
        <p className="water-warning">！ {recipe.warning}</p>
        <button className="primary" disabled={!checked.every(Boolean)} onClick={() => setScreen("steps")}>じゅんび できた！ <span>→</span></button>
      </section>}

      {screen === "steps" && <section className="flow-screen steps-screen">
        <p className="progress">{step + 1} / {recipe.steps.length}</p>
        <span className={`role ${roleClass(recipe.steps[step].role)}`}>{recipe.steps[step].role} の しごと</span>
        <StepVisual id={selected} step={step} />
        <h2 ref={headingRef} tabIndex={-1}>{recipe.steps[step].title}</h2><p className="step-copy">{recipe.steps[step].body}</p><SpeakButton text={recipe.steps[step].body} />
        <div className="step-dots">{recipe.steps.map((_, index) => <span key={index} className={index === step ? "active" : index < step ? "done" : ""}>{index + 1}</span>)}</div>
        <button className="primary" onClick={() => step < recipe.steps.length - 1 ? setStep(step + 1) : setScreen("observe")}>{step < recipe.steps.length - 1 ? "できた！ つぎへ" : "みてみよう！"} <span>→</span></button>
        {step > 0 && <button className="back" onClick={() => setStep(step - 1)}>← ひとつ もどる</button>}
      </section>}

      {screen === "observe" && <section className="flow-screen observe-screen">
        <p className="eyebrow">みつけた！</p><h2 ref={headingRef} tabIndex={-1}>どんなふうに<br /><em>なった？</em></h2>
        <div className={`observation-scene observation-scene--${selected} ${observation || "waiting"}`}><b>{observation ? "きみが みつけた ようす" : "？"}</b><ObservationVisual id={selected} /></div>
        <p className="prompt">みえたことを えらんでね。<br />どれも だいじな はっけんだよ。</p>
        <div className="observation-options">{recipe.observations.map((choice) => <button key={choice.id} className={observation === choice.id ? "selected" : ""} onClick={() => setObservation(choice.id)} aria-pressed={observation === choice.id}>{choice.label}</button>)}</div>
        {selectedObservation && <div className="talk-chip" role="status">{selectedObservation.comment}</div>}
        <button className="primary" disabled={!observation} onClick={() => setScreen("why")}>ふしぎの ひみつ <span>→</span></button>
      </section>}

      {screen === "why" && <section className={`flow-screen why-screen why-screen--${selected}`}>
        <p className="eyebrow">ふしぎの ひみつ</p><h2 ref={headingRef} tabIndex={-1}>{recipe.why.heading[0]}<br /><em>{recipe.why.heading[1]}</em></h2>
        <SecretVisual id={selected} />
        <p className="step-copy">{recipe.why.body}</p><SpeakButton text={recipe.why.body} />
        <div className="guardian-note"><b>おうちのひとへ</b><span>{recipe.why.guardian}</span></div>
        <div className="try-more"><b>こんどは ためしてみよう</b><span>{recipe.why.tryMore}</span></div>
        <div className="misconception"><b>まちがえやすい ところ</b><span>{recipe.why.misconception}</span></div>
        <div className="cleanup"><b>おわったら かたづけよう</b><span>{recipe.why.cleanup}</span></div>
        <button className="primary" onClick={reset}>ほかの ふしぎを みる <span>→</span></button>
      </section>}
      </div>
      <footer>ふしぎは みて、ためして、はなしてみよう。</footer>
    </main>
  );
}
