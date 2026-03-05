import type { RawImage } from '@huggingface/transformers'

export interface IModelService {
  load(onStatus: (message: string) => void): Promise<void>
  runInference(
    image: RawImage,
    instruction: string,
    onToken: (token: string) => void,
  ): Promise<void>
  isReady(): boolean
}
