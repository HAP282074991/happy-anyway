# App 架构

维护岗位：App 开发 Agent。当前主工作区仅有管理文档，下述源码分层为已确认规范，不代表已存在源码。运行、构建和测试入口见 [README](README.md)。结构维护遵循[路书维护规则](../docs/rules/project-roadmap.md)。

技术栈：React Native + Expo + TypeScript，同时支持 Android 和 iOS。

路由入口 app/ 负责页面组合；src/components 负责复用展示；src/services 组织操作；src/api 定义后端契约与响应校验；src/platform 封装网络及设备能力；src/config 负责环境；state 按真实需求引入。不预建无用途目录。

请求方向：页面 → service/API → 统一传输封装 → 后端。页面不得直接调用 fetch 或第三方 HTTP 客户端。外部响应按 unknown 处理并校验后使用；错误分类与 UI 文案分开。

Android/iOS 共享主要业务代码，平台差异限定在对应配置或平台封装。独立测试安装包须包含 JS bundle，启动不依赖 Metro；访问后端仍需要网络。

首期只有健康检查页面，不添加登录、业务表、推送或全局状态框架。具体命令、框架版本及原生构建路径由开发核实后写入 README。

## 当前目录结构

核对日期：2026-10-08；以下为当前主工作区实际文件，排除 Git 元数据、依赖及构建缓存。隔离工作区尚未合并的文件不列入；其他章节中的规划分层不代表已经存在。

```text
happyAnyway-app/
├── agent.md  # 本岗位职责、权限和接单要求
├── ARCHITECTURE.md  # 本项目路书、目录树及文件用途
├── docs/
│   ├── development/
│   │   └── README.md  # 本工程页面或功能开发文档索引
│   └── rules/
│       └── development.md  # 本工程编码、自检和开发文档要求
└── README.md  # 本工程状态、运行及使用说明
```
