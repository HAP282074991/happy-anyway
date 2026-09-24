# B2-A 独立审查 R2

日期：2026-09-16。审查者：原独立审查 Agent `/root/b2a_review`。

**总体：需整改。R1 的 I2、I3、I4、M1、M2已关闭；I1部分修复，但测试生命周期仍可能误删未知同名记录，保留为 Important。** 本轮不放行本包破坏性测试入口；交原后端岗位完成这个明确缺口后复审。没有把微信真实运行、独立测试或用户验收标为完成。

## 版本、范围及证据

实际源码目录：`C:\Users\Administrator\.codex\worktrees\eadd\happyAnyway-clean\happyAnyway-api`。BASE=HEAD=`26cb951a7632bf0c35b876ea902fd8eef6c86122`，未提交成果，未改HEAD/工作树。

对照根归档 `docs/reports/b2-a-r1-snapshot.json`，独立检查本轮全部28个新增或哈希变化文件，包括新worker、资源租约、两个原脚本及新增启动安全探测脚本、完整FixtureGuard/测试、Mapper/DTO/Entity/Service和报告。原R1未变文件沿用该轮审查；另核验本轮全部 **105 files + 13 artifacts**，无缺失或哈希不一致。

| 对象 | SHA256 |
|---|---|
| 本轮 b2-a-snapshot.json | `A767B369288416D6E7F8EF4D3397858BC9DDE2D7A404EB1DD540FE26B8454F42` |
| 本轮 JAR | `6C7513FD333F049D80FF6996CCD84D3AC9FBB269B5703908C9B250B62BEF4322` |
| 原R1快照 | `AABCB79F326FB2FC1BEAD831ECE90B61B41938AF5E886C149B77C6453B855142` |
| 冻结契约（未变） | `AD4C93F5A5B6008044E939D24BE24D33D0511C90C6DCCADF883D9B3B5FA91070` |
| V1（未变） | `715D9643BF81C41C4419E066EE433D0EAE03E8DBE8BF01C2783C8682C20075D9` |
| V2（未变） | `03E1647C4B04887B67806A6675114235A23765C4B5A43DAAF75FBFCF45DE83FF` |

完整逐文件哈希以本轮已核验快照为准。本轮再次读取权威微信公开浏览计划新增R1整改段与I3经理批准方案、当前b2-a.md整改节，并沿用R1已读的设计/架构/规则/冻结公开契约。

只读源码、Git、日志和已有产物，没有构建/启动/数据库操作，没有读取凭据或私钥。唯一写入是本报告；下述复现时序是源码推演，未执行数据破坏实验。

## I1 — Important，未完全解决：归属集合可跨失败生命周期误认未知记录

位置：`src/test/java/com/example/happyanyway/publiccontent/PublicContentMysqlIT.java:67–86`，尤其70–74、79、81–82、85–86；`PublicFixtureGuard.java:40–49`。

本轮新增的SERIALIZABLE范围锁、未知ID写前检查、精确类别校验确实解决了R1直接全表清理的主要缺口；已读两个未知作者/快照保护用例。但归属集合本身的维护还存在两个具体路径：

1. 本测试类是 `@TestInstance(PER_CLASS)`。第70行先做 `empty(db)`，第71行才清除前一用例的owned集合；第79行的 `@AfterEach` 无条件清理。JUnit在@BeforeEach失败后仍调用@AfterEach。因此：前一用例成功清理，但集合仍留着writer/other等旧ID；下一用例开始前出现一个本轮并未创建、恰好叫writer的合成外部行；`empty`正确拒绝，却没有清空旧集合；随后 `cleanOwned`把writer视为已拥有，范围检查通过，执行DELETE。即使已经检测到未知数据、并拒绝本次初始化，也可能在收尾把它删掉。
2. 第72、81、85行均在INSERT成功之前登记归属。两个相同目标的测试调用在空库检查后竞争固定ID时，一方成功插入，另一方重复键失败；失败方已把该ID登记为自己的，@AfterEach可能删除胜出方刚插入的行。清理阶段的范围锁不能修正先前错误的归属登记。

这不是指控本轮已经发生误删；当前通过日志没有该故障向量。问题是“未知行停止且不接管”和“只清本次自己插入的记录”的授权约束在失败路径仍不成立。

建议修复：在任何本轮前置检查之前重置/切换本轮生命周期状态；初始化拒绝时不得沿用旧归属执行清理。只在确认成功插入后记录归属，批量插入应有明确原子性/失败处理，不能把尝试过的ID当成创建成功。必要时对测试运行加独占互斥，或使用本次独有命名空间。所有失败情形宁可保留不确定记录供核对，也不能推断取得所有权。

所需回归：用本测试自己创建并最终按精确ID回收的保护夹具，覆盖“上次集合残留 + 下次@BeforeEach因同名未知行失败 + @AfterEach仍执行”，确认该行和分类不变；覆盖“登记/插入过程中重复键失败”，确认不删其他执行者成功创建的行。不要只再次测试全新且不与owned集合重合的unowned-sentinel。

## 已关闭事项

### I2：固定启动目标 — 已解决

`scripts/start-public-content.ps1:25–29`现在固定 `spring.config.location=classpath:/`、mysql profile、实际datasource URL/username、关闭Flyway、127.0.0.1:18082；密码仍只经已审子进程环境传递。没有向命令行写密码、接受任意URL或回退Development。

