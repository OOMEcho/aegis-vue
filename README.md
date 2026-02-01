# Aegis 前端（Vue）

前后端分离的 RBAC 后台管理系统前端项目，基于 Vue 2 与 Element UI 构建，负责菜单路由、权限控制与管理端业务界面展示。

## ✨ 核心特性

- 🔐 **多样化登录**：账号密码、邮箱验证码登录
- 🧩 **滑块验证码**：登录安全校验，降低恶意登录风险
- 🔑 **RSA 加密**：密码加密传输，配合后端公钥
- 🧭 **权限驱动菜单/路由**：基于权限动态生成路由与菜单
- 🎯 **按钮级权限指令**：细粒度操作权限控制
- 🗂️ **标签页导航**：多页签快速切换与缓存
- 🧰 **完整后台模块**：用户/角色/权限/菜单/资源/部门/字典/日志/通知/文件等

## 🧱 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 2.7.x | 前端框架 |
| Vue CLI | 5.x | 构建脚手架 |
| Vue Router | 3.x | 路由管理 |
| Vuex | 3.x | 状态管理 |
| Element UI | 2.15.x | 组件库 |
| Axios | 1.x | HTTP 请求 |
| JSEncrypt | 3.x | RSA 加密 |
| NProgress | 0.2.x | 路由进度条 |

## 🚀 快速开始

### 环境要求

- Node.js
- npm

### 本地开发

1) **安装依赖**

```bash
npm install
```

2) **配置环境变量**

开发环境：`.env.development`

```bash
VUE_APP_BASE_PRE = '/api'
VUE_APP_BASE_API = 'http://127.0.0.1:8080'
```

生产环境：`.env.production`

```bash
VUE_APP_BASE_PRE = '/prod-api'
VUE_APP_BASE_API = 'http://127.0.0.1:8080'
```

说明：`VUE_APP_BASE_PRE` 作为请求前缀用于本地代理转发，`VUE_APP_BASE_API` 指向后端服务地址。

3) **启动开发服务**

```bash
npm run serve
```

默认端口：`http://localhost:9090`

### 构建生产包

```bash
npm run build
```

构建产物输出到 `dist` 目录。

## 📦 目录结构

```
src/
├── api/               # 接口封装
├── assets/            # 静态资源
├── components/        # 通用组件
├── directive/         # 权限指令
├── mixins/            # 通用混入
├── router/            # 路由配置
├── store/             # Vuex 状态
├── utils/             # 工具库
├── views/             # 页面视图
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 🧪 常用命令

```bash
npm run serve   # 启动开发服务
npm run build   # 构建生产包
npm run lint    # 代码检查
```

## 🖼️ 项目截图

> 请替换为实际截图路径

![登录页](<SCREENSHOT_PATH_1>)
![仪表盘](<SCREENSHOT_PATH_2>)

## 🌐 在线演示

- 演示地址：`<DEMO_URL>`

## 🔐 默认账号

- 账号：`<DEFAULT_USERNAME>`
- 密码：`<DEFAULT_PASSWORD>`

## 🤝 贡献规范

1) Fork 本仓库
2) 创建分支：`git checkout -b feature/xxx`
3) 提交修改：`git commit -m "feat: xxx"`
4) 推送分支：`git push origin feature/xxx`
5) 发起 Pull Request

## 🔗 相关项目

- 后端仓库：`<BACKEND_GITHUB_URL>`

## 📄 许可证

本项目基于 MIT License 开源。
