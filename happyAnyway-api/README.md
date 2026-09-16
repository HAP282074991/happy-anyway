# happyAnyway API

## 技术栈

Java 21、Spring Boot 3.5.16、Maven、Spring Security、MyBatis 3.0.5、MySQL、Flyway、OpenAPI（springdoc 2.8.17）。

## 启动后端

在本目录（happyAnyway-api）打开 PowerShell：

~~~powershell
mvn spring-boot:run
~~~

默认使用 local 模式，无需数据库，只监听本机 127.0.0.1:8080。

- 健康检查：http://127.0.0.1:8080/actuator/health
- Swagger：http://127.0.0.1:8080/swagger-ui/index.html
- 基础测试与打包：mvn verify

目前只开放健康检查及 local 模式下的 API 文档，没有登录和业务接口。添加接口时同步调整 SecurityConfiguration.java。

### 需要 MySQL 时

先创建自己的 MySQL 数据库，再在新的 PowerShell 会话设置环境变量并启动：

~~~powershell
$env:SPRING_PROFILES_ACTIVE = 'mysql'
$env:DB_URL = 'jdbc:mysql://localhost:3306/happyanyway_dev?connectionTimeZone=UTC'
$env:DB_USERNAME = '你的数据库用户名'
$env:DB_PASSWORD = '你的数据库密码'
mvn spring-boot:run
~~~

mysql 模式默认也只监听本机。数据库迁移 SQL 放在 src/main/resources/db/migration/，例如 V1__initial.sql；MyBatis XML 放在 src/main/resources/mapper/。local 与 mysql 不同时启用。当前未附带业务表和生产部署配置。

## 迁移入口

Java 代码位于 src/main/java/com/example/happyanyway/；运行配置位于 src/main/resources/；基础测试位于 src/test/java/。逐步将需要的接口和数据库变更迁入即可。

## 工程规则

- [开发 Agent 配置](agent.md)

- [项目结构与职责边界](ARCHITECTURE.md)
- [开发规则](docs/rules/development.md)
