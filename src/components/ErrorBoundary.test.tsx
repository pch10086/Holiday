import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ThrowingChild(): never {
  throw new Error('test-boom')
}

describe('ErrorBoundary', () => {
  it('shows fallback UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText('页面出错了')).toBeInTheDocument()
    expect(screen.getByText(/test-boom/)).toBeInTheDocument()
    spy.mockRestore()
  })
})
