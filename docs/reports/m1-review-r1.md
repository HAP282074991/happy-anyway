# M1 独立审查 R1

日期：2026-09-16。审查者：项目经理创建的独立审查子 Agent `/root/m1_review`。

**结论：代码审查通过，可交独立测试；Critical 0、Important 0、Minor 0。此结论不是最终脚本已完整运行、数据库当前状态已重新核验或用户验收通过。**

## 范围与版本

已读取源目录的 code-review.md、管理会话与迁移验证计划（含双目标补充）、后端岗位配置/架构/开发规则，以及交付目录 README、M0/M1 报告。完整读取 M1 的 Java 测试、四个 SQL 和最终 PowerShell 脚本；读取实际 Maven 日志、最终状态证据、真实测试 XML 的测试计数，并独立计算哈希。

交付目录：`C:\Users\Administrator\.codex\worktrees\eadd\happyAnyway-clean\happyAnyway-api`。
BASE=HEAD=`26cb951a7632bf0c35b876ea902fd8eef6c86122`。Git-dir 为 `D:/AIProject/happyAnyway-clean/.git/worktrees/happyAnyway-clean1`，common-dir 为根仓 `.git`。本次是未提交新增文件快照，不能用 HEAD 代替成果标识。Git 状态与报告相符，已有 README/DB1/C1 等改动不纳入 M1 变更评价。

审查过程只读源码、Git 与既有证据；没有构建、连接数据库、运行脚本、读取任何 `.env` 文件或修改实现。本报告是唯一写入物。

## 规格符合性

通过，范围与计划一致。

- `MySqlMigrationCompatibilityTest.java` 仅在 migrationProbe=true 时启用。Java 与脚本分别限制 Development/Independent，固定 localhost 数字地址、端口、库名/用户名和连接参数；未知目标没有回退。Java 连接前验证完整 URL/用户名，连接后验证 DATABASE/CURRENT_USER/版本。已有产物、表/视图、routine 或 event 使测试停止；不会复用非空库。
- SHOW GRANTS 严格要求两条精确字符串：USAGE 与转义下划线的单库 ALL PRIVILEGES，不接受额外全局权限、角色或 GRANT OPTION。元数据证据与专用库一致。独立目标没有被本次开发运行证据冒充已验证。
- 四个 SQL 仅位于测试资源。V1/V2 覆盖 InnoDB、utf8mb4、父子外键、增量索引、合成行；Java 实际检查中文/四字节字符、DECIMAL、DATETIME(6)、孤儿插入错误1452、迁移执行数及重连历史一致性。新 Flyway 实例重跑为0条。
- 校验和篡改仅在 target 副本中发生；识别 CHECKSUM_MISMATCH 后 finally 恢复原字节并再次 validate，没有以 repair 消除该差异。
- 故障 V3 后必须先确认部分表为空、失败历史恰一条、原成功历史不变、validate 失败且重跑受阻，才 DROP 精确 m0_probe_partial，使用同一 Flyway/locations repair 一次。随后核验成功历史不变并替换 V3 修正副本，最终迁移1条、validate通过、历史3条。未出现扩大清理或 finally 自动数据库恢复。顺序符合当前 M1 计划的明确要求。
- cleanDisabled=true、baselineOnMigrate=false、createSchemas=false；不修改 POM 或正式业务迁移。修正后的脚本未完整重跑的限制在报告中明确，没有夸大为完成验收。

## 代码质量、安全与证据

通过，未发现需整改的具体缺陷。

