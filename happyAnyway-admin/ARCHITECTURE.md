# 管理后台路书

维护岗位：管理后台开发 Agent。技术栈：Vue 3 + TypeScript，构建工具：Vite，UI 组件库：Element Plus，页面路由：Vue Router，跨页面状态管理：Pinia（按需创建模块），HTTP 请求：Axios（统一封装）。代码检查与格式化：ESLint + Prettier。单元与组件测试：Vitest + Vue Test Utils；浏览器端到端测试：Playwright。当前为架构准备状态，未生成业务源码。

## 边界与依赖

浏览器管理端仅通过后端 API 访问业务能力，不直接读写数据库，不复用 App 的平台实现。服务端负责认证、授权和数据校验；菜单隐藏、路由守卫及按钮禁用不能代替服务端权限检查。接口由管理后端岗位维护，服务位于 happyAnyway-admin-api；管理后端与用户后端共用 MySQL、使用独立数据库账号；不预设共享业务模块，管理端需求通过项目经理协调。

后续源码按页面展示、功能操作、API 契约、统一传输和环境配置划分职责，依赖方向为页面 → 功能服务/API → 传输封装 → 后端。具体目录随技术栈和首个功能确认，不预建空业务模块。请求异常、加载状态及权限行为按实际需求验证。

## 当前目录结构

```text
happyAnyway-admin/
├── README.md                 # 工程定位、当前状态及资料入口
├── agent.md                  # 管理后台开发岗位职责和维护要求
├── ARCHITECTURE.md            # 工程边界、目录结构及文件用途
└── docs/
    ├── development/
    │   └── README.md         # 按页面或功能组织开发文档的索引
    └── rules/
        └── development.md   # 管理端实现、自检和交付规则
```

## 使用与维护

页面和功能说明见[开发文档](docs/development/README.md)，实现约束见[开发规则](docs/rules/development.md)。目前没有运行或构建命令，不能宣称已完成构建或浏览器测试。结构维护遵循[路书维护规则](../docs/rules/project-roadmap.md)。
