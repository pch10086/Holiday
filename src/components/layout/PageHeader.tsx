import type { ReactNode } from 'react'
import { ArrowLeft, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  rightAction?: ReactNode
  /** 标题行下方全宽区域（如统一工具栏） */
  below?: ReactNode
  /** 深色页头（用于黑底沉浸区上的子页） */
  variant?: 'light' | 'dark'
}

export function PageHeader({ title, subtitle, backTo, rightAction, below, variant = 'light' }: PageHeaderProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const isDark = variant === 'dark'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('链接已复制，可直接发给旅伴。')
    } catch {
      toast('无法访问剪贴板，请手动复制地址栏链接。')
    }
  }

  const shell =
    isDark
      ? 'border-white/10 bg-black/55 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-black/45'
      : 'border-black/[0.06] bg-apple-gray/85 text-apple-text backdrop-blur-xl supports-[backdrop-filter]:bg-apple-gray/75'

  return (
    <header className={`sticky top-0 z-20 border-b ${shell}`}>
      <div className="mx-auto flex h-[52px] max-w-md items-center justify-between px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {backTo ? (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/18'
                  : 'bg-apple-surface text-apple-text hover:bg-black/[0.04]'
              }`}
              aria-label="返回"
            >
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
          ) : null}
          <div className="min-w-0">
            <h1
              className={`truncate text-[17px] font-semibold leading-tight tracking-[-0.02em] ${
                isDark ? 'text-white' : 'text-apple-text'
              }`}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={`truncate text-[12px] leading-tight tracking-[-0.01em] ${
                  isDark ? 'text-white/55' : 'text-black/48'
                }`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {rightAction ?? (
          <button
            type="button"
            onClick={() => void copyLink()}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/18'
                : 'bg-apple-blue text-white hover:bg-apple-blue-hover'
            }`}
            aria-label="分享"
          >
            <Share2 size={17} strokeWidth={1.75} />
          </button>
        )}
      </div>
      {below ? (
        <div
          className={`mx-auto w-full max-w-md border-t px-3 py-2 ${isDark ? 'border-white/10' : 'border-black/[0.06]'}`}
        >
          {below}
        </div>
      ) : null}
    </header>
  )
}
