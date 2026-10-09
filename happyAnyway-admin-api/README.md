# 管理后端

独立管理 API 工程，采用 Java 21 + Spring Boot + MyBatis，与用户后端分别开发和部署。当前仅建立架构及岗位资料，没有 pom.xml、源码、接口或数据库配置。

开发规范与用户后端一致，详见[开发规则](docs/rules/development.md)。现有用户后端使用 Maven、Spring Boot 3.5.16，管理后端生成工程时以其实际依赖基线核对版本；本次不添加依赖。

其余后端技术方案统一沿用用户后端：Maven、Spring Security、MyBatis、MySQL、Flyway、OpenAPI/springdoc、Actuator，以及现有 Spring Boot 测试体系。依赖版本与配置方式以用户后端实际 pom.xml 和规范为基线，不再逐项重复确认。这里确认的是技术及规范一致，不复制用户业务接口、数据库权限或部署凭据。

管理平台业务模块尚未确认，两个后端共用同一个 MySQL 数据库，分别使用独立运行账号，按各自需要授予表级操作权限；不预设共享核心模块、用户数据查询或服务间调用。管理平台不直接修改用户数据；认证与网络配置在实施前确认。

- [路书与文件用途](ARCHITECTURE.md)
- [开发岗位](agent.md)
- [功能开发文档](docs/development/README.md)
