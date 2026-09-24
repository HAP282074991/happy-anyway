# B2 UI 错误 Accept 整改独立审查 R1

2026-09-23，审查者 `/root/b2_ui_review`。接替不可用的原 `/root/b2a_review`，已阅读原 B2-A R1/R2/R3、代码审查规则、微信公开浏览计划（含 9/17 整改）、W1B2 测试交接、工程岗位/架构/开发规则及本轮诊断、交付材料。

**总体：代码审查通过，1 项 Minor 文档证据索引问题；未发现本轮新增 Critical 或 Important。** 可由经理交原独立测试岗位验证新 JAR；不等于活服务已升级、微信预览已修复或用户验收通过。

## 准确版本及独立核验

源码目录 `C:\Users\Administrator\.codex\worktrees\eadd\happyAnyway-clean\happyAnyway-api`，实际 HEAD `26cb951a7632bf0c35b876ea902fd8eef6c86122`，未提交成果。

- 新快照 `docs/reports/b2-ui-fix-snapshot.json` SHA256：`2BA95E17D04F19C8E1758443D654DA9357AFA9B3E6597A6543AC4296B03B8EDE`。独立重算 **116 files + 11 artifacts 全部匹配**；另枚举 src，未发现遗漏源文件。
- 新 JAR SHA256：`951D60DE966CCBAB216D22FCDAD14EC3C38E01EC1B117AC50953D817E370F679`。
- 对照旧 `b2-a-snapshot.json`（`E17D8645FFB5B3647E8652A90728FEEC5BB77AB42720978DE668B12C71EAE8CD`）：既有文件仅 `PublicContentExceptionHandler.java`、`PublicContentMysqlIT.java` 哈希变化，无删除。新增测试 `PublicMediaErrorHttpTest.java`、本轮报告/诊断及旧快照索引；另有六份既有历史报告本次首次列入快照，不能把“新入清单”等同于新增实现。
- 独立在内存逐项比较旧归档 JAR（SHA256 `6C7513FD333F049D80FF6996CCD84D3AC9FBB269B5703908C9B250B62BEF4322`）与新 JAR 的 `BOOT-INF/classes`：唯一变化是 `PublicContentExceptionHandler.class`。源清单中的安全链、迁移 V1/V2、冻结契约、依赖配置、启动脚本及媒体资源实现均与旧快照相同。

本次只读源代码、Git、归档 JAR 和已有证据，未构建、运行测试、启动服务、连接数据库或读取凭据；仅写本报告。下面测试计数是独立读取开发执行证据，不冒称审查者重新运行。

## 规格符合性与实现

生产变更在 `src/main/java/com/example/happyanyway/controller/publiccontent/PublicContentExceptionHandler.java:26`：统一错误 ResponseEntity 显式设置 `application/json`。状态、no-store、四字段 ApiError、服务器 requestId 与固定安全消息保持。Advice 限定 PublicContentController，预期错误、数据库异常和意外异常共用该响应方法；未增加权限或公开路径，管理员链和普通 `/error` 默认拒绝保持。

这一修复直接针对图片 Accept 与错误 JSON 协商失败，而非将错误改成成功图片。已核对控制器在媒体取得前抛出业务错误，以及 PrivateMediaServiceImpl 两许可即时拒绝路径。没有改变忙碌门槛、BLOB 准入、worker 或响应租约；原 B2-A 已关闭事项不因本轮重开。

**规格符合性：符合本轮错误 Accept 整改范围。代码质量：变更小且集中、异常与权限边界保持，未发现阻塞问题。**

## 验证充分性

完整阅读新 `PublicMediaErrorHttpTest`：随机回环端口真实 Tomcat、HttpClient TCP、生产 SecurityConfiguration/Controller/Advice/RequestIdFilter。三种 Accept（`*/*`、`image/*`、`image/jpeg,image/png`）分别覆盖404、实际准入繁忙503、正常PNG、管理员401安全JSON和普通 `/error` 拒绝。错误断言包含状态、JSON媒体类型、no-store、固定错误码、requestId 与响应头一致、字段数组及四字段数量；正常图逐字节匹配。

503测试实际持有 PrivateMediaServiceImpl 的两个租约再发送第三个 TCP 请求，无时间竞争；finally释放后再次读取成功。查询/解码/管理员服务为明确替身，不把它算作真实数据库并发或真实 worker 压测。MySQL IT 的现有真实 TCP 用例增加三种 Accept 的成功 PNG 和下架后404，使用真实 SQL 与 worker；归属初始化和清理辅助哈希未变，仍保留原先失败生命周期保护。

已核对证据：

- before.xml：9项中4失败，恰为两种 image-only Accept 的404/503被401替代；其余5项通过。
- after.xml 与 9/23 current-http.xml：各9项，0失败/错误/跳过。
- 9/23 verify.log：72项，40执行通过、32跳过，BUILD SUCCESS；其中17项管理员CSRF/HTTP/安全日志回归通过，未冒称10项管理员真实库已执行。
- 已入快照的 `target/b2-ui-fix-current-mysql-output.log`：9/23 10:04:16，21项0失败/错误/跳过，BUILD SUCCESS及脚本成功摘要。实际 `target/b2a-mysql-Test.log` 和 `target/surefire-reports/TEST-com.example.happyanyway.publiccontent.PublicContentMysqlIT.xml`亦为21项通过；后两者未列入本轮快照，属于辅助核对，不能以它们替代已固定证据。

现有源代码、失败/修复后容器实证及SQL/worker补充覆盖足够支持本轮交独立测试。仍应由独立测试针对准确打包 JAR 做错误 Accept 实际复测，而非仅复述这些自检。

## M1 — Minor：报告引用两个不存在的最新 MySQL 证据路径

位置：`docs/reports/b2-ui-fix.md`“先失败、后修复与最终验证”最后一项。报告列出 `target/b2-ui-fix-current-mysql.log`、`current-mysql.xml`，当前均不存在；实际已入快照的是 `b2-ui-fix-current-mysql-output.log`，脚本原输出/XML位于上一节所列路径。

影响是交接索引失真，不是21项测试没有执行：固定输出日志包含实际日期、计数和成功结果，9/17完整XML亦保留。建议原后端修正报告至真实路径，或复制最新XML到专用证据路径并更新快照；仅文档/证据修正可定向核验，无需重跑业务测试。该项应在后续交接中显式登记，不静默丢弃。

## 保留边界

本轮未实测新 JAR 部署、微信实际请求头对应关系、预览黑屏事件序列、返回/分页/窄屏、正式 AppID/HTTPS合法域名或真机。原生预览问题不能由后端错误类型修复自动关闭。

已提交响应后的 socket 写故障、容器映射前错误、其他非公开路径的容器ERROR派发不在此次 Advice 修复的覆盖范围，不宣称所有错误都已统一JSON。头像与数据库/意外异常共用此Advice，但本轮新增TCP矩阵主要为帖子图片404/503，没有独立头像错误矩阵。原资源容量、并发撤权、生产RSS等既有未验证项仍保留。测试不应在已有UI夹具的Independent库直接运行要求空库的旧IT入口；服务/数据操作需遵守经理另行测试交接。
