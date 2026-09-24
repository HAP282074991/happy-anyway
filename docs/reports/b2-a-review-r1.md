# B2-A 独立审查 R1

日期：2026-09-16。审查者：项目经理创建的独立审查 Agent `/root/b2a_review`。结论：**需整改，暂不放行 B2-A 独立测试及联调启动入口**。发现 4 项 Important、2 项 Minor；未发现已证实的 Critical。没有把开发自检或微信未完成部分判为验收通过。

## 版本与权限

实际审查目录：`C:\Users\Administrator\.codex\worktrees\eadd\happyAnyway-clean\happyAnyway-api`。BASE=HEAD=`26cb951a7632bf0c35b876ea902fd8eef6c86122`，detached HEAD，成果未提交，包含已有 B1；本报告不把工作树当作新提交。

独立逐项计算了 `docs/reports/b2-a-snapshot.json` 的 **97 个 files 和 8 个 artifacts**：全部存在且 SHA256 一致。完整逐文件版本清单引用该已核验快照，不能用后续同名文件替换本轮版本。

| 对象 | 核验 SHA256 |
|---|---|
| B2-A 快照自身 | `AABCB79F326FB2FC1BEAD831ECE90B61B41938AF5E886C149B77C6453B855142` |
| 最终 JAR | `56A137C9C325FE024D418C016929E870988E76288C38E314A2C6FCCC0645DCD8` |
| 冻结 phase1.md | `AD4C93F5A5B6008044E939D24BE24D33D0511C90C6DCCADF883D9B3B5FA91070` |
| 原 B1-A 快照自身 | `BB6284EFEA36C776EFB67B5B21BAC8E480164C31074C0B97E6A9DC0B5271946F` |
| V1 | `715D9643BF81C41C4419E066EE433D0EAE03E8DBE8BF01C2783C8682C20075D9` |
| V2 | `03E1647C4B04887B67806A6675114235A23765C4B5A43DAAF75FBFCF45DE83FF` |

相对原 B1 文件快照，只有 README、SecurityConfiguration、SafeErrorLog 三个既有源文件变化，其余原列入文件哈希保持。已读这三处及相关上下文；SafeErrorLog 增加固定操作白名单值，管理员独立安全链仍在公开默认链之前。

本轮只读源码、Git 状态、已有报告及产物；未执行构建、服务、迁移、数据库写操作或凭据读取，没有读取 `.env` / 私钥，没有修改待审目录。唯一写入是本报告。报告中的复现方案是整改验证建议，未冒称已经运行。

## 审查依据与覆盖

已读根 `docs/rules/code-review.md`、权威 `docs/plans/2026-09-16-微信公开浏览.md`（含固定 Test/Independent 双目标补充）、`2026-09-16-W1B2测试交接.md`、设计 V1 公开读取要求；实际后端 ARCHITECTURE、开发规则、岗位说明、README、B2-A 报告及冻结契约公共模型/公开端点/分页/错误/头像与图片撤权条款。

独立读取全部新增 publiccontent Controller/Advice、DTO、Entity、Mapper、Service/实现、PublicCursorCodec、PublicContentConfiguration、两份 mapper XML、完整 V2、PublicContentMysqlIT 和测试夹具说明；另读完整安全链、请求ID和日志边界、数据库/profile配置、pom、新增两个 PowerShell 入口及其点源共用函数，并对照旧启动入口。没有只审 `git diff` 而遗漏未跟踪文件。

## 必须整改

### I1 — Important：测试清理没有限定测试自有记录

位置：`src/test/java/com/example/happyanyway/publiccontent/PublicContentMysqlIT.java:66–71`，尤其第 70 行。

每项测试无条件执行六张表的 `DELETE FROM <table>`，对分类也直接重置。前置仅确认库名和表集合；即使同一个获准测试库中存在另一轮联调或独立测试保留的非本夹具记录，仍会全部删除。表名正确不能证明每一行都由本测试拥有。`pc_snapshot` 的删除还会级联删除全部快照候选。

依据：B2-A 计划明确“仅删除测试自有合成记录”，未知资源不得接管；开发报告和夹具说明也声称只清合成内容。当前实现未建立这种行级所有权检查，描述强于代码。

整改：使用明确的夹具命名空间/所属集合和依赖顺序限定清理，或在任何写入前严格验证全部已有行均属于本测试、发现未知行立即停止；不能以库名是 public_test/public_verify 为唯一授权依据。增加非本夹具记录的保护用例，验证它保留或整个测试在首个写操作前失败。验证不应借用真实用户数据。

### I2 — Important：公开启动脚本没有锁定 Spring 配置来源和实际 JDBC 目标

