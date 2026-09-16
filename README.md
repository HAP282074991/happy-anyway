# happyAnyway-clean

一个后端 + 微信小程序项目，方便逐步迁移功能。

## 工程入口

- [后端说明](happyAnyway-api/README.md)：技术栈、启动、数据库配置和测试。
- [微信小程序说明](happyAnyway-wechat/README.md)：安装、编译、开发者工具和后端连接。

各工程的运行命令在对应目录执行。

## 目录结构

以下为当前主要目录和文件，省略依赖目录及编译产物。

```text
happyAnyway-clean/
├── README.md                         # 项目说明与工程入口
├── AGENTS.md                         # 项目经理配置与八步工作流程
├── happyAnyway-clean.code-workspace  # 编辑器工作区配置
├── docs/
│   ├── agent-init.md                 # 持久化 Agent 初始化与创建流程
│   └── rules/                        # 项目经理各阶段协作规则
├── happyAnyway-api/                  # Java / Spring Boot 后端工程
│   ├── README.md                     # 后端运行、配置与测试说明
│   ├── agent.md                      # 后端 Agent 岗位配置
│   ├── ARCHITECTURE.md                # 后端项目结构规则
│   ├── docs/rules/development.md      # 后端开发规则
│   ├── pom.xml                       # Maven 依赖与构建配置
│   └── src/
│       ├── main/java/                # 后端源码
│       ├── main/resources/           # 应用配置与资源
│       └── test/java/                # 后端自动化测试
├── happyAnyway-wechat/               # TypeScript 微信小程序工程
│   ├── README.md                     # 小程序安装、编译与运行说明
│   ├── agent.md                      # 微信前端 Agent 岗位配置
│   ├── ARCHITECTURE.md                # 前端项目结构规则
│   ├── docs/rules/development.md      # 前端开发规则
│   ├── package.json                  # 依赖与开发命令
│   ├── project.config.json           # 微信开发者工具配置
│   ├── tsconfig.json                 # TypeScript 编译配置
│   ├── eslint.config.mjs             # 代码检查配置
│   └── miniprogram/                  # 小程序源码与资源
│       └── pages/                    # 小程序页面
└── tests/                            # 独立测试岗位资料
    ├── agent.md                      # 独立测试 Agent 岗位配置
    └── rules.md                      # 独立测试与问题定位规则
```
