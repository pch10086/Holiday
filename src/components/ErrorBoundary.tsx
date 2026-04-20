import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Holiday]', error, info.componentStack)
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-apple-gray px-6 py-12 text-apple-text">
          <h1 className="text-[21px] font-semibold tracking-[-0.02em]">页面出错了</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-black/70">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-8 min-h-11 rounded-lg bg-apple-blue px-5 text-[15px] font-normal text-white"
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
