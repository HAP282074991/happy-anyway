# happyAnyway-clean

**日常进度与待办请先看[项目总览](PROJECT.md)。** 工程结构看[路书](ARCHITECTURE.md)，详细证据按需从任务记录进入。

一个 Spring Boot 后端 + React Native / Expo App 项目。App 首期同时面向 Android 和 iOS，交付独立安装和后端连接检查；当前实施状态见[执行记录](docs/plans/当前任务记录.md)。

## 工程入口

- [管理后端](happyAnyway-admin-api/README.md)：Java 21 + Spring Boot，开发规范与用户后端一致，当前仅有文档骨架。

- [管理后台](happyAnyway-admin/README.md)：独立 Web 管理端，已建立岗位和架构资料，尚未开发功能。

- [项目结构路书](ARCHITECTURE.md)：工程关系、修改入口、状态边界和各工程路书；按[维护规则](docs/rules/project-roadmap.md)持续更新。

- [后端说明](happyAnyway-api/README.md)：技术栈、启动、数据库配置和测试。
- [App 架构](happyAnyway-app/ARCHITECTURE.md)：已确认的 App 技术栈及分层；运行和构建说明由 App 开发交付。
- [微信小程序说明](happyAnyway-wechat/README.md)：历史示例，已停用，源码暂保留。

各工程的运行命令在对应目录执行。

## 目录结构

查看[路书中的当前目录树](ARCHITECTURE.md#当前目录结构)。每次文件或目录增删、移动、重命名时同步更新该目录树，本页不再保留重复副本。
