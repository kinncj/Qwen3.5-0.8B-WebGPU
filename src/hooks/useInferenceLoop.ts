import { useState, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import type { RawImage } from '@huggingface/transformers'
import { captureFrame } from '../utils/captureFrame'

type RunInference = (
  image: RawImage,
  instruction: string,
  onToken: (token: string) => void,
) => Promise<void>

export function useInferenceLoop(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  runInference: RunInference,
) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPrefilling, setIsPrefilling] = useState(false)
  const [response, setResponse] = useState('')

  const processingRef = useRef(false)
  const instructionRef = useRef('')

  const start = useCallback(
    (instruction: string) => {
      if (processingRef.current) return
      instructionRef.current = instruction
      processingRef.current = true
      setIsProcessing(true)
      setResponse('Processing started...')

      const loop = async () => {
        while (processingRef.current) {
          const video = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas) break

          const frame = captureFrame(video, canvas)
          if (!frame) {
            setResponse('Capture failed — video not ready.')
            break
          }

          setIsPrefilling(true)
          try {
            let firstToken = true
            await runInference(frame, instructionRef.current, (token) => {
              setIsPrefilling(false)
              setResponse((prev) => (firstToken ? token : prev + token))
              firstToken = false
            })
          } catch (e) {
            setResponse(`Error: ${e instanceof Error ? e.message : String(e)}`)
          } finally {
            setIsPrefilling(false)
          }
        }
        processingRef.current = false
        setIsProcessing(false)
        setIsPrefilling(false)
      }

      loop()
    },
    [videoRef, canvasRef, runInference],
  )

  const stop = useCallback(() => {
    processingRef.current = false
    setIsPrefilling(false)
  }, [])

  const updateInstruction = useCallback((instruction: string) => {
    instructionRef.current = instruction
  }, [])

  return { isProcessing, isPrefilling, response, start, stop, updateInstruction }
}
