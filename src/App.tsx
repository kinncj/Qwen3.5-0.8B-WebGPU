import { useEffect } from 'react'
import { withModelGuard } from './hoc/withModelGuard'
import { useModel } from './hooks/useModel'
import { useVideoSource } from './hooks/useVideoSource'
import { useInferenceLoop } from './hooks/useInferenceLoop'
import { VideoContainer } from './components/VideoContainer'
import { ControlPanel } from './components/ControlPanel'
import type { ModelStatus } from './types'

// ── Fallback rendered by withModelGuard while model isn't ready ──────────────

function ModelStatusPanel({ status }: { status: ModelStatus }) {
  const isError = status.phase === 'error'
  return (
    <div className="flex w-[min(92vw,760px)] items-center justify-center rounded-xl border border-gray-200 bg-white/90 px-4 py-6 shadow-lg">
      <p className={`text-sm font-medium ${isError ? 'text-red-600' : 'text-gray-500'}`}>
        {status.message || 'Waiting for model…'}
      </p>
    </div>
  )
}

// ── Guarded ControlPanel — only active once model is ready ───────────────────

const GuardedControlPanel = withModelGuard(ControlPanel, ModelStatusPanel)

// ── WebGPU check ─────────────────────────────────────────────────────────────

function NoWebGPU() {
  return (
    <p className="text-center text-sm font-semibold text-red-600">
      WebGPU is not available in this browser. Try Chrome 113+.
    </p>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export function App() {
  const { status, isReady, load, runInference } = useModel()
  const { videoRef, canvasRef, sourceMode, hasActiveInput, initCamera, switchToFile, switchToWebcam } =
    useVideoSource()
  const { isProcessing, isPrefilling, response, start, stop, updateInstruction } =
    useInferenceLoop(videoRef, canvasRef, runInference)

  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator

  useEffect(() => {
    if (!hasWebGPU) return
    load()
      .then(() => initCamera())
      .catch(() => {/* error surfaced via status */})
  }, [hasWebGPU, load, initCamera])

  const canStart = isReady && hasActiveInput

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-50 to-indigo-100 px-3.5 py-3.5 font-sans text-gray-900">
      <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        Qwen3.5-0.8B WebGPU demo
      </h1>

      {!hasWebGPU && <NoWebGPU />}

      <VideoContainer
        videoRef={videoRef}
        canvasRef={canvasRef}
        sourceMode={sourceMode}
        isModelLoading={status.phase === 'loading'}
        modelLoadingMessage={status.message}
        isPrefilling={isPrefilling}
        isProcessing={isProcessing}
        onSourceToggle={switchToWebcam}
        onFileSelected={switchToFile}
      />

      <GuardedControlPanel
        modelStatus={status}
        isProcessing={isProcessing}
        canStart={canStart}
        response={response}
        onStart={start}
        onStop={stop}
        onInstructionChange={updateInstruction}
      />
    </main>
  )
}
