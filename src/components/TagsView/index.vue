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
        <el-icon
          v-if="!isAffix(tag)"
          class="tag-close"
          @click.stop="handleClose(tag)"
        >
          <Close />
        </el-icon>
      </div>
    </div>
    <div v-if="menuVisible" class="context-menu" :style="menuStyle">
      <button type="button" @click="refreshSelected">
        <el-icon class="menu-icon"><Refresh /></el-icon>
        刷新页面
      </button>
      <button type="button" @click="closeSelected">
        <el-icon class="menu-icon"><Close /></el-icon>
        关闭当前
      </button>
      <button type="button" @click="closeOthers">
        <el-icon class="menu-icon"><Remove /></el-icon>
        关闭其他
      </button>
      <button type="button" @click="closeAll">
        <el-icon class="menu-icon"><CircleClose /></el-icon>
        全部关闭
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Refresh, Remove, CircleClose } from '@element-plus/icons-vue'
import { useTagsViewStore } from '@/stores/tagsView'
import type { TagView } from '@/types/store'

defineOptions({ name: 'TagsView' })

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const menuVisible = ref(false)
const menuLeft = ref(0)
const menuTop = ref(0)
const selectedTag = ref<TagView | null>(null)

const visitedViews = computed(() => tagsViewStore.visitedViews)
const menuStyle = computed(() => ({ left: `${menuLeft.value}px`, top: `${menuTop.value}px` }))

const affixTags: TagView[] = [
  { path: '/dashboard', name: 'Dashboard', fullPath: '/dashboard', meta: { title: '首页', affix: true }, title: '首页' }
]

function isActive(tag: TagView) { return tag.path === route.path }
function isAffix(tag: TagView) { return tag.meta && tag.meta.affix }

function handleClick(tag: TagView) {
  if (route.path !== tag.path) router.push(tag.path)
}

function handleClose(tag: TagView) {
  tagsViewStore.delView(tag)
  if (isActive(tag)) {
    const latest = visitedViews.value.slice(-1)[0]
    router.push(latest ? latest.path : '/dashboard')
  }
}

function openMenu(tag: TagView, event: MouseEvent) {
  selectedTag.value = tag
  const menuWidth = 120
  const menuHeight = 150
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  let left = rect.right + 8
  let top = rect.top
  if (left + menuWidth > window.innerWidth) left = rect.left - menuWidth - 8
  if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 8
  menuLeft.value = Math.max(left, 8)
  menuTop.value = Math.max(top, 8)
  menuVisible.value = true
}

function closeMenu() { menuVisible.value = false }

async function refreshSelected() {
  if (!selectedTag.value) return
  tagsViewStore.refreshView(selectedTag.value)
  closeMenu()
}

function closeSelected() {
  if (!selectedTag.value || isAffix(selectedTag.value)) return
  handleClose(selectedTag.value)
  closeMenu()
}

function closeOthers() {
  if (!selectedTag.value) return
  tagsViewStore.delOthers(selectedTag.value)
  if (!isActive(selectedTag.value)) router.push(selectedTag.value.path)
  closeMenu()
}

function closeAll() {
  tagsViewStore.delAll()
  router.push('/dashboard')
  closeMenu()
}

onMounted(() => {
  affixTags.forEach(tag => tagsViewStore.addView(tag))
  document.body.addEventListener('click', closeMenu)
})
onBeforeUnmount(() => {
  document.body.removeEventListener('click', closeMenu)
})
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
  cursor: pointer;
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
  min-width: 120px;
}

.context-menu button {
  border: none;
  background: transparent;
  text-align: center;
  padding: 8px 10px;
  font-size: 12px;
  color: #3b4a66;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  width: 100%;
}

.context-menu .menu-icon {
  font-size: 14px;
  color: #6b7a99;
}

.context-menu button:hover {
  background: #eef2ff;
  color: #1f2d3d;
}
</style>
