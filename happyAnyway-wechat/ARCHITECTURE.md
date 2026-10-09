# 微信端架构

状态：已停用，以下保留历史结构约定，不表示所有层次已有实现。2026-10-08 标记冻结；项目经理维护停用状态，重新启用前由获派开发岗位核对源码并按[路书维护规则](../docs/rules/project-roadmap.md)更新。当前产品方向见[总路书](../ARCHITECTURE.md)。

## 边界
本仓库独立维护所有微信端代码，不与 App、网页共享前端代码包。后端接口是唯一业务数据入口。

## 职责
- pages/components：展示、交互和生命周期。
- services：本端操作流程。
- api：接口请求、响应类型和错误映射。
- platform：微信网络、登录、存储等能力封装。
- state：本端会话和必要状态。
- utils：通用纯函数。

## 初版约束
- 页面不得直接调用 wx.request；经 services/api 使用统一传输封装。
- 服务端权限、金额等权威规则不能由前端替代。
- 密钥不得进入客户端。
- 契约副本锁定已适配版本，不自动跟随后端变化。

以上是迁入的目录与开发约束。本次未迁移旧项目的 wx.request 专项 ESLint 限制或边界测试，当前通过开发自检与独立审查核对。现有首页连通性示例直接调用 wx.request，尚未按该边界改造；本次仅迁移文档，不宣称实现已符合。

实现细节见[开发规则](docs/rules/development.md)。目录按功能需要创建，不预建空业务模块。

## 当前目录结构

核对日期：2026-10-08；以下为当前主工作区实际文件，排除 Git 元数据、依赖及构建缓存。隔离工作区尚未合并的文件不列入；其他章节中的规划分层不代表已经存在。

```text
happyAnyway-wechat/
├── agent.md  # 本岗位职责、权限和接单要求
├── ARCHITECTURE.md  # 本项目路书、目录树及文件用途
├── docs/
│   ├── development/
│   │   └── README.md  # 本工程页面或功能开发文档索引
│   └── rules/
│       └── development.md  # 本工程编码、自检和开发文档要求
├── eslint.config.mjs  # TypeScript 代码检查规则
├── miniprogram/
│   ├── app.json  # 小程序页面列表和全局窗口配置
│   ├── app.ts  # 注册小程序应用
│   ├── app.wxss  # 小程序全局样式
│   ├── config.ts  # 配置后端请求基础地址
│   ├── pages/
│   │   └── index/
│   │       ├── index.json  # 首页页面配置
│   │       ├── index.ts  # 首页健康检查请求、加载和结果展示逻辑
│   │       ├── index.wxml  # 首页标题、连接按钮和状态界面
│   │       └── index.wxss  # 首页布局与样式
│   └── sitemap.json  # 微信页面索引规则
├── package-lock.json  # 锁定 npm 依赖解析版本
├── package.json  # 声明 npm 依赖及开发检查命令
├── project.config.json  # 微信开发者工具工程配置
├── README.md  # 本工程状态、运行及使用说明
└── tsconfig.json  # TypeScript 编译选项和文件范围
```
