<template>
  <div class="tags-view" @click="closeMenu">
    <div class="tags-scroll">
      <div
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tag-item"
        :class="{ active: isActive(tag), affix: isAffix(tag) }"
        @click="handleClick(tag)"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <i
          v-if="tag.meta && tag.meta.icon"
          class="iconfont tag-icon"
          :class="tag.meta.icon"
        />
        <span class="tag-title">{{ tag.title }}</span>
        <i
          v-if="!isAffix(tag)"
          class="el-icon-close tag-close"
          @click.stop="handleClose(tag)"
        />
      </div>
    </div>
    <div v-if="menuVisible" class="context-menu" :style="menuStyle">
      <button type="button" @click="refreshSelected">刷新页面</button>
      <button type="button" @click="closeSelected">关闭当前</button>
      <button type="button" @click="closeOthers">关闭其他</button>
      <button type="button" @click="closeAll">全部关闭</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagsView',
  data() {
    return {
      menuVisible: false,
      menuLeft: 0,
      menuTop: 0,
      selectedTag: null,
      affixTags: [
        {path: '/dashboard', name: 'Dashboard', meta: {title: '首页', affix: true}}
      ]
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    menuStyle() {
      return {
        left: `${this.menuLeft}px`,
        top: `${this.menuTop}px`
      }
    }
  },
  mounted() {
    this.initAffixTags()
    document.body.addEventListener('click', this.closeMenu)
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this.closeMenu)
  },
  methods: {
    initAffixTags() {
      this.affixTags.forEach(tag => {
        this.$store.dispatch('tagsView/addView', tag)
      })
    },
    isActive(tag) {
      return tag.path === this.$route.path
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    handleClick(tag) {
      if (this.$route.path !== tag.path) {
        this.$router.push(tag.path)
      }
    },
    handleClose(tag) {
      this.$store.dispatch('tagsView/delView', tag)
      if (this.isActive(tag)) {
        const latest = this.visitedViews.slice(-1)[0]
        if (latest) {
          this.$router.push(latest.path)
        } else {
          this.$router.push('/dashboard')
        }
      }
    },
    openMenu(tag, event) {
      this.selectedTag = tag
      const menuWidth = 160
      const menuHeight = 150
      const rect = event.currentTarget.getBoundingClientRect()
      let left = rect.right + 8
      let top = rect.top
      if (left + menuWidth > window.innerWidth) {
        left = rect.left - menuWidth - 8
      }
      if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 8
      }
      this.menuLeft = Math.max(left, 8)
      this.menuTop = Math.max(top, 8)
      this.menuVisible = true
    },
    closeMenu() {
      this.menuVisible = false
    },
    async refreshSelected() {
      if (!this.selectedTag) return
      await this.$store.dispatch('tagsView/refreshView', this.selectedTag)
      this.closeMenu()
    },
    closeSelected() {
      if (!this.selectedTag || this.isAffix(this.selectedTag)) return
      this.handleClose(this.selectedTag)
      this.closeMenu()
    },
    closeOthers() {
      if (!this.selectedTag) return
      this.$store.dispatch('tagsView/delOthers', this.selectedTag)
      if (!this.isActive(this.selectedTag)) {
        this.$router.push(this.selectedTag.path)
      }
      this.closeMenu()
    },
    closeAll() {
      this.$store.dispatch('tagsView/delAll')
      this.$router.push('/dashboard')
      this.closeMenu()
    }
  }
}
</script>

<style scoped>
.tags-view {
  position: sticky;
  top: 0;
  z-index: 9;
  background: #f8faff;
  border-bottom: 1px solid #e1e8ff;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.tags-scroll {
  display: flex;
  gap: 8px;
  overflow: auto;
  width: 100%;
}

.tags-scroll::-webkit-scrollbar {
  height: 0;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #e1e8ff;
  border-radius: 8px;
  cursor: pointer;
  color: #5b6b84;
  font-size: 12px;
  white-space: nowrap;
}

.tag-item.active {
  color: #1f2d3d;
  border-color: rgba(90, 122, 214, 0.5);
  background: rgba(90, 122, 214, 0.12);
}

.tag-icon {
  font-size: 14px;
  color: inherit;
}

.tag-close {
  font-size: 12px;
  color: #9aa6bf;
}

.tag-close:hover {
  color: #4f70ff;
}

.context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e1e8ff;
  box-shadow: 0 10px 24px rgba(31, 45, 61, 0.12);
  border-radius: 10px;
  padding: 6px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  min-width: 160px;
}

.context-menu button {
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  font-size: 12px;
  color: #3b4a66;
  border-radius: 8px;
  cursor: pointer;
}

.context-menu button:hover {
  background: #eef2ff;
  color: #1f2d3d;
}
</style>
