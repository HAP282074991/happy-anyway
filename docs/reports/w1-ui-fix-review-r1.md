# W1 UI整改独立审查 R1

2026-09-23。审查者 `/root/w1_ui_review` 接替当前不可用的 `/root/w1a_review`；未参与实现。依据根 code-review.md、公开浏览计划“真实UI联调缺陷整改”、W1B2测试交接、W1原R2与配置R1、工程架构及开发规则。源码/Git只读，仅写本报告；未构建、操作UI、连接数据库或启停服务。

## 结论

**规格符合性：本次共享调度、503有界重试及默认关闭诊断限定通过。代码质量：通过。总体：代码限定通过，可交固定测试岗位继续独立复测；无新增 Critical / Important / Minor 代码问题。**

这不是预览缺陷关闭或整体交付通过。黑屏的真实事件链、整改后真实图片并发/错误状态、返回分页及窄屏仍需运行验证。原 onHide 清理逻辑未变；本轮只增加诊断，符合先取证再修复要求。

## 准确版本

目录 `C:\Users\Administrator\.codex\worktrees\c2df\happyAnyway-clean\happyAnyway-wechat`，HEAD `26cb951a7632bf0c35b876ea902fd8eef6c86122`，未提交工作树。

- 最新 `w1-ui-fix-snapshot.json`：`E2D70EB3803ABE1F36BB27ABE983D39C4FF34807AAB2AA2D58763E1F39458127`；39 files、5 preserved独立逐项重算全部匹配。
- 最新 `w1-ui-fix.md`：`53124D177221B97A5EA7FC331AB35F84D06E7A3355D77CD272AB4E86B545F3CB`。
- 原9月17日快照 `667ED265E6941479682DB15AA8443E8C28FA81D1768BCD806F2ADC3557BC61C9`、报告 `AAC1092A82347465F173F742E33036F1D9191AE65F65BB05D054451B9B30801B`：审查初次读取了完整旧内容；期间开发按经理通知追加恢复记录。更新仅报告及快照恢复/配置观测元数据，受审源码/测试未变化。
- 与保留的联调快照 `3BA013CCFA5738B7DBA7EDFE268E574B884182E155FFE6661445A91B9CA70564` 比较，改动为 media.ts、services/posts.ts、详情 index.ts、transport.test.cjs、README；新增 preview-diagnostics.ts、两个相关测试与新报告。既有截图、契约和原报告保留。

**额外运行配置差异单列：** `project.config.json` SHA256 `B1474F0037000822C2B60243682DFE7DA6BC80F60B6703750094122CEBCBEEFA`，独立查看Git差异确认为新增 `setting.minifyWXML=true` 及末尾换行变化，urlCheck仍true、AppID仍touristappid。来源未证实，未包含在39交付文件中，但最新快照 observedExternalConfiguration 已准确登记。本审查未回退或授权该变化，不能复用旧“配置无差异”结论。后续UI运行证据应记录这个实际配置；这项观测不构成已证实业务缺陷，也不能当成已审源码之外的零差异环境。

## 代码核验

1. media.ts 的模块级 activeDownloads/downloadQueue 跨 MediaScope 共享，总许可2、最多128排队。销毁只取消结果与移除队列/退避；已开始任务保留许可至下载及解码 Promise 实际结束，finally释放并启动下一项。旧scope晚到文件仍清理。同步下载抛错进入Promise拒绝；监听注册抛错后等待已发请求回调，避免提前归还。
2. 每次load建立45秒总预算，包含排队/下载/解码/退避，网络timeout取15000与剩余预算较小值。仅ApiError status503允许两次额外重试，250/500ms退避；401/403/404、错误类型和解码失败不重试。失败临时文件先提交unlink，取消能打断排队/退避。尚在途且永不回调会保留最多2个许可，这个保守失败边界在报告中明确，不能描述为真正强杀后端请求或跨客户端服务器容量保证。
3. 详情服务及Page改动是固定事件记录，不修改原有dispose/重建流程。preview success/complete没有释放资源，没有固定延时假装用户关闭。默认关闭时无文件探测；开启时最多200条日志，实际调用参数均为字面枚举、内部代次/数量和布尔，不传原始回调、路径、正文、ID或凭据。文件access成功/失败只证明回调时刻的存在观察，不代表原生预览实际取图时刻。
4. 阅读全部新调度/诊断测试、修改后的transport测试及受影响完整源文件。8项调度测试覆盖跨scope、迟到、三次封顶、取消、预算、同步异常与队列上限；3项诊断测试明确模拟Page事件，不将其冒充微信真实onHide证据。开发报告的旧实现先失败记录属于开发证据，本审查未重建旧实现复演。

## 独立验证及后续门槛

- 直接执行 `node --test --test-reporter=dot tests/*.test.cjs`：47测试全部通过，退出0；未运行会构建的npm test。
- 用工程TypeScript配置在内存emit并与现存产物比较：12个JS完全一致，0 diagnostics，无磁盘写入。
- `git diff --check` 退出0，仅Git全局ignore权限与行尾提示；未改配置。

上述为代码及微信边界替身测试，不是UI复测。需继续实际列表图片加载、快速跨页、503恢复、原生两图预览及安全事件序列。诊断保留仅用于已授权本地取证，完成后按计划移除或单独说明保留依据；默认关闭不代表黑屏已修复。正式AppID、HTTPS/合法域名与真机仍未验证。若后续改动生命周期或配置，须按准确新差异复审，不能用本报告覆盖。
