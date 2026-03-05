export type SourceMode = 'webcam' | 'file'

export type ModelPhase = 'idle' | 'loading' | 'ready' | 'error'

export interface ModelStatus {
  phase: ModelPhase
  message: string
}
