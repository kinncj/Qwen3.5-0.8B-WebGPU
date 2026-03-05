# Qwen3.5-0.8B WebGPU

A vision-language model running entirely in your browser — no server, no API key, no data leaving your machine.

Point it at your webcam, ask it anything about what it sees, and watch tokens stream back in real time — all powered by your GPU through the WebGPU API.

---

## What it does

The app loads [Qwen3.5-0.8B-ONNX](https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX) directly into your browser, runs continuous inference against a live video feed (webcam or local video file), and streams the model's response token by token. There is no backend. The model weights are fetched once from Hugging Face Hub and cached by the browser thereafter.

**It is genuinely private.** Your camera frames are never transmitted anywhere.

---

## Requirements

- Chrome 113+ (or any Chromium-based browser with WebGPU enabled)
- A GPU with WebGPU support (integrated GPUs work; discrete GPUs are faster)
- ~850 MB of free memory for the model (downloaded once, then cached)
- A webcam, or a local video file

---

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

The first run downloads the model weights from Hugging Face Hub (~850 MB). Subsequent runs load from browser cache and are near-instant.

> Webcam access requires HTTPS or `localhost`. The dev server satisfies this by default.

---

## How it works

1. On startup the app loads the ONNX model and processor via `@huggingface/transformers`.
2. It requests webcam access (or waits for a video file to be dropped in).
3. When you press **Start**, a continuous loop begins:
   - Capture a frame from the video element.
   - Run vision+language inference with your instruction as the prompt.
   - Stream tokens to the response area.
   - Repeat immediately from the next frame.
4. **Stop** exits the loop cleanly after the current inference finishes.

---

## Model configuration

| Parameter | Value |
|---|---|
| Model | `onnx-community/Qwen3.5-0.8B-ONNX` |
| Device | `webgpu` |
| `embed_tokens` dtype | `q4` |
| `vision_encoder` dtype | `fp16` |
| `decoder_model_merged` dtype | `q4` |
| Thinking mode | disabled |
| Max new tokens | 128 |
| Sampling | greedy (`do_sample: false`) |

---

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 3 |
| Build | Vite 6 |
| ML runtime | `@huggingface/transformers` 4 (ONNX Runtime Web) |
| Inference backend | WebGPU (JSEP) |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |

---

## Architecture

The codebase follows SOLID principles throughout:

- **Single Responsibility** — one hook per concern (`useModel`, `useVideoSource`, `useInferenceLoop`)
- **Open/Closed** — model loading is extensible via the `IModelService` interface without touching the UI
- **Dependency Inversion** — hooks depend on the `IModelService` abstraction, not the concrete implementation
- **Higher-Order Components** — `withModelGuard` gates any component on model readiness declaratively

See [`docs/`](./docs/README.md) for the full architectural documentation.

---

## Project structure

```
src/
  services/
    IModelService.ts          # Abstraction — defines the contract
    TransformersModelService.ts  # Concrete implementation (HF Transformers + WebGPU)
  hooks/
    useModel.ts               # Model lifecycle: load, status, runInference
    useVideoSource.ts         # Webcam / file switching and stream lifecycle
    useInferenceLoop.ts       # Continuous capture → infer → stream loop
  hoc/
    withModelGuard.tsx        # HOC gating render on model phase
  components/
    VideoContainer/           # Video feed, loading overlay, source toggle
    ControlPanel/             # Instruction input, response textarea, start/stop
  utils/
    captureFrame.ts           # Canvas frame capture → RawImage
  types/
    index.ts                  # Shared TypeScript types
public/
  _headers                   # Cloudflare Pages: COOP + COEP headers
  ort-wasm-simd-threaded.*   # ONNX Runtime WASM + workers (same-origin copy)
```

---

## Cross-origin isolation

WebGPU's ONNX Runtime backend requires `SharedArrayBuffer`, which browsers gate behind `crossOriginIsolated`. This requires two HTTP response headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

These are applied globally via `public/_headers` on Cloudflare Pages. The ONNX Runtime worker scripts are served from the same origin (copied to `public/`) to satisfy COEP without blocking cross-origin requests to Hugging Face Hub.

---

## Deployment

Every push to `main` triggers a GitHub Actions workflow that builds the app and deploys it to Cloudflare Pages. Live at:

**https://qwen3-5-0-8b-webgpu.pages.dev**

---

## License

GNU Affero General Public License v3.0 — see [LICENSE](./LICENSE).

The model weights (`onnx-community/Qwen3.5-0.8B-ONNX`) are subject to the Qwen model license. The `@huggingface/transformers` library is Apache 2.0. ONNX Runtime Web is MIT.
