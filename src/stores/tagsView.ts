import { defineStore } from 'pinia'
import type { TagView } from '@/types/store'

const noCacheList = ['/log/login', '/log/operate', '/file', '/profile', '/system/menu']

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagView[],
    cachedViews: [] as string[],
    viewKey: 0
  }),
  actions: {
    addView(view: TagView) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addVisitedView(view: TagView) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      this.visitedViews.push({
        name: view.name,
        path: view.path,
        fullPath: view.fullPath || view.path,
        meta: view.meta || {},
        title: view.title || (view.meta?.title as string) || view.name
      })
      this.sortVisitedViews()
    },
    addCachedView(view: TagView) {
      if (!view.name) return
      if (this.cachedViews.includes(view.name)) return
      if (view.meta?.noCache || noCacheList.includes(view.path)) return
      this.cachedViews.push(view.name)
    },
    delView(view: TagView) {
      this.delVisitedView(view)
      this.delCachedView(view)
    },
    delVisitedView(view: TagView) {
      this.visitedViews = this.visitedViews.filter(v => v.path !== view.path)
      this.sortVisitedViews()
    },
    delCachedView(view: TagView) {
      this.cachedViews = this.cachedViews.filter(name => name !== view.name)
    },
    delOthers(view: TagView) {
      this.visitedViews = this.visitedViews.filter(
        v => (v.meta && v.meta.affix) || v.path === view.path
      )
      this.sortVisitedViews()
      this.cachedViews = this.cachedViews.filter(name => name === view.name)
    },
    delAll() {
      this.visitedViews = this.visitedViews.filter(v => v.meta && v.meta.affix)
      this.sortVisitedViews()
      this.cachedViews = []
    },
    refreshView(view: TagView) {
      this.delCachedView(view)
      this.viewKey += 1
      this.addCachedView(view)
    },
    sortVisitedViews() {
      const affixViews = this.visitedViews.filter(v => v.meta && v.meta.affix)
      const normalViews = this.visitedViews.filter(v => !v.meta || !v.meta.affix)
      this.visitedViews = [...affixViews, ...normalViews]
    }
  }
})
