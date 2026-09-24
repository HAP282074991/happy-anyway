# W1 媒体获取与预览租约修复独立审查 R1

2026-09-23，审查者 `/root/w1_ui_review`。依据根代码审查规则、公开浏览计划“取证后业务修复放行”、前序整改/诊断审查和5deb独立测试报告最新media/preview真实证据。源码及环境只读，仅写本报告；未操作UI、数据库、服务、私有配置或执行写盘构建。

## 结论

**规格符合性：本次代码修复通过。代码质量：通过。总体：代码限定通过，可交原独立测试岗位真实复测。无新增 Critical / Important / Minor 问题。**

这不关闭首封面或原生预览缺陷。新二进制请求、自有文件路径在实际Nightly及原生预览中的兼容性尚须验证。69个替身测试和下面的独立补充检查不能代替真实图片显示、左右切换、返回/下架、窄屏等验收。

## 准确版本与范围

工程 `C:\Users\Administrator\.codex\worktrees\c2df\happyAnyway-clean\happyAnyway-wechat`，未提交HEAD基线26cb951a7632bf0c35b876ea902fd8eef6c86122。

- `w1-media-fix-snapshot.json`：`4D0F500389F512831235E4BF99B8F8421E6A01AA61E49325731504E70EEBC9F3`。
- `w1-media-fix.md`：`97FBC17B44B4CCB94BCFB6F8A823CFF7FA8C25869EF444F465CE140EB128194E`。
- 独立重算67个当前文件及10个preserved：全部匹配。旧formal/media/preview三批共150个冻结文件也全部匹配原manifest。
- 完整读取新增media-files.ts及变更request/media/services/详情Page/诊断白名单、相关测试与README。诊断常量false；project.config仍B1474F0037000822C2B60243682DFE7DA6BC80F60B6703750094122CEBCBEEFA。保留此前minifyWXML配置观测，不误称与Git HEAD无差异。没有依赖、后端或协议修改。

## 规格及实现判断

1. **同回调媒体读取。** request.ts的getBinary使用固定GET/Accept和responseType=arraybuffer，同一次success提供status/header/data。media.ts不再依赖单独headers事件先到；路径仍限定公开上下文图片/精确头像。先检查HTTP200与JPEG/PNG MIME，再检查非空ArrayBuffer及10MiB，错误正文不写盘；写后实际解码类型、有限正尺寸及4000万像素检查不放宽。IMAGE_FILE_ERROR已加入安全诊断白名单，图片失败仍显示失败状态，不伪装成功。
2. **有界在途工作。** 原应用级2许可、128排队、45秒总预算和仅503额外2次保留。许可覆盖请求、初始化、写盘、解码及失败收尾；取消/超时先使页面结果失效，等待实际在途回调，不强放许可。迟到响应在写前拒绝；写中取消待write结束后定向清理；解码迟到失败清理自有文件。同步调用异常被映射固定错误，不输出原始对象。
3. **文件归属与初始化。** USER_DATA_PATH下专用目录及严格随机命名模式，首次初始化Promise屏障先完成残留回收，之后才允许登记/写新文件。目录条目超过256安全失败；不拼接任意远端名称，不扫描用户根或删除其他格式条目。128文件/128MiB在写前登记配额，失败也按部分文件处理；release只接受本次登记路径，重复调用共用Promise，删除成功才扣配额。删除失败继续占配额并告警。readdir返回列表后才检查256条，不应把这个条目检查称为底层目录枚举内存硬限制。
4. **预览租约。** 仅租用当前scope验证成功且持有的1–9张唯一图片，全局一个租约。hide取消页面工作/清非租约资源并清展示状态，保留预览图片；success/complete不释放。返回onShow dispose旧controller、释放旧租约并重新请求当前公开状态；unload/fail释放幂等。fail发生在仍显示的页面，只撤销额外租约，页面自身所有权继续有效。旧fail闭包不作用于新租约，重复点击不叠加。没有固定时延冒充关闭。
5. **测试迁移合理。** 旧downloadFile头事件/失败临时文件断言已改成同success头字节与非200不写盘；不是靠删除异常处理绕过失败。新测试直接驱动生产Page/controller，覆盖hide保留、show重读404、fail/unload、9图上限、同步异常、初始化/写盘取消及配额边界。开发“旧2失败→修复通过”属开发记录，本审查没有重构旧实现复演。

## 独立执行证据

- `node --test --test-reporter=spec tests/*.test.cjs`：69 tests、69 pass、0 fail/cancelled/skipped，约128ms。65顶层加4子项。未执行会构建的npm test。
- 用工程tsconfig/TypeScript在内存emit，26个JS/map与磁盘逐字节一致、0诊断，无产物写入。
- 额外在内存脚本驱动真实Page和模块：预览A→hide→show重读→预览B→hide→调用A的迟到fail；B的两张文件仍存在，随后unload全部清理，断言通过。文件系统/网络/预览回调均为替身，不触碰真实USER_DATA_PATH。
- `git diff --check`通过，仅已有CRLF提示。

## 保留边界与交接

真实旧证据说明成功回调时MIME未到、预览仍开却unlink，并不证明服务器无头或所有黑屏唯一原因；新实现针对这些已证实路径修复，最终因果仍靠复测。

buffer上限在请求完成后检查，不是违规超大响应传输期硬上限，也不包含平台复制/解码内存。初始化或回调不返回可能保守占满2许可；清理失败文件继续占配额，重启初始化再处理。没有可靠关闭事件时最多9图/90MiB租约保持到show/fail/unload；实际存储与原生预览表现仍需验证。报告如实保留这些限制，不以代码推导冒充平台成功。

下一步原测试岗位以此准确新快照在原c2df项目真实核验首次/刷新封面、两图显示与左右切换、退出返回、下架后404、分页/窄屏及资源收尾。旧诊断冻结版不是新业务修复版；如需要再启用诊断，应另记准确开关构建，最终恢复false。正式AppID、HTTPS/合法域名及真机继续未验证；本报告不授予整体用户验收、合并或发布。
