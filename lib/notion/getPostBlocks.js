import { NotionAPI } from 'notion-client'

export async function getPostBlocks (id) {
  const api = new NotionAPI()
  const pageBlock = await api.getPage(id)

  // v7: 将 block.value.value 展平回 block.value 以兼容 react-notion-x
  if (pageBlock?.block) {
    Object.keys(pageBlock.block).forEach(key => {
      const b = pageBlock.block[key]
      if (b?.value?.value && !b?.value?.type) {
        pageBlock.block[key] = {
          ...b,
          value: b.value.value
        }
      }
    })
  }

  // 同样处理 collection
  if (pageBlock?.collection) {
    Object.keys(pageBlock.collection).forEach(key => {
      const c = pageBlock.collection[key]
      if (c?.value?.value && !c?.value?.schema) {
        pageBlock.collection[key] = {
          ...c,
          value: c.value.value
        }
      }
    })
  }

  return pageBlock
}