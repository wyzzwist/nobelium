export default function getAllPageIds (collectionQuery, collectionId, collectionView, block) {
  if (!collectionQuery || !collectionId) return []

  const views = collectionQuery[collectionId]
  if (!views) return []

  const viewId = Object.keys(views)[0]
  const viewData = views[viewId]

  let pageIds =
    viewData?.blockIds ||
    viewData?.collection_group_results?.blockIds ||
    []

  if (pageIds.length === 0 && viewData?.reducerResults) {
    const reducer = Object.values(viewData.reducerResults)[0]
    pageIds = reducer?.blockIds || []
  }

  // fallback: 从 block content 中提取
  if (pageIds.length === 0) {
    const collectionViewBlock = Object.values(block || {}).find(b => {
      const t = b?.value?.value?.type || b?.value?.type
      return t === 'collection_view' || t === 'collection_view_page'
    })
    const content = collectionViewBlock?.value?.value?.content || collectionViewBlock?.value?.content
    if (content) {
      pageIds = content
    }
  }

  return pageIds
}