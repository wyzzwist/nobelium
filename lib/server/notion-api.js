import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env

const client = new NotionAPI({
  authToken: NOTION_ACCESS_TOKEN?.trim() || undefined,
  ofetchOptions: {
    headers: {
      // Notion's bot protection rejects server-side requests without a User-Agent.
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    }
  }
})

export default client
