<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
:root {
  --brand-primary: #4f70ff;
  --brand-primary-dark: #3f5ee0;
  --brand-soft: #eef3ff;
  --brand-border: #e1e8ff;
  --text-primary: #1f2d3d;
  --text-secondary: #5b6b84;
  --text-muted: #8b97ad;
  --surface: #ffffff;
  --surface-muted: #f4f7ff;
  --surface-soft: #f8faff;
  --shadow-soft: 0 18px 40px rgba(32, 45, 77, 0.08);
  --radius-large: 18px;
  --radius-medium: 12px;
}

* {
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
}

body {
  font-family: "Manrope", "Noto Sans SC", "PingFang SC", sans-serif;
  color: var(--text-primary);
  background: var(--surface-muted);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100%;
  color: var(--text-primary);
}

.el-button--primary {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.el-button--primary:hover,
.el-button--primary:focus {
  background-color: var(--brand-primary-dark);
  border-color: var(--brand-primary-dark);
}

.el-card {
  border-radius: var(--radius-medium);
  border: 1px solid var(--brand-border);
  box-shadow: none;
}

.el-card__header {
  border-bottom: 1px solid var(--brand-border);
  background: var(--surface-soft);
}

.el-menu {
  border-right: none;
  background: transparent;
}

.el-menu-item.is-active {
  background-color: var(--brand-soft) !important;
  color: var(--brand-primary) !important;
}

.el-menu-item:hover,
.el-submenu__title:hover {
  background-color: #eef2ff !important;
}

.el-breadcrumb__inner,
.el-breadcrumb__separator {
  color: var(--text-muted);
}

.el-table {
  border-radius: var(--radius-medium);
  overflow: hidden;
}

.el-table th {
  background: var(--surface-soft);
  color: var(--text-secondary);
}

.el-input__inner,
.el-textarea__inner {
  border-radius: 10px;
  border-color: #d9e2f5;
}

.el-form-item__label {
  color: var(--text-secondary);
}

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: var(--brand-primary);
}
</style>
