import { useContext } from 'react'
import { ConfirmContext } from '../context/confirmContext'

export function useConfirm() {
  return useContext(ConfirmContext)
}
