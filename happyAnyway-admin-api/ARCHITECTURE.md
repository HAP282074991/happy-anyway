# 管理后端路书

维护岗位：管理后端开发 Agent。技术栈：Java 21 + Spring Boot + MyBatis。当前仅有文档骨架，业务模块及表归属未确定。两个后端共用同一个 MySQL 数据库，分别使用独立运行账号，按表及操作类型授予所需权限。

## 边界与结构规则

技术及工程规范整体沿用用户后端，以 happyAnyway-api/pom.xml 和开发规则为依据，包括 Maven、Spring Security、MyBatis、MySQL、Flyway、OpenAPI/springdoc、Actuator 和测试体系。Java 与依赖版本沿用其实际基线，后续升级统一评估两个后端的影响；本工程仍为文档骨架，不代表上述组件已安装。

共库使用 Flyway 管理结构变更，但不复制用户后端迁移脚本到管理后端重复执行。同一数据库的迁移版本与执行入口必须统一协调，业务表出现前不预建迁移脚本；具体执行入口在建立工程时安排，不因沿用工具获得额外数据库权限。

为 happyAnyway-admin 管理网页提供独立 API；与 happyAnyway-api 用户后端独立部署，不预建共享业务模块，不直接修改用户数据。管理接口不因此自动获得任何数据权限，具体认证、授权、数据库及网络策略按确认需求实施。

采用与[用户后端](../happyAnyway-api/ARCHITECTURE.md)相同的层级规则：Controller → Service → Mapper；按业务需要创建 controller、service/impl、mapper、entity、dto、config、security 和 common，同一业务各层模块名一致。业务 Service 采用接口与实现类，调用方依赖接口。禁止越层、跨模块直接访问 Mapper 和循环依赖；ARCH-01、ARCH-02 约束同样适用。上述为规范，尚未创建这些源码目录。

## 当前目录结构

```text
happyAnyway-admin-api/
├── README.md                 # 技术栈、工程状态及使用入口
├── agent.md                  # 管理后端岗位职责和路书维护要求
├── ARCHITECTURE.md            # 服务边界、分层规则和实际文件用途
└── docs/
    ├── development/
    │   └── README.md         # 按管理功能维护开发文档的索引
    └── rules/
        └── development.md   # 用户后端统一开发规范的引用与适用说明
```

结构维护遵循[路书维护规则](../docs/rules/project-roadmap.md)。运行及验证命令由开发建立实际工程后写入 README，目前不宣称 Maven 或接口验证通过。
