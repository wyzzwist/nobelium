import { clientConfig } from '@/lib/server/config'
import { getNotionConfig } from '@/lib/notion/getNotionConfig'

let cachedConfig = null

export default async function handler (req, res) {
  if (!cachedConfig) {
    const notionConfig = await getNotionConfig()
    cachedConfig = {
      ...clientConfig,
      ...notionConfig,
      comment: {
        ...clientConfig.comment,
        cusdisConfig: {
          ...clientConfig.comment?.cusdisConfig,
          appId: notionConfig.cusdisAppId || clientConfig.comment?.cusdisConfig?.appId
        }
      }
    }
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
  res.status(200).json(cachedConfig)
}