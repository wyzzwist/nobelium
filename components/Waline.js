import { useEffect, useRef } from 'react'
import { init } from '@waline/client'

export default function Waline ({ serverURL, path, lang }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!serverURL || !containerRef.current) return undefined

    const waline = init({
      el: containerRef.current,
      serverURL,
      path,
      lang,
      login: 'disable',
      meta: ['nick', 'mail'],
      requiredMeta: ['nick'],
      locale: {
        nickError: 'Please enter a nickname.'
      },
      dark: 'html.dark',
      noRss: true,
      noCopyright: true,
      emoji: false,
      imageUploader: false,
      search: false,
      highlighter: false,
      texRenderer: false,
      reaction: false
    })

    return () => waline.destroy()
  }, [serverURL, path, lang])

  if (!serverURL) {
    return (
      <div className="waline-config-notice">
        评论区已接入 Waline，配置服务地址后即可启用。
      </div>
    )
  }

  return <div ref={containerRef} className="waline-container" />
}
