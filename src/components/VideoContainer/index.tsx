import { useRef } from 'react'
import type { RefObject } from 'react'
import type { SourceMode } from '../../types'
import { LoadingOverlay } from './LoadingOverlay'
import { PrefillIndicator } from './PrefillIndicator'
import { SourceToggleButton } from './SourceToggleButton'

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  sourceMode: SourceMode
  isModelLoading: boolean
  modelLoadingMessage: string
  isPrefilling: boolean
  isProcessing: boolean
  onSourceToggle: () => void
  onFileSelected: (file: File) => void
}

export function VideoContainer({
  videoRef,
  canvasRef,
  sourceMode,
  isModelLoading,
  modelLoadingMessage,
  isPrefilling,
  isProcessing,
  onSourceToggle,
  onFileSelected,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    if (sourceMode === 'webcam') {
      fileInputRef.current?.click()
    } else {
      onSourceToggle()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelected(file)
      e.target.value = ''
    }
  }

  return (
    <div className="group relative mx-auto aspect-[4/3] w-[min(92vw,640px)] overflow-hidden rounded-xl border border-slate-300 bg-black shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full rounded-[10px] object-cover"
      />

      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <SourceToggleButton
        sourceMode={sourceMode}
        disabled={isProcessing}
        onToggle={handleToggle}
      />

      <PrefillIndicator visible={isPrefilling} />

      {isModelLoading && <LoadingOverlay message={modelLoadingMessage} />}
    </div>
  )
}
