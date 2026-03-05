import { RawImage } from '@huggingface/transformers'

const MAX_WIDTH = 800

export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): RawImage | null {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null

  const scale = Math.min(1, MAX_WIDTH / video.videoWidth)
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return RawImage.fromCanvas(canvas)
}
