# W1-A 独立代码审查 R1

日期：2026-09-16。审查者：独立审查子 Agent `/root/w1a_review`。本轮只读源码与 Git，仅写本报告；未创建下级 Agent，未启动 UI、后端或改写编译产物。

## 结论与放行边界

- **规格符合性：代码层限定通过。** 最新列表、公开详情、受控图片、金额、分页/410/乱序、详情不可用与生命周期隔离均有实现和行为证据；未发现确定的 Critical / Important 代码问题。W1-A 的真实页面与平台运行要求仍未验证，不能记为整个任务验收通过。
- **代码质量：通过，附 1 项 Minor（M1）。** 分层和外部数据校验基本符合规则；失败诊断尚有改进项，需经理登记处理安排，不能静默丢弃。
- **总体：代码审查限定通过，真实运行部分无法验证。** 开发者工具首次信任、服务端口、B2-A 审查整改及真实接口条件仍是后续放行门槛；不能据本报告宣称可直接交用户按可用产品验收，也不能将其替代独立测试。

## 准确版本与材料核验

开发目录：`C:\Users\Administrator\.codex\worktrees\c2df\happyAnyway-clean\happyAnyway-wechat`。BASE 与 HEAD 均为 `26cb951a7632bf0c35b876ea902fd8eef6c86122`；symbolic-ref 无分支，detached HEAD。成果是未提交工作树，暂存差异为空。

已读取根 code-review.md、2026-09-16-微信公开浏览.md 的 W1-A/共同约束、W1B2 测试交接、设计 V1、源岗位 agent.md，以及实际开发目录 ARCHITECTURE.md、development.md、README、开发报告和全部 26 个快照文件；检查 tracked diff 及新增文件全文。Git 状态与快照文件集合一致，另有快照自身和 3 份预先存在报告。

| 对象 | 实际核验 |
|---|---|
| w1-a-snapshot.json | SHA256 `90A95AE384221BA94C6F0A6C603CA2D756D3B9B690F7F8C65B4557C3240AEEFB` |
| w1-a.md | SHA256 `89BF52EB0270C9277F2331E79FED6295D26A7BF0CE45A7DDAF76EB79F11F4933` |
| 26 个交付文件、3 个 preserved 文件 | 逐一重算 SHA256，全部吻合，无遗漏或不符 |
| eadd 后端冻结 phase1.md | SHA256 `AD4C93F5A5B6008044E939D24BE24D33D0511C90C6DCCADF883D9B3B5FA91070` |
| 微信 phase1-public.md | 锁定范围清楚，说明之后完整原文与当前冻结源全文一致 |
| project.config.json | 无交付差异，touristappid、urlCheck=true；未读取本地私有配置 |

## 已核验行为与质量

1. 请求集中在 platform/request.ts；页面经 service/api 调用，不带凭据。API 路由固定 latest/20，cursor 转义；详情 ID 及返回 ID 一致性检查；头像只允许精确 API-origin 相对路径。未见生产测试数据、错误后 mock 成功、登录/发布/互动假入口。
2. api/types.ts 校验未知响应对象、必填/可空字段、安全整数、金额、固定毫秒 UTC 时间、码点长度、图片尺寸与数量及受控头像地址。金额用整数分除法与余数，0、1、9999999 边界正确。地点只展示已有 placeName，不编造城市名称。
3. FeedController 保留失败分页和原游标，按 ID 去重，只在 cursor 非 null 时继续，检测重复游标，分页 410 重开首屏，首屏 410 不循环；刷新代次和 active 标识丢弃旧列表/图片结果。
4. DetailController 加载前清旧正文/图；非法路由不请求，404 为 unavailable，失败图片不进入预览。隐藏/卸载释放资源，返回重新获取当前公开内容；不把已加载内容当服务端权限依据。
5. MediaScope 限每个范围 4 并发；仅 200、JPEG/PNG Content-Type 与 getImageInfo 类型一致且尺寸合格才返回临时路径。失败文件、离页迟到下载/解码文件均有清理路径；排队请求释放后拒绝，不继续下载。资源只在当前范围持有，未见任意外部 URL 或私图裸 ID 读取。此项是源码与替身行为结论，不证明微信实际文件系统回调行为。
6. 完整阅读两个页面 TS/WXML/WXSS/JSON、app 配置样式及默认 SVG：单列大图、米白橙黄、真实字段、正文、多图、金额、分类、加载/空/失败/分页/结束/不可用入口均存在，路由注册一致。SVG 无外部资源。CSS/WXML 的实际编译、布局和资源显示仍须工具验证。

