# happyAnyway 后端架构

## 系统边界
Spring Boot 模块化单体为独立的微信、App 和网页客户端提供统一 API，MySQL 为主数据库。当前不引入微服务、Redis 或消息队列；不共享前端实现。
本文规定目录职责和依赖方向，实现方式见[开发规则](docs/rules/development.md)。旧项目的接口与数据库专项规则本次未迁移，接口和数据细节以本项目已确认方案为准。

## 目录与职责
以层级为主，每层内部按业务模块分目录，同一模块名称保持一致；业务未明确时不预建示例模块。

```text
com.example.happyanyway/
├── Application.java
├── controller/<模块>/   # 请求边界、参数校验、响应 DTO
├── service/<模块>/      # XxxService 业务接口
│   └── impl/            # XxxServiceImpl，业务实现与事务
├── mapper/<模块>/       # MyBatis 数据访问接口
├── entity/<模块>/       # 数据库存储模型
├── dto/<模块>/          # 接口输入输出模型
├── config/              # 基础配置与组装
├── security/            # 认证授权基础设施
└── common/              # 少量通用能力
resources/mapper/<模块>/ # MyBatis SQL XML
resources/db/migration/  # Flyway SQL
```

请求调用方向：Controller → Service → Mapper → MySQL。Entity、DTO 是模型，不是处理层。数据访问层统一叫 mapper，不创建 dao/persistence，也不恢复模块优先的旧目录结构。

业务 Service 统一采用接口加实现类，调用方依赖接口而不是 impl；命名、注入与实现要求见 [开发规则](docs/rules/development.md)。

## ARCH-01 层级边界
| 来源 | 主要职责内依赖 | 禁止依赖 |
|---|---|---|
| controller | service、dto、必要的通用能力 | mapper、entity |
| service | mapper、entity、dto、其他明确的 Service | controller |
| mapper | entity、必要查询参数、MyBatis 基础能力 | service、controller、dto |
| entity / dto | 数据类型、必要校验或映射注解 | controller、service、mapper、security、config |
| security | 认证 Service、通用认证能力 | mapper |
| common | JDK、明确的第三方基础能力 | 上述业务层、security、config |
| config | 框架配置与必要组件组装 | 不承载业务流程，不成为绕过 Service 的入口 |

表内“主要职责内依赖”不是允许任意调用的通行证。框架组装与业务执行区分，所有依赖仍需无环。
Entity 与 DTO 不相互嵌套暴露存储模型；两者转换在 Service 或明确的映射辅助代码中完成，此条目前人工审查。

## ARCH-02 模块边界
- 同一业务在 controller/service/mapper/entity/dto 下使用同一模块名。
- 跨模块通过对方明确的 Service 能力协作，不直接访问对方 Mapper 或数据库表。
- 跨模块读取/更新尽量暴露有意义的用例，不以“通用执行任意 SQL”绕过边界。
- 不使用 common、反射或静态入口变相穿透模块。
- 禁止顶层包及业务模块循环依赖。跨模块事务需求出现时记录协调方式，不提前构建通用分布式框架。

## 执行状态

本次迁移目录与依赖规范，未迁移旧项目的 ArchUnit 架构测试或自动检查器。当前通过开发自检和独立审查核对这些约束，不沿用旧项目的测试数量或通过结论。目录按实际功能需要创建，不因结构示意预建业务模块。
