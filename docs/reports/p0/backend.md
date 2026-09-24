# P0 backend 原始回报

来源：本地任务日志 task_complete.last_agent_message。
正式任务 ID：01a0a82d-2ce7-7770-a0e4-5f64eee72402；turn ID：01a0a93a-6e48-7940-886a-2b761dbee771。
项目经理恢复原文，未改写结论；此报告不是独立测试或审查通过证明。

**DONE_WITH_CONCERNS：P0 后端只读核对完成。** 接口草案可供冻结；外部资源、部分契约和隔离环境尚未确定，不能进入业务实施。

**事实与基线**

| 项目 | 核对结果 |
|---|---|
| 身份 | 后端开发；任务 ID `01a0a82d-2ce7-7770-a0e4-5f64eee72402` |
| 实际目录 | `D:\AIProject\happyAnyway-clean`，尚未隔离 |
| HEAD | `26cb951a7632bf0c35b876ea902fd8eef6c86122`，与派工一致 |
| 已有工作 | 根配置、公共规则及岗位登记有修改；设计、计划、管理网页目录未跟踪；状态未显示后端修改。全部保留 |
| 已读资料 | 绝对路径下的后端岗位配置、README、架构、开发规则、设计 V1、实施计划、progress；读取了全部现有 `src` 文件及 `pom.xml` |
| 实际源码 | 仅启动、OpenAPI、安全配置、Profile 防混用及基础测试；无业务接口、账户、Mapper SQL 或业务迁移 |
| 安全现状 | 仅健康检查与 local 文档放行，其余 `denyAll`；尚无认证实现。新接口须明确配置权限与 CSRF 策略 |
| 验证边界 | 未构建、运行测试、安装依赖或修改文件。Git 提示全局 ignore 不可读；不影响本次 HEAD 读取，但状态检查有该环境告警 |

以下均为**建议，尚未冻结**；路径统一以 `/api/v1` 开头。

| 能力 | 接口草案 | 主要请求／返回与权限 |
|---|---|---|
| 微信登录 | `POST /auth/wechat` | 请求 `code`；返回站内 `accessToken, expiresAt, user{id,nickname,avatarUrl}`。微信凭据仅留服务端；不接受客户端指定用户身份 |
| 当前账户／退出 | `GET /me`、`DELETE /auth/session` | 用户身份读取／撤销当前站内会话 |
| 图片上传 | `POST /images`，multipart | 已登录；返回 `imageId,status,width,height`。校验真实文件类型、大小、解码结果及所有者；图片检查随帖子修订绑定 |
| 图片读取 | `GET /images/{id}/content` | 服务端校验：公开帖子可游客读；待审图片仅所有者或授权审核员可读；不返回公开原图存储地址 |
| 分类 | `GET /categories` | 返回 `id,name,enabled`；新提交只能选择启用项，历史分类信息保留 |
| 提交图文 | `POST /posts` | `title,body,imageIds[],costFen,categoryId,tags[],location`；返回 `id,revision,status,checkStatus,createdAt`，正常接收为 `202` |
| 编辑／删除 | `PUT /posts/{id}`、`DELETE /posts/{id}` | 所有者；编辑携带 `expectedRevision` 和完整内容，创建新修订并立即撤销公开资格；删除重复执行不重复产生副作用 |
| 公开浏览 | `GET /posts`、`GET /posts/{id}` | 游客只能读公开内容；列表 `items,nextCursor`；详情返回内容、作者、图片、金额、分类标签及地点 |
| 我的内容 | `GET /me/posts`、`GET /me/posts/{id}` | 仅本人；额外返回修订、检查状态、拒绝原因、`retryAllowed` |
| 检查重试 | `POST /posts/{id}/check-retries` | 本人、指定修订；仅失败且允许重试时接收，同一修订不重复创建活动任务 |
| 检查回调 | `POST /integrations/moderation/{provider}/callbacks` | 外部适配入口；验证供应商规定的来源凭据、事件去重及任务对应关系，不能使用普通用户认证替代 |
| 管理登录 | `POST /admin/auth/session`、`GET/DELETE /admin/auth/session` | 独立管理员身份；登录 `username,password`，返回管理员信息，会话建议使用 HttpOnly Cookie |
| 人工审核 | `GET /admin/reviews`、`GET /admin/reviews/{id}`、`POST /admin/reviews/{id}/decision` | 审核员；决定 `expectedRevision,decision,reason`；拒绝原因必填，过期版本返回冲突；操作留审计 |

**数据、状态与一致性建议**