## 问题

### M1 — Minor：部分失败在最终处理边界丢失诊断原因

位置（均相对开发工程）：`miniprogram/services/posts.ts:87–95,105–108,153–164,165–168`；`miniprogram/platform/media.ts:42–60`；`miniprogram/platform/request.ts:28–34`。

媒体拒绝被转换为 failed 状态后没有记录安全错误码，API 响应校验抛出的 INVALID_RESPONSE 同样仅变为用户提示；已有 HTTP 日志仅有状态，无法区分列表与详情。图片 404、类型错误、解码错误、网络失败在页面外没有可定位差异。用户反馈是正确的，但实际联调排错时容易只看到“图片暂时不可用”，不满足 WX-DEV-06 中“在负责处理的边界记录原因，日志包含操作及必要的非敏感上下文”的要求。

建议在一个合适的最终处理边界记录操作名及枚举错误码/HTTP 状态；取消和已失效代次不必作为业务告警。不要输出完整响应、正文、凭据、临时文件路径或重复逐层日志。验证可用替身捕获 console，证明代表性失败有安全诊断且用户提示不含内部细节。这是非阻塞改进，尚未被本报告标为延期接受。

## 独立只读验证

- 直接执行 `node --test tests/pages.test.cjs tests/public-browsing.test.cjs tests/transport.test.cjs`：30 tests / 30 pass / 0 fail / 0 skipped，约 275ms。读取测试实现确认其驱动真实控制器、平台封装和 Page 回调，而非仅断言常量；这些仍全部是 Node 替身测试。
- 为避免既有 JS 与受审 TS 不一致，使用本工程 TypeScript 读取 tsconfig 并 createProgram，在内存 writeFile 回调中比较输出与现有 JS；10 个 JS 输出全部一致，diagnostics=0，未写磁盘。此前试用 transpileModule 的默认选项比较在 app.ts 报 mismatch；改为项目准确编译选项后全部一致，前一次不能作为源码缺陷证据。
- `git diff --check` 通过。Git 有全局 ignore 读取权限及 LF/CRLF 提示，未改其配置。未执行 npm test/build 以避免重写产物，未重跑依赖安装；开发报告中的 lint/build 结果属于开发自检证据。
- 覆盖充分性：现有 30 项对主要控制器和请求边界充分；成功真实 Page 多图预览与隐藏/恢复的联合平台行为、实际 WXML 渲染、默认 SVG、长列表/窄屏/长文、真实下载清理不在该套件证明范围。

## 平台/可视/联调待验证（与代码缺陷分列）

以下是关键交付证据缺口，不因缺失而虚构源码故障：

1. 开发报告只证明导入项目，首次“信任并运行”仍待用户处理，IDE service port 关闭；本审查不代操作安全许可。没有产品页面运行截图，不能确认 WXML 编译、默认 SVG、窄屏长文与真实按钮体验。
2. `pages/post-detail/index.ts:15–17` 在所有 onHide 中释放全部媒体；预览使用临时文件（media.ts:80–85）。后续必须在工具及 iOS/Android 验证“打开多图预览→左右滑动→返回详情→切后台/返回”的生命周期与文件存活关系，确认原生预览不会因页面隐藏清理而失去文件。当前替身只记录 previewImage 参数，无法证明这一平台交互；本轮没有足够一手平台证据将其判作已确认缺陷。官方文档检索/直连未取得可用内容，不以非官方资料代替运行证据。
3. 同时验证真实 onHeadersReceived、getImageInfo、unlink 对受控 JPEG/PNG、错误响应、离页迟到结果的行为；默认 SVG 在目标工具和设备分别留证据。不能以文件路径字符串等于预期就标默认头像已显示。
4. B2-A R1 尚待整改，未放行真实联调；当前 127.0.0.1:8080 不是已确认可用公开服务。准确后端快照/数据/证书/域名与实际 AppID 条件明确后，再验证列表→详情→多图→返回→刷新/翻页，以及不可用、图片撤权、空/失败重试。
5. 以上运行与联调证据补齐前，W1-A/B2-A 整体测试和用户验收保持未完成。后续任何源码修改均需更新快照；若为 M1 或平台缺陷整改，交本审查实例按差异复核。
