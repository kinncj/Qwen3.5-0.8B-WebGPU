import { useState } from 'react'
import { StartStopButton } from '../StartStopButton'

interface Props {
  isProcessing: boolean
  canStart: boolean
  response: string
  onStart: (instruction: string) => void
  onStop: () => void
  onInstructionChange: (instruction: string) => void
}

const DEFAULT_INSTRUCTION = 'Briefly describe what you see (2 sentences max).'

export function ControlPanel({
  isProcessing,
  canStart,
  response,
  onStart,
  onStop,
  onInstructionChange,
}: Props) {
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION)

  const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstruction(e.target.value)
    onInstructionChange(e.target.value)
  }

  return (
    <div className="flex w-[min(92vw,760px)] flex-col gap-2 rounded-xl border border-gray-200 bg-white/90 px-0 py-2.5 shadow-lg">
      {/* Instruction row */}
      <div className="grid w-full max-w-[720px] grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5 self-center px-2.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="instruction" className="text-[13px] font-semibold text-gray-700">
            Instruction:
          </label>
          <textarea
            id="instruction"
            rows={1}
            value={instruction}
            onChange={handleInstructionChange}
            className="w-full resize-none overflow-hidden rounded-lg border border-gray-300 px-2.5 py-1.5 text-[13px] leading-snug text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <StartStopButton
          isProcessing={isProcessing}
          disabled={!canStart}
          onStart={() => onStart(instruction)}
          onStop={onStop}
        />
      </div>

      {/* Response row */}
      <div className="grid w-full max-w-[720px] grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5 self-center px-2.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="response" className="text-[13px] font-semibold text-gray-700">
            Response:
          </label>
          <textarea
            id="response"
            rows={3}
            readOnly
            value={response}
            placeholder="Response will appear here..."
            className="w-full resize-none overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-[13px] leading-snug text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {/* spacer aligns with the button column above */}
        <div className="w-[84px]" aria-hidden />
      </div>
    </div>
  )
}
