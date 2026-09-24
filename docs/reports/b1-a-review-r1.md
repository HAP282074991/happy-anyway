# B1-A 独立代码审查 R1

日期：2026-09-16。审查者：独立审查子 Agent b1a_review。结论：**通过，附 1 项 Minor；未发现 Critical / Important，允许进入独立测试。** 本结论不替代浏览器联调、用户验收或合并授权。

## 版本与实际工作

- 需求：`docs/plans/2026-09-16-B1A管理员会话.md`，并读代码审查规则、后端架构及开发规则。
- 被审目录：`C:/Users/Administrator/.codex/worktrees/eadd/happyAnyway-clean/happyAnyway-api`。
- BASE=HEAD=`26cb951a7632bf0c35b876ea902fd8eef6c86122`，真实交付为未提交修改和新增文件；已检查 Git status，未把空提交差异视为完整变更。
- 完整 60 文件快照 `docs/reports/b1-a-snapshot.json`，SHA256=`0D85AA90EC40DB12F609D5AD984D5D75C9DCFA9024D4E850F4F4A3D35A4BE336`。逐项核验全部 60 文件及 6 项证据，哈希不匹配数 0。
- 契约 `docs/contracts/phase1.md` SHA256=`AD4C93F5A5B6008044E939D24BE24D33D0511C90C6DCCADF883D9B3B5FA91070`。只按冻结四端点及适用公共约束审查。
- 实际读取全部主源码/资源、三份 B1-A 脚本、三个管理员测试类、POM、架构/README、开发报告，以及脱敏构建、MySQL XML、HTTPS、重启、最终数据库状态证据。未运行构建、服务或数据库操作；未读取 DPAPI 密文或 PKCS12；未修改源代码/Git，仅写本报告。

## 规格符合性

通过。四端点返回与会话模型、Cookie 属性、固定 900/28800 秒期限、不续期、登录轮换、退出撤销、当前权限恢复、匿名 DELETE 的 401 优先级、Origin/Referer 校验和不信任 forwarded 头，均有对应实现。安全过滤器与 MVC 使用同一错误模型及 requestId/no-store。JSON 结构和字节上限在入口校验，密码不 trim 并按码点限制。

会话创建将同步 CSRF token 与会话同行写入，不存在框架独立首次 token 保存竞争；Spring XOR 表示负责传输掩码。Service 重新验证写操作会话/CSRF，避免仅信任过滤器阶段结果。事务取得数据库协调行锁后读取状态和限流事件，协议拒绝提交失败次数，数据库异常回滚；窗口排除边界和 Retry-After 向上取整正确。账号版本不匹配只撤销旧会话，不误撤销新版本会话；停用/凭据重置需遵守 README 的治理事务约束，该治理接口不在本轮。

离线创建不在 HTTP 模式启用，重复用户名拒绝，无默认密码/公开注册。PBKDF2 编码器有真实 256 码点密码完整往返及尾部变化断言。Test/Independent 固定库与身份、表集检查和显式开关清晰，Development 不进入测试清理。三个脚本只注入子进程环境、清理自有进程；HTTPS 与静态页面映射仅显式本机 profile 启用。私钥/密文的创建保护可从脚本确认，当前 ACL 的独立运行核验仍由测试岗位执行。

## 代码质量及问题

整体通过，分层、事务职责和边界保护可跟踪；保留以下非阻塞改进，不视为已豁免或已解决。

### B1A-R1-M1（Minor）：数据库失败完全缺少关联诊断，其他系统异常缺少安全堆栈

位置（均相对被审目录）：
- `src/main/java/com/example/happyanyway/security/AdminSessionAuthenticationFilter.java:32`，以及 35–36 行。
- `src/main/java/com/example/happyanyway/controller/adminauth/AdminAuthExceptionHandler.java:17`，以及 22–23 行。

`DataAccessException` 被转成 503 后不记录任何日志；其他系统异常仅记 requestId 和简单异常类名，原因链及代码位置丢失。数据库断连、SQL 错误或连接池耗尽会对用户正确拒绝，但无法用响应 requestId 定位后端故障。依据 DEV-04 的外部调用失败、异常边界日志及保留原因要求。现有安全错误响应测试只检查响应不泄露，没有验证诊断日志。

建议原岗位补充统一、受控的系统错误日志：记录操作、requestId、异常类别、经过脱敏的原因类别/代码帧，不直接输出可能含 SQL 参数和密码的原始 exception message；保证同一次异常只记一次。用含合成敏感值的故障测试验证日志具有定位信息且不含秘密。因错误响应与拒绝行为正确，此项不阻塞本轮独立功能测试，但应在整体交付审查前明确处理。

## 验证证据与后续限制

开发证据核验结果：默认 Maven 27 项中实际通过 16、跳过 11、失败/错误 0；显式真实 MySQL XML 为 10 项实际通过、跳过/失败/错误 0。已阅读对应测试逻辑，覆盖期限、四权限组合、并发单赢家、并发限流、窗口边界、撤销、新旧版本、密码和持久恢复。HTTPS/实际 JVM 重启日志与开发报告对应，但本审查不宣称独立重跑。

真实浏览器 Cookie 接收、页面登录/恢复/退出、多标签以及 Ctrl+C/环境保留仍须固定测试岗位验证；MockMvc 手工组装过滤器不能独自证明完整生产 SecurityFilterChain，真实 HTTPS 客户端证据只补足基本主流程。独立测试应特别覆盖实际运行链的负向 Origin/CSRF/未登录/未知参数和非管理员 API 默认拒绝。

Flyway 日志仍提示 MySQL 8.4 高于其测试阈值 8.1；V1 的迁移/重复校验实测通过不等于厂商认证。协调行串行化与 10000 条保护上限仅用于当前本机小规模阶段，生产吞吐和历史保留未验证。未把范围外的审核/普通用户功能缺失计为缺陷。
