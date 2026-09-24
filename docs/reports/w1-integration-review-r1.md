# W1 最小联调配置独立审查 R1

日期：2026-09-17。审查者：原 W1 独立审查实例 `/root/w1a_review`。依据根 code-review.md、W1B2 测试交接最新“2026-09-17 本机游客工具真实联调放行”和 W1 R2 结论。仅审配置、README、新增联调报告/快照；源码与 Git 只读，仅写本报告，未操作 UI、安全设置、数据库或后端进程。

## 结论

**规格符合性：通过。代码质量：通过。总体：当前配置代码快照限定通过，无新增 Critical / Important / Minor 问题。**

本次配置可交原测试岗位按已放行流程继续真实 UI 独立复测；本结论不表示服务已启动、真实联调完成、原生预览可用或用户验收通过。后续追加页面证据应更新联调快照并核对与当前受审代码一致性。

## 精确版本与差异

开发目录：`C:\Users\Administrator\.codex\worktrees\c2df\happyAnyway-clean\happyAnyway-wechat`。HEAD/BASE 仍为 `26cb951a7632bf0c35b876ea902fd8eef6c86122`，detached HEAD，未提交工作树。本次比较基准是完整保留的 W1 R2 文件快照，不是仅比较 Git HEAD。

| 核验对象 | SHA256 / 结果 |
|---|---|
| 原 w1-a-snapshot.json | `3EE15308847C50F0D032AAF449F785B0CD232A524A6C02FEAFEAAF5B1BCEE6EE`，原样保留 |
| 当前 w1-integration-snapshot.json | `334F3E6076491941A7719C6B8053A8EF6D7EABC19906B51E9985FA4726B0E3A9` |
| 当前 w1-integration.md | `5BEFB04D0CDA3AB57EA8E6E91350E97EAA91DDC8BDEF84368A34D3F6806E6517` |
| config.ts | `4790EC3860206E3BEB9F15CBFF3F8EBFEB46B27CFCE43211611D36DC00F69341` |
| README.md | `B0B6BE960A709A476569E27C6818D1B16434B91C08AF602BC56E24BD518F0688` |
| 29 个当前交付文件及 4 个 preserved 文件 | 逐一独立重算哈希，全部吻合 |

相对 R2 只有 config.ts、README.md 的哈希变化，新增 w1-integration.md 及联调快照自身；其余原交付源码、页面、资产、测试、依赖和冻结契约副本均未变化，无原文件移除。完整 Git 状态未发现额外源码差异；project.config.json 相对 HEAD 无差异。未读取本地私有安全配置，不能将源码核验扩大为私有设置的独立证明。

## 审查依据及验证

1. `miniprogram/config.ts:3` 的 origin 从 `http://127.0.0.1:8080` 改为 `http://127.0.0.1:18082`。在内存将新 origin 替换回旧值后计算哈希，与 R2 原文件完全相同，证明无其他配置内容变化。
2. 地址与最新经理放行一致；只读检查 B2 受审 `scripts/start-public-content.ps1:27–32`，实际参数和环境固定监听 127.0.0.1:18082。客户端只更换 origin，既有 `/api/v1` 路径拼接和冻结公开协议不变，没有切到 18443 或增加凭据/查询参数。
3. README 第 28 行说明 Independent 测试岗位服务、合成数据及非默认常驻；第 29 行及末段明确游客工具不能证明正式 AppID、HTTPS、合法域名或真机可用。当前联调报告区分历史 8080 连接拒绝、配置自检和待执行真实操作，没有把 HTTP 替身或未就绪服务当联调成功。
4. 本轮独立使用项目 TypeScript/tsconfig 在内存生成输出并比较现有 JS：11 个 JS 完全一致，0 diagnostics，未写产物。直接运行四个已有 Node 测试文件，36 个测试全部通过（dot reporter，退出 0）；这是行为替身回归，不是微信平台/网络测试。未重跑会改产物的 build/npm test；lint/build 开发执行结果属于开发报告证据。

## 保留边界

真实列表、详情、多图预览左右切换、预览与 onHide 临时文件生命周期、默认 SVG、窄屏、分页/刷新和异常态仍须实际工具自检及原测试岗位独立复测。当前报告未提供这些操作的新通过证据；环境就绪及数据/进程回收归固定测试岗位负责，本审查未核验活服务或操作数据库。

本轮游客工具运行授权已存在，不再沿用旧“服务端口尚未开启”作为当前阻塞判断；但这也不等于 UI 全部通过。正式 AppID、TLS、合法域名及 iOS/Android 真机继续未验证。报告后续追加 UI 证据如导致文档/快照哈希变化，应明确保留本报告对应的当前配置阶段版本，不用旧哈希冒称覆盖新证据。
