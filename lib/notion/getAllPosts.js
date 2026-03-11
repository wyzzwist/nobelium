import { NotionAPI } from 'notion-client'
import { idToUuid } from 'notion-utils'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import BLOG from '@/blog.config'

export async function getAllPosts ({ includePages = false }) {
  const api = new NotionAPI()
  const id = idToUuid(BLOG.notionPageId || process.env.NOTION_PAGE_ID)
  const response = await api.getPage(id)

  const collectionId = Object.keys(response?.collection || {})[0]
  const collectionRaw = response?.collection?.[collectionId]

  // v7: schema 在 value.value.schema
  const schema = collectionRaw?.value?.value?.schema || collectionRaw?.value?.schema || {}
  const block = response.block

  const rawMetadata = getAllPageIds(response.collection_query, collectionId, response.collection_view, block)

  if (!rawMetadata || rawMetadata.length === 0) {
    return []
  }

  const allPosts = (
    await Promise.all(
      rawMetadata.map(id => getPageProperties(id, block, schema))
    )
  ).filter(post => post !== null)

  const posts = allPosts.filter(post => {
    return (
      post.title &&
      post.slug &&
      post?.status?.[0] === 'Published' &&
      (includePages || post?.type?.[0] !== 'Page')
    )
  })

  posts.sort((a, b) => {
    const dateA = new Date(a?.date || a?.createdTime || 0)
    const dateB = new Date(b?.date || b?.createdTime || 0)
    return dateB - dateA
  })

  return posts
}