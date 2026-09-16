import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env
const maxConcurrentRequests = 1
let activeRequests = 0
const requestQueue = []

function drainRequestQueue () {
  while (activeRequests < maxConcurrentRequests && requestQueue.length > 0) {
    activeRequests += 1
    requestQueue.shift()()
  }
}

function acquireRequest () {
  return new Promise(resolve => {
    requestQueue.push(resolve)
    drainRequestQueue()
  })
}

function releaseRequest () {
  activeRequests = Math.max(0, activeRequests - 1)
  drainRequestQueue()
}

const client = new NotionAPI({
  authToken: NOTION_ACCESS_TOKEN?.trim() || undefined,
  ofetchOptions: {
    retry: 4,
    retryDelay: ({ response }) => {
      if (response?.status !== 429) return 500

      const retryAfter = Number(response.headers.get('retry-after'))
      return Number.isFinite(retryAfter) ? retryAfter * 1000 : 3000
    },
    headers: {
      // Notion's bot protection rejects server-side requests without a User-Agent.
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    },
    onRequest: acquireRequest,
    onRequestError: releaseRequest,
    onResponse: ({ response }) => {
      if (response.status < 400) releaseRequest()
    },
    onResponseError: releaseRequest
  }
})

export default client
