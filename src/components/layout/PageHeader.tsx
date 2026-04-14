import type { ReactNode } from 'react'
import { ArrowLeft, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  rightAction?: ReactNode
  /** 标题行下方全宽区域（如统一工具栏） */
  below?: ReactNode
}

export function PageHeader({ title, subtitle, backTo, rightAction, below }: PageHeaderProps) {
  const navigate = useNavigate()

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    alert('链接已复制，可直接发给旅伴。')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {backTo ? (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 text-emerald-900"
              aria-label="返回"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <div>
            <h1 className="font-serif text-lg font-semibold text-emerald-950">{title}</h1>
            {subtitle ? <p className="text-xs text-emerald-700">{subtitle}</p> : null}
          </div>
        </div>
        {rightAction ?? (
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-emerald-900"
            aria-label="分享"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>
      {below ? (
        <div className="mx-auto w-full max-w-md border-t border-emerald-100 px-4 py-2">{below}</div>
      ) : null}
    </header>
  )
}