- 主要表：用户及微信身份绑定、用户会话、管理员及管理会话、帖子、不可变帖子修订、图片及修订图片关联、分类、标签关联、检查任务与检查项、回调收件记录、审核记录、管理审计、幂等记录。检查任务通过 MySQL 持久化调度，不新增队列产品。
- 内容状态建议为 `PENDING_CHECK / MANUAL_REVIEW / PUBLISHED / REJECTED / TAKEN_DOWN / DELETED`；检查执行状态另设 `QUEUED / RUNNING / FAILED / COMPLETED`。失败保持不公开；全部文字和图片通过才能公开；风险异常转人工。
- 回调按 `providerEventId` 去重，并核对 `postId + revision + checkTaskId + attempt`。状态更新必须有数据库条件约束；旧修订、旧尝试、已删除或已下架内容的结果只能留记录，不能恢复公开。人工决定同样校验当前版本。
- 图片始终私有存储，受控读取避免编辑重审后旧公开链接继续泄露；禁止公开缓存待审原图。外部检查若需取图，提供专用受限取图机制，具体按供应商能力冻结。
- `costFen` 必须是 `0—9999999` 的整数；图片 `1—9` 张、标签最多 `5` 个、标题 `40`、正文 `3000`、标签 `12` 的限制沿用 V1。建议统一按 Unicode 码点计数，明确去首尾空白后校验。
- `location` 建议为 `null` 或 `{cityCode,placeName?,latitude?,longitude?,coordinateSystem?}`；经纬度成对出现，不能猜测坐标系。ID 返回字符串，时间使用 UTC ISO 8601。
- 用户侧建议随机不透明 Bearer token，服务端保存摘要及有效期；管理员使用独立 Cookie 会话、CSRF 防护和独立权限。受限写操作每次检查账号限制，不能只在登录时检查。
- 创建、重试及审核决定使用 `Idempotency-Key`：按身份、操作和 key 唯一约束；相同载荷重放原结果，不同载荷返回 `409`。编辑另用修订号防覆盖；重复请求仍须先检查当前权限。
- 错误统一 `{code,message,requestId,fieldErrors?}`：`400 VALIDATION_ERROR`、`401 AUTH_REQUIRED/SESSION_EXPIRED`、`403 ACCOUNT_RESTRICTED/ADMIN_REQUIRED`、`404 CONTENT_UNAVAILABLE`、`409 REVISION_CONFLICT/IDEMPOTENCY_CONFLICT/INVALID_STATE`、`413 IMAGE_TOO_LARGE`、`415 IMAGE_TYPE_UNSUPPORTED`、`429 RATE_LIMITED`、`503 DEPENDENCY_UNAVAILABLE`。异步检查失败通过内容状态反馈，不把已经接收的发布伪装成未创建。

**冻结前的问题及输入**

| 类别 | 需明确事项／建议 |
|---|---|
| 项目经理契约决定 | token 有效期及重新登录方式；幂等保留时间；列表游标与阶段 1 临时排序。V1 首页默认热门，阶段 1 若先实现最新排序，须明确只是阶段交付，不能当最终验收 |
| 产品边界待明确 | “检查失败”是否允许管理员直接审核通过，还是必须检查恢复后才能转人工；建议失败保持待检查，避免人工入口绕过“全部检查通过”要求 |
| 产品边界待明确 | 已下架帖子能否编辑重提；停用分类的历史帖子编辑时是否必须换分类；这些不能由实现自行决定 |
| 建议参数待冻结 | 图片首版 JPEG/PNG、单张最多 10 MiB，并设置像素上限；发布及编辑合计每账号每分钟 5 次、每日 50 次，检查重试每修订每分钟 1 次；均为草案，不改变已确认数量限制 |
| 用户／部署负责人输入 | AppID 主体与能力、登录与检查服务授权、私有图片存储及部署域名、真实 MySQL 测试环境、管理员创建方式及人工审核负责人；密钥只通过安全配置交付 |
| 外部能力核验 | 供应商尚未确定，本次未假定微信具备全部检查能力，未引用未经核验的配额、回调格式或图片访问能力；选定后需查官方文档并验证 |

**后续可验证范围**

- 获准实施后可本地验证：字段边界、所有权、状态机、修订冲突、重复请求、旧回调隔离、管理员越权、图片访问权限；替身须显式标记。
- 必须另有真实证据：MySQL 迁移及并发事务、微信登录、私有存储访问与撤权、内容检查及回调、HTTPS 与跨端联调。local 无数据库测试不能替代这些结果。
- 本次报告仅在回复中交付，由项目经理登记 progress；无正式审查或测试通过结论。

**等待下一条明确派工。**
