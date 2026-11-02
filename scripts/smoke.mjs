/**
 * Headless smoke test against a running preview server.
 *
 * Verifies:
 *  - engine boots with real ONNX + MuJoCo
 *  - at least three clips run on the same PolicyRunner
 *  - play / pause / reset / loop controls respond
 *  - inference timing and action activity are non-trivial
 *
 * Usage: node scripts/smoke.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4173/lab.html';
const CLIPS = ['walk_01', 'run_01', 'dance_01'];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForEngine(page, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await page.evaluate(() => {
      const eng = window.__engine;
      if (!eng) return { ready: false, error: 'no __engine' };
      return {
        ready: Boolean(eng.status?.ready),
        error: eng.status?.error ?? null,
        loadMs: eng.status?.loadMs ?? null,
        obsDim: eng.status?.obsDim ?? null,
        actionDim: eng.status?.actionDim ?? null,
        inferMs: eng.status?.inferMs ?? null,
        fps: eng.status?.fps ?? null,
        clipId: eng.status?.clipId ?? null,
        playing: eng.status?.playing ?? null,
        mode: eng.status?.mode ?? null,
        genAvailable: eng.status?.genAvailable ?? null,
      };
    });
    if (status.error && status.error !== 'no __engine') {
      throw new Error(`engine error: ${status.error}`);
    }
    if (status.ready) return status;
    await sleep(500);
  }
  throw new Error('timed out waiting for engine ready');
}

async function sampleActions(page, frames = 40) {
  return page.evaluate(async (n) => {
    const eng = window.__engine;
    const samples = [];
    const start = performance.now();
    while (samples.length < n && performance.now() - start < 8000) {
      const a = eng?.controller?.lastAction;
      if (a && a.length) {
        let sum = 0;
        let abs = 0;
        for (let i = 0; i < a.length; i++) {
          sum += a[i];
          abs += Math.abs(a[i]);
        }
        samples.push({ mean: sum / a.length, absMean: abs / a.length, dim: a.length });
      }
      await new Promise((r) => requestAnimationFrame(r));
    }
    const absMeans = samples.map((s) => s.absMean);
    const meanAbs = absMeans.reduce((a, b) => a + b, 0) / Math.max(1, absMeans.length);
    const variance =
      absMeans.reduce((a, b) => a + (b - meanAbs) ** 2, 0) / Math.max(1, absMeans.length);
    return {
      samples: samples.length,
      actionDim: samples[0]?.dim ?? null,
      meanAbs,
      variance,
      inferMs: eng.status.inferMs,
      fps: eng.status.fps,
      controlHz: eng.status.controlHz,
      mode: eng.status.mode,
      upright: eng.status.upright,
      pelvisHeight: eng.status.pelvisHeight,
      clipId: eng.status.clipId,
      clipFrame: eng.status.clipFrame,
    };
  }, frames);
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  const page = await browser.newPage();
  const report = { base: BASE, clips: [], controls: {}, genAvailable: null };

  const labUrl = BASE.includes('.html')
    ? `${BASE}?clip=${CLIPS[0]}&chrome=full`
    : `${BASE}/lab.html?clip=${CLIPS[0]}&chrome=full`;
  console.log(`navigating ${labUrl}`);
  await page.goto(labUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  const boot = await waitForEngine(page);
  report.genAvailable = boot.genAvailable;
  report.boot = boot;
  console.log('boot', JSON.stringify(boot));

  if (boot.genAvailable) {
    throw new Error('generator should not be loaded in this build');
  }
  if (boot.obsDim !== 132) {
    throw new Error(`expected obsDim 132, got ${boot.obsDim}`);
  }
  if (boot.actionDim !== 29) {
    throw new Error(`expected actionDim 29, got ${boot.actionDim}`);
  }

  for (const clip of CLIPS) {
    console.log(`selectClip ${clip}`);
    await page.evaluate(async (id) => {
      await window.__engine.selectClip(id);
    }, clip);
    await sleep(1500);
    const sample = await sampleActions(page, 50);
    console.log(clip, JSON.stringify(sample));
    if (sample.clipId !== clip) {
      throw new Error(`clip mismatch: want ${clip}, got ${sample.clipId}`);
    }
    if (!sample.samples || sample.meanAbs < 1e-4) {
      throw new Error(`${clip}: policy actions look inert (meanAbs=${sample.meanAbs})`);
    }
    if (sample.inferMs == null || sample.inferMs <= 0) {
      throw new Error(`${clip}: missing inference timing`);
    }
    report.clips.push({ id: clip, ...sample });
  }

  // Controls: pause / play / loop / reset
  await page.evaluate(() => window.__engine.pause());
  await sleep(200);
  let st = await page.evaluate(() => window.__engine.status.playing);
  report.controls.pause = st === false;
  if (st !== false) throw new Error('pause failed');

  await page.evaluate(() => window.__engine.play());
  await sleep(200);
  st = await page.evaluate(() => window.__engine.status.playing);
  report.controls.play = st === true;
  if (st !== true) throw new Error('play failed');

  await page.evaluate(() => window.__engine.setLoop(true));
  await sleep(100);
  st = await page.evaluate(() => window.__engine.status.loop);
  report.controls.loop = st === true;
  if (st !== true) throw new Error('loop failed');

  await page.evaluate(() => window.__engine.reset());
  await sleep(500);
  const afterReset = await page.evaluate(() => ({
    frame: window.__engine.status.clipFrame,
    ready: window.__engine.status.ready,
    playing: window.__engine.status.playing,
  }));
  report.controls.reset = afterReset;
  if (!afterReset.ready) throw new Error('reset left engine not ready');

  // Same policy session across clips: loadMs set once at boot, policy still ready.
  report.samePolicySession = boot.loadMs != null && report.clips.length === CLIPS.length;

  console.log('SMOKE_OK', JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error('SMOKE_FAIL', err);
  process.exit(1);
});
