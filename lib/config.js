import { createContext, useContext } from 'react'
import BLOG from '@/blog.config'

const ConfigContext = createContext(BLOG)

export function ConfigProvider ({ value, children }) {
  // value 是已合并的配置，直接使用
  return (
    <ConfigContext.Provider value={value || BLOG}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig () {
  return useContext(ConfigContext)
}