新 `test-public-startup-safety.ps1`使用相同Test/Independent映射；完整检查账号/授权/无可执行数据库对象及空业务数据，采用CreateNew创建合成外部配置，配置目标是无网络的invalid JDBC；以本次随机ID插入/读取同一图文证明实际JDBC目标，随后定向回收。资源仅当前创建的子进程/配置/随机ID行；已有外部配置拒绝接管，删除前核对合成文件哈希。没有看到新的批量删除业务行或未知进程路径。

已读对应JSON，6组检查与本轮JAR哈希一致，包含打包worker真实PNG。该JSON在脚本finally清理之前写入，因此它本身只证明6组功能断言；独立测试仍须同时保留脚本零退出码/最终清理输出、端口消失及行/配置回收证据，不能只以 `passed=true`证明全部清理成功。

### I3：媒体读取/解码/响应资源 — 按批准方案已解决

- `PrivateMediaServiceImpl.read`先取得两路许可，再执行Supplier中的授权Mapper；SQL增加BLOB长度1..10MiB条件，Java再校验字节/像素。超额BLOB不返回应用，忙碌用例断言loader调用0次。
- `Media`是幂等close租约，Controller同步write/flush并在try-with-resources结束释放；正常或写异常都不提前释放，不依赖消息转换器后的隐式生命周期。图片与头像都走相同租约。
- `ProcessMediaDecoder`以固定java.home JDK、固定参数、独立私有classpath启动已构建ImageDecodeWorker；stdin传图片，stdout/stderr丢弃，无图片临时文件。进程环境清空，仅保留SystemRoot及自有TEMP/TMP；不继承DB/Spring/JVM注入变量。私有目录创建时ACL/0700，class来源为自身资源，测试比较字节；每次目录独立，无共享初始化竞态。
- 工作预算从Stage创建前计算，剩余时间用于waitFor；超时执行destroyForcibly，并检查真实进程和输入线程退出。未退出时抛UnreapedWorker，许可转入隔离，后台只在两者真实结束后释放；不是Future取消后马上扩容。目录清理仅固定class与自有祖先目录，有界重试。
- 7个MediaBudgetTest含忙碌、租约、边界前置校验、真实worker/ACL/资源复制与清理、实际慢worker终止、坏图/失败恢复、模拟响应异常、敏感环境隔离；真实MySQL含超额BLOB拒绝，最终JAR实际返回PNG。

资源结论严格限定：2×10MiB是业务载荷上限，非父JVM总内存；2×256MiB是子堆上限，非RSS。驱动复制、协议缓冲、JVM/native开销与实际容量尚未认证，报告已明确。5秒为工作预算，额外包含终止等待/输入回收及目录收尾；同步客户端发送不在该5秒内，慢客户端持有许可的行为已明示。没有据小图/假decoder的边界测试宣称40M真实图片已完整解码通过。强杀拒绝/无法终止的Unreaped分支具备静态安全处理，当前测试没有实测OS拒绝强杀，不将它写成已测。

### I4：完整授权/对象防护 — 已解决

`PublicFixtureGuard.grants`要求完整两元素集合，严格为USAGE与转义精确库ALL；拒绝多余全局权限、GRANT OPTION、角色、重复行和未转义库名。`objects`增加触发器检查，主测试在迁移前调用。拒绝向量用合成文本和模拟JdbcTemplate，不实际授予危险权限；新启动探测脚本使用同样完整集合和对象检查。

### M1/M2：分层和必要语义 — 已解决

分类新增PublicCategoryEntity，Mapper/XML返回Entity，Service映射DTO。新增字段及Mapper方法已补历史/当前含义、可空性、分/像素/毫秒、修订/位置和租约契约；没有机械增加通用框架或新依赖。

## 验证核对及保留项

独立读取日志并核对快照：真实MySQL 18项、0失败/错误/跳过；专项Media/Guard 9项通过；默认verify共60项，31执行通过、29显式跳过，BUILD SUCCESS。9项专项亦包含在默认31项中，不重复累计成独立新增覆盖。JAR HTTP 6组检查另计。

新增并发最后一个快照配额和100000全库候选上限测试存在且有通过记录；它们不等同于读取SQL之间并发撤权的屏障测试。V1/V2/契约保持；没有发现生产安全链、分页协议或B1旧脚本在本轮被额外改变。

仍未验证：Independent空库首次迁移/独立复测、读取两次SQL之间的并行状态/资料撤权屏障、真实微信开发者工具页面/多图预览及真机、HTTPS/合法域名、供应商存储/EXIF样本、生产峰值RSS和吞吐。仅开发Test目标有本轮执行证据；不据此授权创建Independent。

## 分项结论与后续

**规格符合性：产品公开读取和已批准I3修复符合当前切片；测试安全I1尚未完全符合，需整改。**

**代码质量：主要修复成立，I1失败生命周期仍有数据保护缺陷；未发现需要重开I2/I3/I4的阻塞问题。**

由原后端岗位只针对I1残余路径补齐实现和回归，提供新准确快照/报告；其余已关闭项后续若变更再按影响复核。同一审查者进行R3，不以重跑现有18项作为这一新故障向量的关闭证据。独立测试、联调及用户验收仍需经理后续正式放行。
