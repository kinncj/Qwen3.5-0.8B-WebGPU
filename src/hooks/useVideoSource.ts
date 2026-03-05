import { useState, useRef, useCallback, useEffect } from 'react'
import type { SourceMode } from '../types'

export function useVideoSource() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileObjectUrlRef = useRef<string | null>(null)

  const [sourceMode, setSourceMode] = useState<SourceMode>('webcam')
  const [hasActiveInput, setHasActiveInput] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const stopWebcamStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const initCamera = useCallback(async (): Promise<boolean> => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current)
        fileObjectUrlRef.current = null
      }

      const video = videoRef.current!
      video.removeAttribute('src')
      video.srcObject = stream
      streamRef.current = stream
      setSourceMode('webcam')
      setHasActiveInput(true)
      return true
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
      setCameraError(msg)
      return false
    }
  }, [])

  const switchToFile = useCallback(
    async (file: File) => {
      stopWebcamStream()

      if (fileObjectUrlRef.current) URL.revokeObjectURL(fileObjectUrlRef.current)
      const url = URL.createObjectURL(file)
      fileObjectUrlRef.current = url

      const video = videoRef.current!
      video.srcObject = null
      video.src = url
      video.loop = true
      video.muted = true

      try {
        await video.play()
      } catch {
        // autoplay may be blocked; user interaction will start it
      }

      setSourceMode('file')
      setHasActiveInput(true)
    },
    [stopWebcamStream],
  )

  const switchToWebcam = useCallback(() => initCamera(), [initCamera])

  useEffect(() => {
    return () => {
      stopWebcamStream()
      if (fileObjectUrlRef.current) URL.revokeObjectURL(fileObjectUrlRef.current)
    }
  }, [stopWebcamStream])

  return {
    videoRef,
    canvasRef,
    sourceMode,
    hasActiveInput,
    cameraError,
    initCamera,
    switchToFile,
    switchToWebcam,
  }
}