- 测试采用单个有顺序的隔离探测链，任一关键断言失败停止后续恢复；JDBC Statement/ResultSet/Connection 由 try-with-resources 释放。异常不会被吞掉。历史比较涵盖成功版本校验和和顺序。
- 脚本检查凭据 ACL 禁止继承/其他身份 Allow；Import-Clixml 后验证 PSCredential 类型和准确用户名。凭据只进入新建 ProcessStartInfo 的子环境，不进入参数、日志或父环境赋值。已去除继承的相关 Spring/DB/Migration/Maven/JVM 注入变量；直接 ArgumentList 启动 Java Maven launcher，不拼接 cmd 命令。
- 双流异步逐行排空，GetResult 观察读取异常，输出替换本次密码。finally 仅处置本次 Process，并在存活时 Kill(true)；清理日志写入器、ProcessStartInfo 密码和 SecureString。静态路径合理，运行时中断行为仍需测试验证。
- 最终脚本收集标准 surefire-reports 的精确 XML，要求时间不早于本次启动及 tests=1/skipped=failures=errors=0，才归档到目标专属目录。修正解决了旧脚本读取错误输出目录的问题；不存在将默认跳过误报为真实通过的逻辑。
- 已读取的开发日志显示真实探测1项通过、完整预期阶段、一次 repair，以及持续存在的 Flyway 8.4/8.1告警；XML计数一致。状态文件记录4表、3成功历史和各合成表1行。回归日志为 BUILD SUCCESS。证据哈希均与交付报告一致。

## 独立测试必须保留的边界

1. 最终修正版脚本仅有语法/报告收集自检陈述，已存真实日志证明的是 Java 探测通过，不证明最终脚本端到端退出0。请在经理授权的全新 Independent 空库/账号上执行最终同版脚本，核验退出码、归档 XML、日志、真实数据和授予权限；不得清空 Development 现场。
2. 核验父环境不变、异常/中断后本次 Maven 及其子进程清理。审查未实际运行 Ctrl+C，也不把 finally 的静态存在当作实测证据。
3. 复测前后核对本报告文件哈希。数据库创建/ACL设置的实际结果由开发报告与后续测试各自负责；本审查未读取密文或重新执行授权查询。
4. Flyway 对 MySQL8.4高于已测8.1的告警仍保留。通过范围仅是此本地组合和合成 SQL；正式业务迁移、并发部署和厂商认证不在结论内。

这些是已明确划给独立测试的验收事项，不是已发现的代码缺陷；完成前不得将 M1 标记为独立测试通过。

## 精确 SHA256 快照

以下均相对交付目录，独立计算。

| 文件 | SHA256 |
| --- | --- |
| src/test/java/com/example/happyanyway/migration/MySqlMigrationCompatibilityTest.java | 36DEA7B16D2F3C9DB47C45C14221A2BCBA66899EC840E4EAFE18BABC893D5162 |
| src/test/resources/db/migration-compat/V1__probe_schema.sql | D8DBA1E93D92D267911332207781B31120BCFF2907388EEA5F2B546EE605173D |
| src/test/resources/db/migration-compat/V2__probe_index.sql | 0CD14FCB7DAA37EEBF270A4FCF44922B21FD63780C275681056667DBB1CC06FA |
| src/test/resources/db/migration-compat/fixtures/V3__probe_failure.sql | 86321D425FCB3566591ABD699CFEB5B0D1EC8C28BBF0BD043B0A6A7353F75147 |
| src/test/resources/db/migration-compat/fixtures/V3__probe_recovered.sql | A47E2F8A6B8E9276D2D4E3D0F1EFCF5F2462ED1E5153B455AD16C12C3C3ED044 |
| scripts/test-mysql-migration.ps1 | 731FA5772E8B5838ECCD0A98C8810908917C57DA6AE966E9FB398E61B29002C5 |
| docs/reports/mysql-migration-probe.md | 9EF7325412845E5BEA799397F4AAB8CB609F0542D7F7FD6D04ED940C538501D0 |
| pom.xml（未改） | 87DBADA9C2AD484A1274C2CAE3AD0AD100CB1571C24E385BB6E39904A288C30B |
| target/m1-surefire-Development/TEST-com.example.happyanyway.migration.MySqlMigrationCompatibilityTest.xml | B2D7C93A15044C92E3F05C12224661F112CAE101216D6EC4E35306BBC6931066 |
| target/m1-Development.log | FFF3CC5BCA5A3A0DEB0046E68C717A1A2DF1343471D92CE375806D243F452D96 |
| target/m1-final-state.txt | 4E21772524FCDD65C1EE79881B7C1DCFD235DDE884FE39092DC31D6117D0CF45 |

未对任何凭据文件读取内容或计算哈希。
