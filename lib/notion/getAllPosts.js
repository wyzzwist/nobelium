import { idToUuid } from 'notion-utils'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import api from '@/lib/server/notion-api'
import BLOG from '@/blog.config'

let allPostsCache = null
const cacheTtl = 60 * 1000

async function loadAllPosts () {
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
      post?.status?.[0] === 'Published'
    )
  })

  posts.sort((a, b) => {
    const dateA = new Date(a?.date || a?.createdTime || 0)
    const dateB = new Date(b?.date || b?.createdTime || 0)
    return dateB - dateA
  })

  return posts
}

export async function getAllPosts ({ includePages = false } = {}) {
  if (!allPostsCache || allPostsCache.expiresAt <= Date.now()) {
    const promise = loadAllPosts()
    allPostsCache = {
      promise,
      expiresAt: Date.now() + cacheTtl
    }

    promise.catch(() => {
      if (allPostsCache?.promise === promise) allPostsCache = null
    })
  }

  const posts = await allPostsCache.promise
  return includePages ? posts : posts.filter(post => post?.type?.[0] !== 'Page')
}
