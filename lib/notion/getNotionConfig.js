import { NotionAPI } from 'notion-client'
import { idToUuid, getTextContent } from 'notion-utils'

export async function getNotionConfig () {
  const configPageId = process.env.NOTION_CONFIG_PAGE_ID

  if (!configPageId) {
    return {}
  }

  try {
    const api = new NotionAPI()
    const id = idToUuid(configPageId)

    const response = await api.getPage(id)

    const collectionId = Object.keys(response?.collection || {})[0]
    const collectionRaw = response?.collection?.[collectionId]
    const schema = collectionRaw?.value?.value?.schema || collectionRaw?.value?.schema || {}

    const block = response.block

    let keyId = null
    let valueId = null
    Object.entries(schema).forEach(([k, v]) => {
      if (v?.type === 'title') keyId = k
      if (v?.name?.toLowerCase() === 'value') valueId = k
    })

    if (!keyId || !valueId) {
      return {}
    }

    const views = response.collection_query?.[collectionId]
    const viewData = views?.[Object.keys(views)[0]]
    const pageIds = viewData?.collection_group_results?.blockIds || []

    const config = {}
    pageIds.forEach(pid => {
      const props = block?.[pid]?.value?.value?.properties || block?.[pid]?.value?.properties
      if (props) {
        const key = props[keyId] ? getTextContent(props[keyId]) : null
        const value = props[valueId] ? getTextContent(props[valueId]) : ''
        if (key) config[key] = value
      }
    })

    return config
  } catch (err) {
    console.error('Notion Config Error:', err.message)
    return {}
  }
}