import { useRef, useCallback } from "react"

export interface PollingOptions {
  minInterval?: number
  maxInterval?: number
  backoffFactor?: number
  stepSeconds?: number
}

/**
 * A generic exponential backoff polling utility that integrates natively with React Query.
 * Returns a function that can be passed directly to the `refetchInterval` option in `useQuery`.
 */
export function useExponentialPolling<TData>(
  isPollingActive: (data: TData | undefined) => boolean,
  options: PollingOptions = {}
) {
  const {
    minInterval = 2000,
    maxInterval = 30000,
    backoffFactor = 1.2,
    stepSeconds = 5,
  } = options

  const startPollingTime = useRef<number | null>(null)

  // We wrap the isPollingActive in a ref so we don't recreate the callback if the consumer uses an inline function
  const isPollingActiveRef = useRef(isPollingActive)
  isPollingActiveRef.current = isPollingActive

  const getRefetchInterval = useCallback((query: any) => {
    const active = isPollingActiveRef.current(query.state.data as TData | undefined)

    if (active && startPollingTime.current === null) {
      startPollingTime.current = Date.now()
    } else if (!active && startPollingTime.current !== null) {
      startPollingTime.current = null
    }

    if (!active || startPollingTime.current === null) {
      return false
    }

    const elapsedSeconds = Math.max(0, (Date.now() - startPollingTime.current) / 1000)
    const exponent = Math.floor(elapsedSeconds / stepSeconds)
    const calculatedInterval = minInterval * Math.pow(backoffFactor, exponent)

    return Math.min(calculatedInterval, maxInterval)
  }, [minInterval, maxInterval, backoffFactor, stepSeconds])

  return getRefetchInterval
}
