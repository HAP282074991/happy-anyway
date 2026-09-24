# B2-A 独立审查 R3（限定 I1）

日期：2026-09-16。审查者：原独立审查 Agent `/root/b2a_review`。

**结论：本轮通过，I1关闭。** R1/R2的I2、I3、I4、M1、M2保持关闭；本次限定变更未发现新的Critical、Important或Minor。B2-A代码审查门槛已满足，可交项目经理安排固定独立测试岗位接手；本报告本身不是建库、启动联调、用户验收或合并授权。

## 准确版本与审查边界

源码目录：`C:\Users\Administrator\.codex\worktrees\eadd\happyAnyway-clean\happyAnyway-api`。BASE=HEAD=`26cb951a7632bf0c35b876ea902fd8eef6c86122`，仍为未提交成果。

已独立对照根归档 `docs/reports/b2-a-r2-snapshot.json` 与当前快照：既有文件仅 `PublicContentMysqlIT.java`、`docs/reports/b2-a.md` 变化；新增 `PublicFixtureOwnership.java`、`JupiterLifecycleProbe.java`。业务源码/资源、SQL迁移、契约、脚本、pom、资源预算实现均与R2逐文件哈希一致。本轮完整读取这三个测试Java文件的新增/关联路径及报告补充，检查实际JUnit/日志证据。

本轮 **107 files + 15 artifacts** 全部独立计算SHA256，无缺失或不一致。完整逐文件清单引用当前已核验快照：

| 对象 | SHA256 |
|---|---|
| R3 b2-a-snapshot.json | `E17D8645FFB5B3647E8652A90728FEEC5BB77AB42720978DE668B12C71EAE8CD` |
| 原R2快照 | `A767B369288416D6E7F8EF4D3397858BC9DDE2D7A404EB1DD540FE26B8454F42` |
| 当前JAR（与R2一致） | `6C7513FD333F049D80FF6996CCD84D3AC9FBB269B5703908C9B250B62BEF4322` |

只读源码、Git与已有产物；未构建、启动、运行测试、操作数据库或读取凭据/私钥。仅写本报告。通过结论来自独立静态审查及对开发执行证据的核对，不冒称审查者自行运行了真实库测试。

## I1复核

### 初始化失败不再沿用前一用例归属

`PublicContentMysqlIT.fixtures()`首动作调用 `trackedSnapshots.begin()`：关闭旧Generation、创建默认未arm的新Generation，之后才检查身份、表集合和空库。预检失败时 `cleanOwned()`看到新代未启用直接返回，不进入清理。正常或清理拒绝的收尾均在finally关闭当代状态。旧回调捕获原Generation，close与afterCommit认领使用同一代次同步状态，不能向新代次写入旧ID。

`realBeforeEachFailureStillRunsAfterEachWithoutOldOwnership`通过现有Jupiter引擎执行真实的嵌套场景：旧代残留writer ID、新建同名外部合成行及分类变化，实际@BeforeEach失败后实际@AfterEach仍运行。测试断言正文未运行、代次已更换且未arm、同名行和分类保持。`target/b2a-r3-lifecycle.json`与代码断言、对应JUnit用例通过结果一致；没有只手工按想象顺序调用两个钩子。

### 只有成功提交的写入取得归属

作者和初始图片组、帖子/修订/关联组、批量帖子、手工容量快照均经明确事务。`PublicFixtureOwnership.write`先执行写组，成功后注册TransactionSynchronization.afterCommit；加入外层事务时等待其实际提交。错误、重复键、批量失败、回滚不会认领尝试ID；回调使用复制后的ID集合，避免后续可变参数污染。

快照拦截器先捕获当前活动Generation，确认真实Executor返回影响1行后才注册afterCommit，事务回滚不登记；没有把提交前的SQL尝试当所有权，也没有替换生产SQL。

新增真实MySQL回归实际覆盖：帖子/图片重复键、批量先插入再遇重复键并整体回滚、外层事务回滚，以及快照重复键/回滚/提交前后归属。保护器遇未认领同名行拒绝清理，断言该行保持；保护向量最后只按自身准确ID/属性回收。

这些证据足以关闭R2指出的失败生命周期与插入前误登记问题。重复键用例验证实际冲突结果，未将其夸大成两套测试进程并行执行的压力验证。提交结果不确定或旧代已关闭时宁可不认领、由保护器保留记录，符合安全失败要求。

## 验证核对

- `target/b2a-mysql-Test.log`及独立保存XML：21项、0失败/错误/跳过，BUILD SUCCESS；新增三个故障向量在XML中有实际执行记录。
- 嵌套Jupiter场景的预期失败由外层测试确认，不是Surefire整体失败，也不另算第22项测试。
- 默认verify：63项，31执行通过、32跳过，0失败/错误，BUILD SUCCESS。32项为本包21、B1真实库10和迁移1，不宣称跳过项已通过。
- JAR与R2完全相同，R2固定启动目标/打包worker证据仍对应该JAR；本轮没有重开或扩大资源模块改动。

## 保留的交付边界

本轮只关闭代码审查意见，不替代独立测试。Independent空库首次迁移/独立复测、两次公开读取SQL之间的并行撤权屏障、真实微信开发者工具页面/多图预览/真机、HTTPS及合法域名、供应商存储/EXIF样本、生产RSS和吞吐仍未验证。

沿用R2：2×256MiB是子堆而非RSS，20MiB是业务载荷而非父JVM总内存；worker工作预算不等于完整响应发送期限；OS拒绝强杀隔离路径尚无实际拒绝环境测试。启动探测JSON的六项断言不单独证明finally清理完成，独立测试应保留零退出码及行/配置/端口回收证据。

**规格符合性：当前B2-A公开读取切片及本轮I1整改符合已批准要求，代码审查通过。代码质量：本次归属生命周期与事务边界合理，未发现新增阻塞问题。** 请项目经理以本轮准确快照和R1→R2→R3完整报告交接独立测试，并继续保留上述运行验收缺口。