位置：`scripts/start-public-content.ps1:25–30`；对照 `scripts/start-local-mysql.ps1` 的固定 classpath/直接 datasource 参数，以及 `scripts/start-admin-integration.ps1` 的 `--spring.config.location=classpath:/`。

启动前 mysql CLI 确实检查固定库，但实际 Java 仅以 `-jar` 启动，未限制 Spring 默认加载的工作目录/config 外部配置。传入的 `DB_URL/DB_USERNAME/DB_PASSWORD` 是 classpath YAML 使用的占位变量，并非直接设置 `spring.datasource.*`；一份外部 `application-mysql.yml` 若直接定义 datasource.url，可覆盖 classpath 中的占位表达式，使 Java 使用与 CLI 预检不同的 JDBC 目标，甚至把专用账号凭据提交给外部指定的 MySQL 主机。清除父进程环境不会阻止加载磁盘配置。

这不表示当前目录已经有恶意配置或本次已错连，而是“固定目标、沿用已审安全子进程模式”的边界存在可复现缺口。服务端口/关闭迁移使用直接 Spring 环境属性，不把这些误报为同一种覆盖漏洞。

整改：沿用现有脚本的固定 classpath 配置来源，并明确固定 datasource URL、用户名、profile及监听地址等非秘密参数；密码仍只经子进程环境注入。用获准隔离材料验证外部配置不能更改目标，不向未知主机发凭据；保持 Test/Independent 映射与无 Development 回退。

### I3 — Important：媒体资源控制未覆盖读取阶段，也没有解码时间预算

位置：`service/publiccontent/impl/PublicContentServiceImpl.java:78–79`；`PrivateMediaServiceImpl.java:16–30`；`resources/mapper/publiccontent/PublicContentMapper.xml:28–37`（以上路径均位于 `src/main` 对应 java/resources 下）。

`media.read(content.image(...))` / avatar 先查询并把整个 BLOB 物化为 `byte[]`，之后才检查 10MiB 和获取两路信号量。于是被判繁忙的请求仍能反复读取、分配大 BLOB；同时在传输响应的数组也已离开解码信号量范围。两路解码不是两路媒体读入/在途字节资源上限。数据库 MEDIUMBLOB 本身亦允许超过应用 10MiB 的值，超额内容同样在读入后才被拒绝。

此外 `reader.read(0)` 是同步完整解码，没有任何时间预算/超预算拒绝机制；两份慢解码可持续占住所有解码许可。现有测试只有 64×48 正常图、短截断、错误格式/尺寸，未验证字节/像素/并发/解码时间预算边界。没有据此声称已发生 OOM或无限解码，但冻结契约 3.2 的“有界解码内存/超时/并发”尚未完整落实。

整改：把有界准入和读取字节预算放到 BLOB 读取前，约束实际读取/在途资源，拒绝超额元数据或使用有界读取；对同步解码建立明确且可执行的时间/资源预算和失败回收，不以 Future 超时但后台无限继续解码冒充释放资源。补充预算边界、忙碌拒绝时不继续载入 BLOB、异常后许可恢复等验证。若拟依赖上游已规范化存储替代某项保证，须给出本包实际可执行的不变量和验证，不能只留给尚未实现的上传模块。

### I4 — Important：精确授权检查允许额外全局权限通过

位置：`src/test/java/com/example/happyanyway/publiccontent/PublicContentMysqlIT.java:58–60`。

当前断言仅要求 `SHOW GRANTS` 两行，并包含一条精确目标库 ALL PRIVILEGES。另一行没有核验为 `GRANT USAGE ON *.*`。如果专用账号同时有全局 SELECT/其他全局权限，返回仍可恰好两行且包含目标库那一行，测试会继续迁移和清理，却报告“精确授权”通过。

已有 `target/b2a-db-metadata.txt` 显示这次账号是 USAGE + 精确库授权，故本项是防护代码缺口，不指控此次账号已经越权。依据是计划要求无全局业务权限/GRANT OPTION、固定精确授权并在危险操作前核验。

整改：校验完整授权集合，明确第二行仅允许 USAGE 且无 GRANT OPTION/角色或其他权限；增加多余全局权限的拒绝向量，可以对纯授权解析逻辑输入合成文本测试，不必真的授予越权。数据库对象检查也建议覆盖触发器，避免只检查表名/例程/事件的盲区。

## Minor

### M1 — Minor：分类 Mapper 穿透 DTO 边界

位置：`src/main/java/com/example/happyanyway/mapper/publiccontent/PublicContentMapper.java:3,8`、`src/main/resources/mapper/publiccontent/PublicContentMapper.xml:9`、ServiceImpl 第24行。

