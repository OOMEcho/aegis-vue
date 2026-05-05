<div align="center">

[![Vue](https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg)](https://cn.vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0.2-yellow.svg)](https://pinia.vuejs.org/zh/)
[![VueRouter](https://img.shields.io/badge/VueRouter-4.5.0-red.svg)](https://router.vuejs.org/zh/)
[![Element Plus](https://img.shields.io/badge/ElementPlus-2.9.7-blue.svg)](https://element-plus.org/zh-CN/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.4-646CFF.svg)](https://cn.vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.11.0-yellow.svg)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/OOMEcho/aegis)
## 🍟 如果您觉得有帮助，请点右上角 "Star" 支持一下谢谢

</div>

## 🌟 项目介绍

Aegis是一个功能完整的企业级RBAC(Role-Based Access Control)权限管理系统，采用前后端分离架构设计。系统以权限为核心，
通过用户 -> 角色 -> 权限完成授权，菜单路由与接口资源都通过权限进行关联和控制，可作为企业应用开发的基础框架。

本仓库为 **Vue 3 + TypeScript + Vite + Element Plus** 版本，与 Vue 2 版本（[aegis-vue (vue2 分支)](https://github.com/OOMEcho/aegis-vue)）功能与页面保持一致。

### ✨ 核心特性

- 🔐 **多样化登录**：账号密码、邮箱验证码登录
- 🧩 **滑块验证码**：登录安全校验，降低恶意登录风险
- 🔑 **RSA 加密**：密码加密传输，配合后端公钥
- 🧭 **权限驱动菜单/路由**：基于权限动态生成路由与菜单
- 🎯 **按钮级权限指令**：细粒度操作权限控制
- 🗂️ **标签页导航**：多页签快速切换与缓存
- 🧰 **完整后台模块**：用户/角色/权限/菜单/资源/部门/字典/日志/通知/文件等
- 🦾 **TypeScript 全量化**：组件、Store、API、工具函数全部带类型声明
- ⚡ **Vite 极速开发**：冷启动毫秒级，HMR 即时反馈

## 🔗 相关项目

- 点击跳转[后端仓库](https://github.com/OOMEcho/aegis)
- 点击跳转[Vue 2 版本前端仓库](https://github.com/OOMEcho/aegis-vue)

## 🌐 在线演示

- 点击跳转[演示地址](https://aegis.lxsblogs.cn)

## 🔐 默认账号

- 管理员账号：
  - 账号：`admin`
  - 密码：`123456`
- 普通用户账号：
  - 账号：`visitor`
  - 密码：`123456`

## 🏗️ 技术架构

### 🧱 技术栈

| 技术                       | 版本      | 说明                  |
|--------------------------|---------|---------------------|
| Vue                      | 3.5.13  | 前端框架（Composition API） |
| TypeScript               | 5.8.2   | 类型系统                |
| Vite                     | 6.2.4   | 构建工具                |
| Vue Router               | 4.5.0   | 路由管理                |
| Pinia                    | 3.0.2   | 状态管理                |
| Element Plus             | 2.9.7   | 组件库                 |
| @element-plus/icons-vue  | 2.3.1   | 图标组件                |
| Axios                    | 1.11.0  | HTTP 请求             |
| Echarts / vue-echarts    | 5.6.0 / 7.0.3 | 图表展示          |
| @wangeditor/editor-for-vue | 5.1.12 | 富文本                 |
| node-forge               | 1.3.3   | RSA 加密              |
| dompurify                | 3.3.1   | XSS 净化              |
| NProgress                | 0.2.0   | 路由进度条               |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/OOMEcho/aegis-vue.git
cd aegis-vue
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

开发环境：`.env.development`

```bash
# 页面标题
VITE_APP_TITLE = aegis

# 请求前缀（用于本地代理转发）
VITE_BASE_PRE = /api

# 后端服务地址
VITE_BASE_API = http://127.0.0.1:8088
```

生产环境：`.env.production`

```bash
VITE_APP_TITLE = aegis
VITE_BASE_PRE = /api
VITE_BASE_API = https://admin.example.cn
```

说明：`VITE_BASE_PRE` 作为请求前缀用于本地代理转发，`VITE_BASE_API` 指向后端服务地址。

4. **启动开发服务**

```bash
npm run dev
```

默认端口：`http://localhost:9090`

### 类型检查

```bash
npm run type-check
```

### 构建生产包

```bash
npm run build
```

构建产物输出到 `dist` 目录。

### 预览生产包

```bash
npm run preview
```

## 📦 功能模块

### 🎯 核心模块

| 模块 | 功能描述 |
|------|----------|
| **用户管理** | 用户增删改查、状态管理、密码重置、在线状态、强制下线 |
| **角色管理** | 角色配置、权限分配、数据权限设置 |
| **权限管理** | 权限编码维护、状态控制 |
| **资源管理** | URL/Method与权限映射 |
| **菜单管理** | 菜单配置、权限关联、路由管理 |
| **部门管理** | 组织架构、层级管理、部门权限 |
| **字典管理** | 系统字典、配置管理 |
| **日志管理** | 操作日志、登录日志、导出 |
| **文件管理** | 文件上传、存储管理、访问控制 |
| **通知公告** | 系统通知、公告发布、消息推送、定时发布 |
| **IP白名单** | 访问控制、安全防护 |
| **限流控制** | 接口访问频率限制、防刷机制 |
| **数据脱敏** | 敏感数据保护、多种脱敏规则 |

### 🔒 安全特性

#### 认证机制
- **密码认证**: 传统用户名密码登录
- **邮箱认证**: 邮箱验证码登录
- **短信认证**: 手机短信验证码登录
- **RSA加密**: 密码传输加密保护

#### 权限控制
- **权限模型**: 用户 -> 角色 -> 权限
- **URL级权限**: 资源与权限映射控制接口访问
- **菜单级权限**: 菜单与权限关联控制路由
- **按钮级权限**: 细粒度操作权限控制
- **数据级权限**: 行级数据访问控制

#### 数据权限类型
- **全部数据权限**: 无限制访问
- **自定义数据权限**: 按指定部门范围
- **部门数据权限**: 按所属部门
- **部门及以下数据权限**: 按部门层级
- **仅本人数据权限**: 仅访问本人数据

## 🏛️ 系统架构

### 包结构

```
src/
├── api/               # 接口封装（按业务模块拆分）
├── assets/            # 静态资源（图片、iconfont）
├── components/        # 通用组件（Layout/Aside/TagsView/Login/Register/SlideCaptcha 等）
├── composables/       # 组合式函数（useDict / usePermission）
├── directives/        # 自定义指令（v-perm 按钮权限）
├── router/            # 路由配置（index.ts 静态路由 + guard.ts 守卫）
├── stores/            # Pinia 状态（auth / permission / tagsView）
├── styles/            # 全局样式（theme.css / common.css / auth.css）
├── types/             # 全局类型声明（api / router / store）
├── utils/             # 工具库（request / encrypt / dict / permCode）
├── views/             # 页面视图（按模块组织）
├── App.vue            # 根组件
└── main.ts            # 入口文件
```

## 🖼️ 项目截图

![登录页](docs/screenshots/login.png)
![注册页](docs/screenshots/register.png)
![验证码](docs/screenshots/loging.png)
![仪表盘](docs/screenshots/dashboard.png)
![个人中心](docs/screenshots/profile.png)
![用户管理](docs/screenshots/user.png)
![角色管理](docs/screenshots/role.png)
![菜单管理](docs/screenshots/menu.png)
![权限管理](docs/screenshots/permission.png)
![资源管理](docs/screenshots/resouce.png)
![部门管理](docs/screenshots/dept.png)
![字典管理](docs/screenshots/dictionary.png)
![白名单管理](docs/screenshots/whitlist.png)
![登录日志](docs/screenshots/login-log.png)
![操作日志](docs/screenshots/operation.png)
![通知公告](docs/screenshots/notice.png)
![我的通知](docs/screenshots/notice-user.png)

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE.txt) 许可证开源。

## 👥 团队

- **南常** - 项目负责人 - [228389787@qq.com](mailto:228389787@qq.com)

## 🙏 致谢

感谢以下开源项目：

- 🔥 [JetBrains](https://www.jetbrains.com/) - 世界最好的IDE
- [Vue](https://cn.vuejs.org/) - 基础框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Vite](https://cn.vitejs.dev/) - 前端构建工具
- [Pinia](https://pinia.vuejs.org/zh/) - 状态管理
- [Vue Router](https://router.vuejs.org/zh/) - 路由管理
- [Element Plus](https://element-plus.org/zh-CN/) - 组件库
- [Axios](https://axios-http.com/) - HTTP请求库
- [Echarts](https://echarts.apache.org/zh/index.html) - 图表库
- [wangEditor](https://www.wangeditor.com/) - 富文本编辑器

## 📞 支持

如果您在使用过程中遇到问题，可以通过以下方式寻求帮助：

- 📧 邮件: [228389787@qq.com](mailto:228389787@qq.com)
- 🐛 Issue: [提交Issue](https://github.com/OOMEcho/aegis-vue/issues)
- 📖 文档: [项目Wiki](https://github.com/OOMEcho/aegis-vue/wiki)

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐ Star！**

Made with ❤️ by [OOMEcho](https://github.com/OOMEcho)

</div>
