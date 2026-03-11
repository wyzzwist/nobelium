import { getTextContent, getDateValue } from 'notion-utils'
import { NotionAPI } from 'notion-client'

const excludeProperties = ['date', 'select', 'multi_select', 'person']

async function getPageProperties (id, block, schema) {
  // v7: 数据在 block[id].value.value
  const blockValue = block?.[id]?.value?.value || block?.[id]?.value
  const rawProperties = blockValue?.properties

  if (!rawProperties || !schema || Object.keys(schema).length === 0) {
    return null
  }

  const api = new NotionAPI()
  const properties = {}
  properties.id = id

  for (const i in rawProperties) {
    const key = i
    const val = rawProperties[i]

    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          if (dateProperty) {
            properties[schema[key].name] = dateProperty.start_date || ''
          } else {
            properties[schema[key].name] = ''
          }
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await api.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }

  properties.fullWidth = blockValue?.format?.page_full_width ?? false
  properties.createdTime = blockValue?.created_time || ''

  return properties
}

export { getPageProperties as default }