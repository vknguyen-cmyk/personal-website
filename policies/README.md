# `policies/` — pretrained policy bundles

This site ships **one** live policy folder: [`g1-samples/`](g1-samples/).

```
policies/g1-samples/
  policy.yaml          # manifest
  policy.onnx          # single WBC tracker (loaded once)
  config.yaml          # obs / action / PD contract
  reference/
    index.json         # clip catalog + 39-dim layout
    manifest.yaml      # browsable clips + pose_clips
    *.bin              # float32 reference streams
```

Adding clips: drop a compatible `.bin` + entries in `index.json` / `manifest.yaml`. Do **not** swap `policy.onnx` unless the new weights match `config.yaml`.

Gen / `generator.onnx` is **out of scope** for this product (would be a second network for WASD teleop).
