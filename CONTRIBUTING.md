# Contributing

This repo is a **static** Unitree G1 tracking demo. It reuses the wbc-demo engine contract; do not train or distill models here.

## Rules of thumb

1. Keep **one** `policy.onnx`. Clip switches must only change reference streams.
2. Read observation order, PD gains, and action scaling from `policies/g1-samples/config.yaml` — never invent them.
3. Do not add `generator.onnx` / Gen WASD unless the product requirements explicitly expand to a second network.
4. Only claim motions that have been verified (see [REPORT.md](REPORT.md)).

## Validate before opening a PR

```bash
npm run validate
npm run typecheck
npm run build
```

Optional closed-loop smoke (preview must be running on `:4173`):

```bash
npm run preview   # other terminal
npm run smoke
```
