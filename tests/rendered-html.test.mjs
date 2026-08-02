import assert from "node:assert/strict";
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
  assert.doesNotMatch(html, /よそうする|よそう タイム/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Starter Project|react-loading-skeleton/i);
});
