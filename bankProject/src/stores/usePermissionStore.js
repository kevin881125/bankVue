// stores/usePermissionStore.js
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    pageMap: {}  // pageId: pageName
  }),
  getters: {
    allowedPageIds(state) {
      return Object.keys(state.pageMap).map(Number)
    },
    allowedPages(state) {
      return Object.entries(state.pageMap).map(([id, name]) => ({
        id: Number(id),
        name
      }))
    }
  },
  actions: {
    setPageMap(pages) {
      this.pageMap = pages
    },
    hasAccess(pageId) {
      return !!this.pageMap[pageId]
    }
  }
})