Mapper 直接返回 `PublicModels.Category`，XML 直接映射 API DTO。实际 ARCHITECTURE 的 ARCH-01 明确禁止 mapper 依赖 dto，转换应在 Service/映射辅助完成。当前不产生已知数据泄漏，但使接口模型和存储查询耦合并违反已采用边界。建议增加最小分类查询 Entity/投影，在 Service 转 DTO，无须通用 BaseMapper 或额外框架。

### M2 — Minor：新增模型和 Mapper 缺少规定的方法/字段说明

位置：`PublicContentMapper.java:8–14`、`PublicSnapshotMapper.java:7–15`、`dto/publiccontent/PublicModels.java:6–18`、`entity/publiccontent` 新增字段。

类级说明存在，但多数 Mapper 方法无业务契约注释，记录字段/实体字段没有按 DEV-07 说明可空性、单位、时间语义和用途；多个不同语义字段压在一行。建议补充关键语义，特别是原始毫秒时间与接口毫秒ISO字符串、仅已生效头像、快照位置和revision约束。此项不要求机械逐行注释或无关格式化。

## 已核对的行为与验证边界

- 公开读 SQL 均约束 PUBLISHED/current_revision；图片额外约束帖子关联、所有者、POST用途、ready，头像约束当前作者指针/所有者/AVATAR用途。没有静态公开媒体目录或外部重定向；非公开状态和旧修订的顺序撤权测试存在。详情读取元数据后会再读当前公开修订图，分页对这一步产生的404会跳过继续扫描。没有发现把管理员 Cookie当作公开读取提权凭据的路径。
- 公开 GET 精确列入 mysql 默认链，其他方法/路径继续默认拒绝；完整管理员链未被广泛 `permitAll` 覆盖。Authorization 明确401，未知/重复参数、sort/limit/ID、正文有检查。当前错误结构/no-store/requestId沿用公共能力。现有测试的管理员回归只覆盖无会话401和csrf200，不能替代全部 B1真实库回归。
- 首次公开候选固定 id+revision、publishedAt/二进制ID降序；后页按候选位置重新连接当前状态及修订。HMAC绑定版本、GET路径、latest、快照、位置、limit、到期，密钥32随机字节持久化。READ_COMMITTED 和控制行 FOR UPDATE覆盖配额与密钥初始化；100/10000/100000上限明确，超限503而非截断。清理只有快照和级联候选，不删除业务表。没有宣称该串行化设计已通过生产容量验证。
- V2只初始化分类和控制行，不创建用户/帖子/图片或自动发布入口；V1哈希保持。新的JAR含V2，README已明确不能直接用于旧Development/B1恢复，未把“脚本未改”当成新JAR可安全启动旧库。
- 已核对 `target/b2a-mysql-Test.log` 和对应独立保存JUnit XML：13项、0失败、0错误、0跳过。测试使用真实数据库和完整MockMvc安全链，含一个真实loopback HTTP用例；时间推进为可控Clock的899999/900000毫秒，不是实际等待。
- 已核对最终默认verify日志：46项，22执行通过、24跳过；有BUILD SUCCESS。默认结果不证明24个跳过项目通过。另存JAR HTTP JSON记录5项检查及正确JAR哈希；这是开发产生的摘要证据，空 `b2a-http-Test.log` 不提供额外可重放的HTTP内容。最终MySQL日志所见为V2已存在后的validate/no-op migrate，首次空库迁移仍应由获放行的Independent目标重新证明。
- 13项测试没有同时执行读取与状态修改的受控并发屏障；撤权/编辑均为顺序操作。也没有全库100000候选边界、多请求竞争配额及I3资源边界证据。源码中的锁/重新查询可作为静态依据，不能冒称这些竞争场景已经实测；整改/独立测试应补足相应证据。
- 微信开发者工具真实页面、图片预览及真机、可达HTTPS/合法域名、供应商存储、EXIF样本、登录/发布/审核均未在本轮验证。后端接口13项通过不代表W1或阶段一完成。

## 分项结论与交回

**规格符合性：部分符合，需整改。** 公开状态与关联检查、固定集签名分页、主要API字段和错误具备实现及开发验证依据；测试清理授权、固定启动目标及媒体资源要求存在上述重要缺口。

**代码质量：需整改。** 分层主体和安全链没有发现新的明显提权通路，但启动/测试防护需要闭合，DTO边界和注释需按实际规则整理；并发/资源证据不完整。

**总体：不通过本轮放行。** 请原后端持久化开发岗位核实I1–I4、整改并提供新快照/JAR及逐项证据，交同一审查者复审；M1/M2明确修复或登记安排。不得修改已应用V1/V2来掩盖现有证据，如确需迁移变化须增量迁移并明确授权。Independent目标尚未获审查放行，不因报告完成而创建/清理；微信真实运行仍作为后续独立交接门槛保留。
