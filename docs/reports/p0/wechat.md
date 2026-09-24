# P0 wechat 原始回报

来源：本地任务日志 task_complete.last_agent_message。
正式任务 ID：01a0a82e-2f34-7630-841f-21a646081c2a；turn ID：01a0a93a-7d0f-7982-a4ce-0066a747465d。
项目经理恢复原文，未改写结论；此报告不是独立测试或审查通过证明。

**DONE_WITH_CONCERNS：微信岗位 P0 只读核对完成。** 本回复供项目经理登记；未修改文件、安装依赖、构建、测试、提交或创建子 Agent。

**事实核对**

| 项目 | 结果 |
|---|---|
| 身份 | 微信前端开发，任务 ID `01a0a82e-2f34-7630-841f-21a646081c2a` |
| 实际目录 / HEAD | `D:\AIProject\happyAnyway-clean` / `26cb951a7632bf0c35b876ea902fd8eef6c86122`，与派工一致 |
| 已有工作 | 根 AGENTS、初始化/登记及部分公共规则有修改；设计、计划、管理网页目录未跟踪。未触碰这些内容 |
| 已读依据 | 源目录岗位配置、设计 V1、实施计划 P0、微信 README、架构及开发规则，均从指定绝对路径读取 |
| 当前实现 | 仅注册首页，显示后端连通性示例；没有业务页面、会话状态或请求分层 |
| 已知差异 | [首页](D:/AIProject/happyAnyway-clean/happyAnyway-wechat/miniprogram/pages/index/index.ts:12)直接调用 `wx.request`，不符合统一封装规则，建议纳入 W1 改造 |
| 环境配置 | `touristappid`、`http://127.0.0.1:8080`；不能据此认定真实登录或真机联调可用 |
| 检查限制 | Git 状态命令提示用户级 ignore 文件读取被拒；`rg` 无法启动，已用 PowerShell 完成文件枚举。未执行环境验收 |

**阶段 1 文件建议**

下表为待冻结的文件范围，均位于 [微信工程](D:/AIProject/happyAnyway-clean/happyAnyway-wechat)；新页面四件套指 `.ts/.wxml/.wxss/.json`。

| 范围 | 拟文件与职责 |
|---|---|
| 发现 | 修改 `miniprogram/pages/index/index.*`：公开内容单列卡片、分页、发布入口 |
| 详情 | 新增 `miniprogram/pages/post-detail/index.*`：公开详情及作者本人非公开内容、编辑/删除入口 |
| 发布/编辑 | 新增 `miniprogram/pages/post-edit/index.*`：共用表单、图片上传、校验、提交反馈 |
| 我的 | 新增 `miniprogram/pages/mine/index.*`：登录引导、本人帖子及审核状态 |
| 登录 | 新增 `miniprogram/pages/login/index.*`：登录结果及原操作续接 |
| 平台封装 | 新增 `miniprogram/platform/{request,upload,auth,storage,media}.ts`：请求、上传及微信能力入口 |
| 接口与流程 | 新增 `miniprogram/api/{types,auth,posts,images,categories}.ts`、`services/{auth,posts,images}.ts` |
| 状态与校验 | 新增 `miniprogram/state/{session,pending-action}.ts`、`utils/{money,post-validation}.ts` |
| 公共展示与配置 | 新增 `miniprogram/components/post-card/index.*`；修改 `app.json`、`app.wxss`、`config.ts`；按冻结任务更新 README |

关注、消息、互动等仍按阶段 3 实现，不以空壳页面冒充完成。阶段 1 导航安排需项目经理在任务单中明确。

**接口所需字段建议，尚非冻结契约**

