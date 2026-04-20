import { createContext } from 'react'

export type ConfirmOptions = {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))
