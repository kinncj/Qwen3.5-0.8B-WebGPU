/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutoProcessor,
  Qwen3_5ForConditionalGeneration,
  RawImage,
  TextStreamer,
  env,
} from '@huggingface/transformers'
import type { IModelService } from './IModelService'

const MODEL_ID = 'onnx-community/Qwen3.5-0.8B-ONNX'

// Serve ORT WASM + worker files from the same origin to satisfy COEP.
// These files are copied from node_modules to public/ at build time.
;(env as any).backends.onnx.wasm.wasmPaths = '/'

export class TransformersModelService implements IModelService {
  private processor: any = null
  private model: any = null
  private ready = false

  async load(onStatus: (message: string) => void): Promise<void> {
    onStatus('Loading processor...')
    this.processor = await AutoProcessor.from_pretrained(MODEL_ID)

    onStatus('Loading model (~850 MB)...')
    this.model = await Qwen3_5ForConditionalGeneration.from_pretrained(MODEL_ID, {
      dtype: {
        embed_tokens: 'q4',
        vision_encoder: 'fp16',
        decoder_model_merged: 'q4',
      },
      device: 'webgpu',
    } as any)

    this.ready = true
  }

  async runInference(
    image: RawImage,
    instruction: string,
    onToken: (token: string) => void,
  ): Promise<void> {
    if (!this.processor || !this.model) throw new Error('Model not loaded')

    const messages = [
      {
        role: 'user',
        content: [{ type: 'image' }, { type: 'text', text: instruction }],
      },
    ]

    const text: string = this.processor.apply_chat_template(messages, {
      add_generation_prompt: true,
      tokenizer_kwargs: { enable_thinking: false },
    })

    const inputs = await this.processor(text, [image])

    let firstToken = true
    await this.model.generate({
      ...inputs,
      do_sample: false,
      max_new_tokens: 128,
      streamer: new TextStreamer(this.processor.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token: string) => {
          onToken(firstToken ? token.trimStart() : token)
          firstToken = false
        },
      }),
    })
  }

  isReady(): boolean {
    return this.ready
  }
}