| 接口用途 | 微信端所需字段 / 约定 |
|---|---|
| 登录、当前账户 | 输入临时登录 `code`；返回站内会话凭据、到期时间、`user{id,nickname,avatarUrl,accountStatus}`。凭据不得进入页面数据或日志 |
| 公开列表 / 详情 | `id,revision,title,body,images,amountFen,category,tags,location,author,publishedAt`；列表提供封面尺寸、摘要和 `nextCursor,hasMore`，可省正文 |
| 分类 | `id,name,enabled`；编辑历史停用分类时需明确保留/重选约定 |
| 图片上传 / 作者预览 | `imageId,status,width,height`、受控预览方式及有效期；明确类型、大小限制、失败重试和上传结果确认机制 |
| 新建 / 编辑 | `title,body,imageIds,amountFen,categoryId,tags,location`；编辑携带预期 `revision`；写操作携带幂等键 |
| 发布结果 / 本人列表 | `id,revision,reviewStatus,visibility,rejectionReason,canRetry,allowedActions,updatedAt` |
| 删除 / 检查重试 | 内容 ID、预期修订号、幂等键；返回当前状态，重复请求结果一致 |
| 统一错误 | `code,requestId,fieldErrors`，限流时提供可用的重试时间；区分会话失效、账号受限、无权限、内容不可用、版本冲突、上传失败与服务暂不可用 |

建议将“审核状态”和“是否可公开”分开：待检查、检查失败、人工审核、通过、拒绝不能覆盖下架/删除事实；展示及可操作性以服务端结果为准。

**阶段 1 可验收交互建议**

| 场景 | 可观察结果 |
|---|---|
| 发现 / 详情 | 分别呈现首次加载、成功、空态、失败重试；分页失败保留已有内容；重复响应不重复追加；不可用内容不继续展示旧详情 |
| 登录返回原操作 | 保存经过校验的目标页面、内容 ID、操作类型；成功只续接一次。取消/失败保留原页面；发布入口返回编辑页，提交中会话失效后保留表单并由用户再次确认提交 |
| 发布校验 | 必填标题、正文、1—9 图、金额及分类；执行 V1 字数/标签约束；0 元有效，金额按字符串精确转换整数分，拒绝超范围及多于两位小数 |
| 图片上传 | 每图显示上传中、成功、失败及重试；必需图片未成功上传时不可提交；图片访问失效可重新获取授权预览 |
| 提交不确定 | 防连点；超时不能直接认定失败并另建帖子，使用同一幂等键重试或查询结果；成功显示待检查 |
| 审核状态 | 待检查显示等待；检查失败提供服务端允许的重试；人工审核显示等待；拒绝显示原因及修改重提；通过显示公开结果 |
| 编辑 / 删除 | 编辑公开内容提交后进入重审，不继续当作公开；修订冲突提示重新加载，避免覆盖新版本；删除前确认，成功后移除并让历史详情显示不可用 |
| 我的 / 权限异常 | 区分游客引导、无帖子、加载失败；会话失效保留可恢复输入；封禁/禁言按服务端限制反馈，不反复要求登录 |

**待冻结事项与外部输入**

- **项目经理及后端需冻结**：接口路径和上述字段、游标规则、状态枚举、幂等有效期、图片限制、受控预览方案、会话失效策略、金额以外各类长度计数规则。
- **阶段边界需明确**：阶段 1 公开列表的临时排序及导航；不能将阶段 2 热门排序、城市/地点选择标为已交付。发布中的可选地点需要阶段 1 可用的城市/地点数据契约，或明确其前置依赖。
- **用户/环境负责人需提供或确认**：实际 AppID、主体及开发成员权限；指定开发者工具版本、基础库版本、iOS/Android 真机；后端 HTTPS 地址、请求/上传/图片相关域名配置；图片存储和检查服务、人工审核账号及负责人。密钥仅在服务端安全配置。
- **验证边界**：后续本地可验证类型、构建、表单和状态逻辑；真实微信登录、受控图片、检查回调及真机跨端流程需对应资源，当前均未验证。没有引用未经查询确认的外部平台能力。

**等待下一条明确派工；业务实施须待契约冻结和第三步隔离环境就绪。**
