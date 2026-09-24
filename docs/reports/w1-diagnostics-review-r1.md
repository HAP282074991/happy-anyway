# W1 图片头与预览取证构建独立审查 R1

2026-09-23，审查者 `/root/w1_ui_review`。依据权威公开浏览计划9月23日补充授权、代码审查规则及前序 w1-ui-fix-review-r1。本轮源码只读，仅写本报告；未操作UI、数据库、服务、安全设置或执行构建写入。

## 结论

**规格符合性通过，代码质量通过，限定取证构建审查通过。无新增 Critical / Important / Minor 问题。** 可由原开发在准确c2df项目中仅切换已审诊断常量并重新构建，逐项匹配对应冻结版本后交固定测试岗位独占UI取证。测试岗位不能自行修改源码。

本次不是图片失败或原生预览黑屏修复。两个问题保持未关闭；得到真实事件证据后另定修复范围。完成取证须由原开发恢复formal默认关闭、重建并核验，不能以诊断开启版作为正式交付。

## 版本核验

实际工程 `C:\Users\Administrator\.codex\worktrees\c2df\happyAnyway-clean\happyAnyway-wechat`，沿用未提交基线26cb951a7632bf0c35b876ea902fd8eef6c86122。

- 报告 w1-diagnostics.md：`F887DEDB968FC5A5658989774E756404381E1234BC9C33575647DF82EC0367C4`。
- w1-diagnostics-snapshot.json：`966AA8A4F0AF8B98B986EF79749ED486438C6B75F7B161E21FE50ACE750857A6`，所有登记文件逐项重算匹配。
- w1-diagnostics-builds/manifest.json：`774C07BF6CC2D8D3CBCA22BEDD013CF6E1BC0C1441AC254C799AF9DAE7837FD8`。
- formal/media/preview各50个实际文件，与manifest全部匹配且无多余文件。没有private项目配置、凭据或node_modules。主工程对应50文件全部匹配formal。
- 两诊断版相对formal仅preview-diagnostics.ts及其.js/.js.map有差异。独立将media的enabled true归一false、preview再将batch preview归一media后，TS字节与formal完全相同；没有业务文件或配置差异。

运行配置沿用前审登记的project.config SHA B1474F0037000822C2B60243682DFE7DA6BC80F60B6703750094122CEBCBEEFA，包括已观测minifyWXML差异，不将其误称原HEAD配置。没有新安全设置改动。

## 代码及安全判断

完整读取两个改动源码及新增media-diagnostics测试。相对前审源码只扩充诊断模块和media调用点，调度、45秒预算、2许可、503重试、MIME拒绝、解码检查、dispose与unlink时机保持原行为。late/absent headers仍拒绝INVALID_IMAGE_TYPE并清理，报告明确没有借诊断放宽校验。

下载实际发起时分配本地递增编号，事件使用固定字面枚举。输出仅状态数值、文件路径是否存在于回调的布尔、MIME键/字符串布尔及png/jpeg/other/missing枚举；无原始header值、URL、路径、正文、用户ID或回调错误对象。filePresent不是文件系统存在证明，headers.registered只表示注册返回；同步回调可先于registered，报告解释准确。

正式常量false；media与preview只选一个事件批次，不选中的事件不消耗预算。两类共享同一sequence，模块会话最多200条；正式关闭或非preview批次不增加preview文件系统探测。保留显式启用函数可开始新受控会话并重置计数；该行为非永久全进程200条，测试和报告没有隐瞒重置。原生preview success/complete仍仅为接口回调，不释放资源，不猜测用户关闭。

## 独立验证

- 直接运行现有 `node --test --test-reporter=spec tests/*.test.cjs`：59通过、0失败/跳过/取消，其中52顶层及7子测试。没有运行带构建的npm test。
- 三冻结版本分别以内存TypeScript emit核对，每版24个JS/map输出全部一致、0诊断，不写磁盘；为解析工程依赖在内存指向现有node_modules类型目录。
- 分别在独立VM加载三个编译诊断模块，不调用启用函数：formal静默，media自动仅产媒体事件，preview自动仅产预览事件。证明编译入口生效，不证明微信工具已执行该版本。
- git diff --check通过，仅已有行尾提示。

## 取证交接边界

开发报告描述导入冻结副本，经理补充允许在原c2df路径切换同一已审常量构建：两种方式都必须核对manifest准确版本。原路径方案避免新增项目导入，但不能据此跳过工具实际出现的安全提示。每批重新启动并记录版本、批次和日志边界，不能将旧会话日志拼成新证据。

媒体批次先取得首封面头回调与success顺序；预览批次记录双图与page hide/show/unload、unlink关系。截图可能包含工具自身网络内容，诊断字段安全不等于整张截图自动脱敏。正式AppID、HTTPS/合法域名、真机和其他未完成UI门槛继续保留。真实取证后若修改业务逻辑，需新快照与复审。
