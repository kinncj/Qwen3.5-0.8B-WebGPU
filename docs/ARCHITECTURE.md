# Architecture

## Overview

Qwen3.5-0.8B WebGPU is a fully client-side vision-language inference application. There is no backend service. The model, the runtime, and all computation live in the browser tab.

The architecture is shaped by three hard constraints:

1. **WebGPU requires `crossOriginIsolated`** — the browser will only expose `SharedArrayBuffer` (needed by ONNX Runtime's GPU backend) when the page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`.
2. **COEP blocks cross-origin workers** — ONNX Runtime spawns Web Workers to run WASM. Under COEP, those worker scripts must be same-origin. We copy them from `node_modules` to `public/` at build time and point the runtime at `/`.
3. **The model is large (~850 MB)** — it is never bundled. It is fetched from Hugging Face Hub at runtime and cached by the browser's Cache API on first load.

---

## System diagram

```mermaid
graph TB
    subgraph Browser["Browser Tab (crossOriginIsolated)"]
        subgraph React["React App"]
            App --> useModel
            App --> useVideoSource
            App --> useInferenceLoop
            useModel --> IModelService
            IModelService --> TransformersModelService
        end

        subgraph ORT["ONNX Runtime Web"]
            TransformersModelService --> Transformers["@huggingface/transformers"]
            Transformers --> OrtWorker["ORT WASM Worker\n(same-origin)"]
            OrtWorker --> WebGPU["WebGPU API"]
            WebGPU --> GPU["GPU"]
        end

        subgraph Video["Video Pipeline"]
            Webcam["Webcam / Video File"] --> VideoElement["&lt;video&gt;"]
            VideoElement --> Canvas["&lt;canvas&gt; (hidden)"]
            Canvas --> captureFrame
            captureFrame --> RawImage
            RawImage --> TransformersModelService
        end
    end

    subgraph CDN["Hugging Face Hub (CDN)"]
        ModelWeights["Model Weights\n(~850 MB, cached)"]
    end

    subgraph CF["Cloudflare Pages"]
        StaticAssets["Static Assets\n+ COOP/COEP headers"]
    end

    CF -->|"serves app"| Browser
    CDN -->|"model download (once)"| Transformers
```

---

## Runtime initialization sequence

```mermaid
sequenceDiagram
    participant Browser
    participant App
    participant useModel
    participant TransformersModelService
    participant HuggingFace as Hugging Face Hub
    participant WebGPU

    Browser->>App: DOMContentLoaded
    App->>useModel: load()
    useModel->>TransformersModelService: load(onStatus)
    TransformersModelService->>TransformersModelService: set wasmPaths = '/'
    TransformersModelService->>HuggingFace: AutoProcessor.from_pretrained()
    HuggingFace-->>TransformersModelService: processor
    TransformersModelService->>HuggingFace: Qwen3_5ForConditionalGeneration.from_pretrained()
    HuggingFace-->>TransformersModelService: model weights (cached after first load)
    TransformersModelService->>WebGPU: initialise GPU session
    WebGPU-->>TransformersModelService: session ready
    TransformersModelService-->>useModel: resolved
    useModel-->>App: phase = 'ready'
    App->>App: initCamera()
```

---

## Inference loop sequence

```mermaid
sequenceDiagram
    participant User
    participant ControlPanel
    participant useInferenceLoop
    participant captureFrame
    participant TransformersModelService
    participant WebGPU

    User->>ControlPanel: press Start
    ControlPanel->>useInferenceLoop: start(instruction)
    loop while processingRef = true
        useInferenceLoop->>captureFrame: captureFrame(video, canvas)
        captureFrame-->>useInferenceLoop: RawImage
        useInferenceLoop->>TransformersModelService: runInference(image, instruction, onToken)
        TransformersModelService->>WebGPU: model.generate(inputs)
        WebGPU-->>TransformersModelService: token stream
        TransformersModelService-->>useInferenceLoop: onToken(token) × N
        useInferenceLoop-->>ControlPanel: setResponse(accumulated)
    end
    User->>ControlPanel: press Stop
    ControlPanel->>useInferenceLoop: stop()
    useInferenceLoop->>useInferenceLoop: processingRef = false
```

---

## Layered architecture

```mermaid
graph LR
    subgraph Presentation["Presentation Layer"]
        Components["React Components\n(VideoContainer, ControlPanel)"]
        HOC["withModelGuard HOC"]
    end

    subgraph Application["Application Layer"]
        Hooks["Custom Hooks\n(useModel, useVideoSource,\nuseInferenceLoop)"]
        Utils["Utilities\n(captureFrame)"]
    end

    subgraph Domain["Domain / Service Layer"]
        Interface["IModelService\n(interface)"]
        Service["TransformersModelService\n(implementation)"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        HFT["@huggingface/transformers"]
        ORT["ONNX Runtime Web"]
        WGPU["WebGPU"]
    end

    Presentation --> Application
    Application --> Domain
    Domain --> Infrastructure

    HOC -.->|"reads ModelStatus"| Hooks
    Interface -.->|"implemented by"| Service
```

The dependency arrows flow strictly downward. The Presentation layer never imports from Infrastructure directly. The Domain layer defines an interface (`IModelService`) that decouples the application layer from any specific ML library.

---

## SOLID principles applied

### Single Responsibility

Each module has one reason to change:

| Module | Responsibility |
|---|---|
| `useModel` | Model lifecycle (load, status) |
| `useVideoSource` | Media stream lifecycle |
| `useInferenceLoop` | Capture-infer-stream loop |
| `captureFrame` | Frame extraction from `<video>` |
| `TransformersModelService` | HuggingFace/ONNX integration |

### Open / Closed

`IModelService` is the extension point. To swap in a different model or runtime (e.g. WebLLM, GGUF via Wasm), implement `IModelService` and inject the new class. No UI code changes.

### Liskov Substitution

Any `IModelService` implementation can replace `TransformersModelService` transparently. The hooks and components only depend on the interface contract.

### Interface Segregation

`IModelService` exposes exactly three methods — no more. Components receive only the props they use; no "god objects" are passed down the tree.

### Dependency Inversion

`useModel` holds a `ref` typed as `IModelService`. The concrete `TransformersModelService` is injected at the call site. The hook never imports the implementation directly — only the interface type.
