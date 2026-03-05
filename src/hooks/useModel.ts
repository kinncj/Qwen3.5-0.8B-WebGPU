import { useState, useRef, useCallback } from 'react'
import type { RawImage } from '@huggingface/transformers'
import type { IModelService } from '../services/IModelService'
import { TransformersModelService } from '../services/TransformersModelService'
import type { ModelStatus } from '../types'

export function useModel() {
  const [status, setStatus] = useState<ModelStatus>({ phase: 'idle', message: '' })
  const serviceRef = useRef<IModelService>(new TransformersModelService())

  const load = useCallback(async () => {
    setStatus({ phase: 'loading', message: 'Initializing...' })
    try {
      await serviceRef.current.load((message) => {
        setStatus({ phase: 'loading', message })
      })
      setStatus({ phase: 'ready', message: 'Ready.' })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setStatus({ phase: 'error', message })
      throw e
    }
  }, [])

  const runInference = useCallback(
    (image: RawImage, instruction: string, onToken: (token: string) => void) =>
      serviceRef.current.runInference(image, instruction, onToken),
    [],
  )

  return {
    status,
    isReady: status.phase === 'ready',
    load,
    runInference,
  }
}
