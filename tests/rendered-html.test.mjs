import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the fushigi no tane home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>ふしぎのたね/);
  assert.match(html, /ふしぎのたね/);
  assert.match(html, /どの ふしぎを/);
  assert.match(html, /10びょうで/);
  assert.match(html, /ひらく 紙の花/);
  assert.match(html, /あるく いろみず/);
  assert.match(html, /LEDで 影くらべ/);
  assert.ok((html.match(/おうちで できる/g) ?? []).length >= 3);
  assert.doesNotMatch(html, /ショーを みられる|レシピは じゅんび中/);
  assert.doesNotMatch(html, /よこくをみる/);
  assert.doesNotMatch(html, /よそうする|よそう タイム/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Starter Project|react-loading-skeleton/i);
});

test("defines complete rainbow and shadow recipes", async () => {
  const source = await readFile(new URL("../app/recipes.ts", import.meta.url), "utf8");

  assert.match(source, /じゅんび5分＋かんさつ30〜60分/);
  assert.match(source, /さいしょの 変化は 5〜10分/);
  assert.match(source, /水 160mL（左右のコップに80mLずつ。中央は空）/);
  assert.match(source, /ガラスや飲用グラス、インク、絵の具、洗剤は使いません/);
  assert.match(source, /id: "green"/);
  assert.match(source, /id: "one-first"/);
  assert.match(source, /id: "not-yet"/);
  assert.match(source, /毛細管現象/);
  assert.match(source, /10びょうで かわるのではない/);

  assert.match(source, /じゅんび5分＋じっけん5〜10分/);
  assert.match(source, /単3または単4の小型LED懐中電灯/);
  assert.match(source, /ボタン電池・コイン電池式、レーザー、高出力の集光型ライトは使いません/);
  assert.match(source, /id: "bigger"/);
  assert.match(source, /id: "moved"/);
  assert.match(source, /id: "unclear"/);
  assert.match(source, /ひかりが とどかない ところが、/);
  assert.match(source, /部屋を まっくらにする ひつようはない/);
});
