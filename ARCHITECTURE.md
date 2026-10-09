# 项目结构路书

维护：项目经理。根路书仅维护根项目资料；子工程内部文件及用途见各自路书。

## 工程入口

| 工程 | 职责 | 路书 |
|---|---|---|
| happyAnyway-api/ | Spring Boot 后端 | [后端路书](happyAnyway-api/ARCHITECTURE.md) |
| happyAnyway-app/ | React Native / Expo App | [App 路书](happyAnyway-app/ARCHITECTURE.md) |
| happyAnyway-admin/ | Vue 3 + TypeScript + Vite + Element Plus + Vue Router + Pinia + Axios 管理前端 | [管理后台路书](happyAnyway-admin/ARCHITECTURE.md) |
| happyAnyway-admin-api/ | Java 21 + Spring Boot + MyBatis 管理后端，独立部署 | [管理后端路书](happyAnyway-admin-api/ARCHITECTURE.md) |
| happyAnyway-wechat/ | 停用的小程序源码 | [小程序路书](happyAnyway-wechat/ARCHITECTURE.md) |
| tests/ | 独立测试岗位及规则 | [测试路书](tests/ARCHITECTURE.md) |

客户端通过 HTTP API 调用后端，不直接访问数据库。具体分层、配置和文件用途在所属工程路书维护。开发文档位于各工程 docs/development/。

用户后端与管理后端独立部署，共用同一个 MySQL 数据库，分别使用独立账号，按表及操作类型授予所需权限。具体业务表归属与迁移约定见相关工程资料；待确认事项见 [项目总览](PROJECT.md)。

## 管理资料

- [项目总览](PROJECT.md)：人类可读的当前状态。
- [当前任务记录](docs/plans/当前任务记录.md)：唯一可复用的任务执行、审查、测试与整改过程文件。
- [岗位配置](AGENTS.md)及[岗位登记](docs/agent-roster.md)：职责、流程及有效岗位与工作区绑定。
- [路书维护规则](docs/rules/project-roadmap.md)及[记录规则](docs/rules/task-records.md)：目录、文件用途及任务资料维护要求。

## 当前目录结构

以下为主工作区实际文件；子工程仅列入口，依赖及构建缓存不列入。每次文件增删或移动同步更新所属路书。

```text
harness/
├── .gitignore  # 排除依赖、构建产物及敏感文件
├── AGENTS.md  # 规定项目经理职责和协作流程
├── ARCHITECTURE.md  # 本项目路书、目录树及文件用途
├── docs/
│   ├── agent-init.md  # 持久化岗位初始化及复用流程
│   ├── agent-roster.md  # 有效持久化岗位及工作区绑定，不引用已清理目录
│   ├── plans/
│   │   └── 当前任务记录.md  # 任务执行、审查、测试与整改的统一过程记录
│   └── rules/
│       ├── acceptance-and-merge.md  # 用户验收及合并操作规则
│       ├── code-review.md  # 独立审查、问题分级与复审规则
│       ├── harness-archive.md  # 任务完成后提纯及清理过程记录
│       ├── isolated-workspace.md  # 隔离分支、工作区及基线检查规则
│       ├── persistent-agent-development.md  # 开发派工、执行、自检和交付规则
│       ├── project-roadmap.md  # 路书目录树及文件用途维护要求
│       ├── requirements-design.md  # 需求澄清、方案设计与确认规则
│       ├── task-planning.md  # 任务范围、分工和验收条件编写规则
│       ├── task-records.md  # 任务目录、循环记录及开发文档保存规则
│       └── test-handoff.md  # 独立测试交接和问题回流规则
├── happyAnyway-admin/
├── happyAnyway-admin-api/
├── happyAnyway-api/
├── happyAnyway-app/
├── happyAnyway-clean.code-workspace  # 编辑器多工程工作区配置
├── happyAnyway-wechat/
├── PROJECT.md  # 展示当前进度、阻塞和待办
├── README.md  # 仓库说明及总览、路书入口
└── tests/
```
