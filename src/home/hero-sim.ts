/**
 * Homepage hero simulation — lazy-loads the existing WBC engine.
 * Static studio preview first; MuJoCo + ONNX only after explicit activate
 * (or auto when the hero is visible and reduced-motion is off).
 */

import { getDefaultLivePolicy } from '../registry';
import { preferLowQualityGl } from '../platform';
import type { LiveEngineHandle } from '../engine/live-engine';
import { heroMotions } from './content';

export interface HeroSimHandle {
  dispose(): void;
  activate(): Promise<void>;
  readonly active: boolean;
}

export function mountHeroSim(opts: {
  stage: HTMLElement;
  status: HTMLElement;
  toolbar: HTMLElement;
  reducedMotion: boolean;
}): HeroSimHandle {
  const { stage, status, toolbar } = opts;
  let engine: LiveEngineHandle | undefined;
  let disposed = false;
  let activating: Promise<void> | null = null;
  let active = false;

  stage.innerHTML = `
    <div class="hero-sim" data-state="preview">
      <div class="hero-sim__canvas" id="hero-canvas"></div>
      <div class="hero-sim__veil" id="hero-veil">
        <div class="hero-sim__preview-mark" aria-hidden="true">
          <span class="hero-sim__silhouette"></span>
        </div>
        <p class="hero-sim__hint" id="hero-hint">Interactive Unitree G1. Closed-loop MuJoCo + ONNX.</p>
        <button type="button" class="btn btn--primary" id="hero-activate">Activate simulation</button>
      </div>
      <div class="hero-sim__bar" id="hero-bar" hidden>
        <div class="hero-sim__motions" id="hero-motions" role="listbox" aria-label="Motions"></div>
        <div class="hero-sim__actions">
          <button type="button" class="btn" id="hero-play" title="Play / pause">Pause</button>
          <button type="button" class="btn" id="hero-reset" title="Reset">Reset</button>
          <a class="btn btn--ghost" href="${import.meta.env.BASE_URL}lab.html">Full lab</a>
        </div>
      </div>
    </div>`;

  const root = stage.querySelector<HTMLElement>('.hero-sim')!;
  const canvasHost = stage.querySelector<HTMLElement>('#hero-canvas')!;
  const veil = stage.querySelector<HTMLElement>('#hero-veil')!;
  const hint = stage.querySelector<HTMLElement>('#hero-hint')!;
  const activateBtn = stage.querySelector<HTMLButtonElement>('#hero-activate')!;
  const bar = stage.querySelector<HTMLElement>('#hero-bar')!;
  const motionsEl = stage.querySelector<HTMLElement>('#hero-motions')!;
  const playBtn = stage.querySelector<HTMLButtonElement>('#hero-play')!;
  const resetBtn = stage.querySelector<HTMLButtonElement>('#hero-reset')!;

  motionsEl.innerHTML = heroMotions
    .map(
      (m, i) => `
      <button type="button" class="hero-sim__clip" role="option" data-clip="${m.id}" aria-selected="${i === 0}">
        ${m.label}
      </button>`,
    )
    .join('');

  function setStatus(msg: string, err = false): void {
    status.textContent = msg;
    status.dataset.tone = err ? 'error' : '';
  }

  async function activate(): Promise<void> {
    if (disposed || active) return;
    if (activating) return activating;
    activating = (async () => {
      activateBtn.disabled = true;
      activateBtn.textContent = 'Loading…';
      root.dataset.state = 'loading';
      setStatus('Loading MuJoCo WASM and policy…');

      const policy = getDefaultLivePolicy();
      if (!policy?.manifest.artifacts?.onnx) {
        throw new Error('No live G1 policy bundle found.');
      }

      const { createLiveEngine } = await import('../engine/live-engine');
      if (disposed) return;

      const robot = policy.manifest.robot ?? 'g1';
      engine = await createLiveEngine(canvasHost, {
        policyBaseUrl: policy.baseUrl,
        mjcfBaseUrl: `${import.meta.env.BASE_URL}robots/${robot}/mjcf/`,
        startClipId: heroMotions[0].id,
        autoplay: true,
        follow: true,
        interactiveDrag: false,
        lowQuality: preferLowQualityGl(),
        startInGen: false,
        onMessage: (m) => setStatus(m),
        onError: (m) => setStatus(m, true),
        onStatus: (s) => {
          playBtn.textContent = s.playing ? 'Pause' : 'Play';
          for (const btn of motionsEl.querySelectorAll<HTMLButtonElement>('.hero-sim__clip')) {
            btn.setAttribute('aria-selected', String(btn.dataset.clip === s.clipId));
            btn.disabled = !s.canBrowse;
          }
        },
      });

      if (disposed) {
        engine.dispose();
        engine = undefined;
        return;
      }

      active = true;
      root.dataset.state = 'live';
      veil.hidden = true;
      bar.hidden = false;
      toolbar.hidden = false;
      setStatus('Live. One pretrained policy, real physics.');
    })()
      .catch((err) => {
        activateBtn.disabled = false;
        activateBtn.textContent = 'Retry simulation';
        root.dataset.state = 'preview';
        hint.textContent = String(err);
        setStatus(String(err), true);
      })
      .finally(() => {
        activating = null;
      });

    return activating;
  }

  playBtn.addEventListener('click', () => {
    if (!engine) return;
    if (engine.status.playing) engine.pause();
    else engine.play();
  });
  resetBtn.addEventListener('click', () => engine?.reset());
  motionsEl.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement | null)?.closest?.('.hero-sim__clip') as
      | HTMLButtonElement
      | null;
    if (!btn?.dataset.clip || !engine) return;
    void engine.selectClip(btn.dataset.clip);
  });

  if (opts.reducedMotion) {
    activateBtn.textContent = 'Open full laboratory';
    activateBtn.addEventListener('click', () => {
      window.location.href = `${import.meta.env.BASE_URL}lab.html`;
    });
    hint.textContent = 'Reduced motion on. Open the lab for the interactive sim.';
    setStatus('Simulation available in the laboratory');
  } else {
    activateBtn.addEventListener('click', () => void activate());
    setStatus('Studio ready. Activate for closed-loop MuJoCo + ONNX.');
  }

  return {
    get active() {
      return active;
    },
    activate,
    dispose() {
      disposed = true;
      engine?.dispose();
      engine = undefined;
      stage.innerHTML = '';
    },
  };
}
