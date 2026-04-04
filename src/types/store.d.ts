export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  sex?: string
  deptName?: string
  roleList?: Array<{ roleCode: string; roleName: string }>
  permissions: string[]
  routerVoList: RouteItem[]
  [key: string]: unknown
}

export interface RouteItem {
  path: string
  name: string
  title: string
  icon: string
  hidden: boolean
  children?: RouteItem[]
}

export interface TagView {
  name: string
  path: string
  fullPath: string
  meta: Record<string, unknown>
  title: string
}
