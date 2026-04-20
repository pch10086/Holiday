import { useCallback, useEffect, useState } from 'react'
import type { ConfirmFn, ConfirmOptions } from './confirmContext'
import { ConfirmContext } from './confirmContext'

type Pending = ConfirmOptions & { resolve: (value: boolean) => void }

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Pending | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve })
    })
  }, [])

  const close = (value: boolean) => {
    setState((current) => {
      current?.resolve(value)
      return null
    })
  }

  useEffect(() => {
    if (!state) return
    const { resolve } = state
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resolve(false)
        setState(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 px-4 py-6 sm:items-center"
          role="presentation"
          onClick={() => close(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="w-full max-w-sm rounded-[12px] bg-white p-5 shadow-apple-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="text-[17px] font-semibold tracking-[-0.02em] text-apple-text">
              {state.title ?? '请确认'}
            </h2>
            <p id="confirm-dialog-desc" className="mt-2 text-[15px] leading-relaxed text-black/80">
              {state.message}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="min-h-11 flex-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[15px] font-normal text-apple-text"
                onClick={() => close(false)}
              >
                {state.cancelLabel ?? '取消'}
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 rounded-lg bg-apple-text text-[15px] font-normal text-white"
                onClick={() => close(true)}
              >
                {state.confirmLabel ?? '确定'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}
