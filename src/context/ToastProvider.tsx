import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([])
  const idRef = useRef(0)

  const show = useCallback((message: string) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed bottom-28 left-1/2 z-[100] flex max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-lg bg-apple-text px-4 py-2.5 text-center text-[14px] leading-snug text-white shadow-apple-card"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
