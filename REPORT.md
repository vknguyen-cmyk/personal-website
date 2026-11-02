# Verification report

Date: 2026-11-02  
Stack: Vite production build (`dist/`) + Chrome headless smoke (`scripts/smoke.mjs`)  
Policy: `policies/g1-samples/policy.onnx` (obs 132 → action 29, `genAvailable: false`)

## Assets checked

- `policy.onnx` size 3 320 259 bytes; loads in ORT Web (~1.1 s cold load in smoke).
- `config.yaml`: 29 joints, `action_mode: reference_residual`, `policy_step_dt: 0.02`.
- All 12 `reference/*.bin` files match `index.json` (`frames × 39 × 4`).
- `gen/params/generator.onnx` **not shipped** (removed from product).

## Closed-loop evidence

| Check | Result |
|-------|--------|
| Real ONNX inference | Yes — `inferMs` ≈ 0.25–0.32 ms; action `meanAbs` 0.24–0.43 across clips |
| Same policy session for 3+ clips | Yes — one boot `loadMs`, then `walk_01` → `run_01` → `dance_01` without reloading ONNX |
| Real MuJoCo feedback | Yes — `mode=policy` stays upright (`upright≈-1`, pelvis≈0.74 m); `mode=open-loop` collapses (`upright≈-0.17`, pelvis≈0.27 m, actions zeroed) |
| Play / pause / loop / reset | Yes — smoke asserts all four |
| Production build | Yes — `npm run build` succeeds; `dist/` is static (no Python/backend) |

## Motions verified successfully

| Clip | Role | Notes |
|------|------|-------|
| `walk_01` | locomotion | Closed-loop tracking; upright |
| `run_01` | locomotion | Closed-loop tracking; upright |
| `dance_01` | dance | Closed-loop tracking; upright |
| `liedown_01` | recovery pose | After clip finished → FSM select; pelvis ≈ 0.06 m, `robotIsUp=false` |
| `getup_01` | recovery pose | From floor; returns upright (`pelvis≈0.77 m`, `robotIsUp=true`) |

Browsable clips present but **not** individually timed in the automated suite: `idle_02`, `dance_02`, `dance_03`, `fight_combo_02`, `sprint_01`, `backflip`, `side_flip`. They share the same policy + stream format; treat as available, not separately certified here.

## Not claimed

- **Jump** — no jump reference clip in this bundle.
- **WASD / Gen teleop** — requires `generator.onnx` (second network). Intentionally omitted.
- Real-time 50 Hz on headless CI Chrome — observed ~27–31 Hz control / ~7–8 FPS in headless; interactive desktop use is expected to be higher.

## Provenance

- Engine + UI adapted from [wbc-mjlab/wbc-demo](https://github.com/wbc-mjlab/wbc-demo).
- Policy + clips from the upstream `policies/g1-samples` pretrained bundle (wbc-mjlab export contract).
- Observation / PD / residual action layout preserved from `config.yaml` (deploy-aligned).
