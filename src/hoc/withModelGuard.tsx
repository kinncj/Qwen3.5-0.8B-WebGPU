import type { ComponentType } from 'react'
import type { ModelStatus } from '../types'

interface ModelGuardProps {
  modelStatus: ModelStatus
}

/**
 * HOC that gates rendering on model readiness.
 * While loading it renders the fallback; on error it renders the error message.
 */
export function withModelGuard<P extends object>(
  WrappedComponent: ComponentType<P>,
  Fallback: ComponentType<{ status: ModelStatus }>,
) {
  function ModelGuarded(props: P & ModelGuardProps) {
    const { modelStatus, ...rest } = props

    if (modelStatus.phase !== 'ready') {
      return <Fallback status={modelStatus} />
    }

    return <WrappedComponent {...(rest as P)} />
  }

  const displayName = WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'
  ModelGuarded.displayName = `withModelGuard(${displayName})`

  return ModelGuarded
}
