# P0 admin 原始回报

来源：本地任务日志 task_complete.last_agent_message。
正式任务 ID：01a0a932-ebc0-76b2-a1b6-54914404efe6；turn ID：01a0a93a-8851-7170-8064-c5ed86d3295d。
项目经理恢复原文，未改写结论；此报告不是独立测试或审查通过证明。

**DONE_WITH_CONCERNS：网页岗位 P0 只读核对完成。** 技术建议如下；接口、技术栈及隔离分支待项目经理锁定，尚不具备业务开工条件。

| 已核实事实 | 结果 |
|---|---|
| 岗位 / 正式任务 ID | 网页前端开发 Agent / `01a0a932-ebc0-76b2-a1b6-54914404efe6` |
| 实际工作目录 | `C:\Users\Administrator\.codex\worktrees\8863\happyAnyway-clean` |
| HEAD / 分支 | `26cb951a7632bf0c35b876ea902fd8eef6c86122` / detached HEAD |
| 已有工作 | Git 未列出变更；存在全局 ignore 文件读取权限警告 |
| 权威资料 | 已重新读取源目录岗位配置、设计 V1、实施计划、progress，以及执行、审查、派工三份公共规则 |
| 网页工程现状 | 源目录 `happyAnyway-admin/` 只有 `agent.md`；无源码、工程说明、依赖或现成检查命令 |

**技术栈建议**

| 选择 | 组合及理由 |
|---|---|
| 主推 | Vue 3 + TypeScript + Vite + Vue Router + Element Plus；适合当前以表格、筛选、表单和审核详情为主的精简后台。采用单页应用，接口层集中封装，阶段 1 使用轻量会话状态即可 |
| 备选 | React + TypeScript + Vite + React Router；若后续维护人员熟悉 React 可选，否则本项目目前没有需要沿用的 React 资产 |

上述选择属于工程建议。Vue 官方支持 Vite、TypeScript 工程，Element Plus 为 Vue 3 组件库；React 官方也提供从 Vite 建立应用的路线。[Vue TypeScript](https://vuejs.org/guide/typescript/overview)、[Element Plus](https://element-plus.org/en-US/)、[React 工程路线](https://react.dev/learn/build-a-react-app-from-scratch)。版本及 Node 兼容范围在建项前核定并锁定。

**阶段 1 页面与接口草案——均未冻结**

| 页面/能力 | 建议需求及可验收状态 |
|---|---|
| 管理登录 `/login` | 部署创建的管理员账号登录，无公开注册；显示提交中、凭据错误、限流、网络失败；登录成功返回站内原路由，不自动重放审核写操作 |
| 导航与会话 | 阶段 1 展示“内容审核”、管理员身份和退出；举报、账号、分类、日志按 G2 交付后启用；直接访问路由也校验会话 |
| 审核列表 `/reviews` | 显示待人工审核项、标题、作者、修订版本、提交时间、转人工原因；支持分页，保留筛选；明确加载、空态、失败、无权限 |
| 审核详情 `/reviews/:id` | 展示该修订完整图文、整数分换算金额、分类标签、可选地点及检查结果；图片受控读取；显示通过/拒绝、处理中、失败、已处理、版本过期或内容不可用 |
| 审核操作 | 拒绝必须填写原因；提交期间防重复；超时先查询结果，重试复用幂等键；409 冲突刷新详情，不覆盖其他管理员或新版内容 |

| 建议接口 | 最小契约 |
|---|---|
| `POST /api/admin/sessions`、`GET /api/admin/me`、`DELETE /api/admin/sessions/current` | 登录凭据、管理员 ID/名称/权限、会话到期信息；建议同源 HttpOnly 会话 Cookie，写请求配套 CSRF 防护，具体由后端契约冻结 |
| `GET /api/admin/reviews?status=…&cursor=…&limit=…` | `items,nextCursor`；每项含 `reviewId,contentId,revisionId,title,author,submittedAt,reviewStatus,triggerReason` |
| `GET /api/admin/reviews/{reviewId}` | 修订快照、当前可操作状态、文字及逐图检查状态、受控图片标识、审核记录；区分“待检查/检查失败”和“待人工审核” |
| `POST /api/admin/reviews/{reviewId}/decisions` | `revisionId,expectedVersion,decision,reason`，另带幂等键；返回最终审核状态、内容状态、审计标识；服务端核验权限、版本及状态 |
| 统一错误 | 建议 `code,message,requestId,fieldErrors`；区分 401 会话失效、403 无权限、404 内容不可用、409 冲突、422 输入错误、429 限流和 5xx 失败 |

人工审核仅处理服务端确认可人工处置的修订；检查失败不得因页面操作自动转公开。按钮隐藏不替代服务端授权。

**建议工程范围与检查**

以下均为未来拟建路径，相对于获派的 `happyAnyway-admin/`，当前不存在：

| 拟建范围 | 用途 |
|---|---|
| `package.json`、锁文件、`vite.config.ts`、`tsconfig*.json`、ESLint/Vitest/Playwright 配置、`index.html` | 工程及验证配置 |
| `src/main.ts`、`App.vue`、`router/index.ts`、`layouts/AdminLayout.vue` | 入口、导航、路由 |
| `src/api/{client,auth,reviews}.ts`、`src/types/admin.ts`、`src/state/session.ts` | 接口契约、错误及会话处理 |
| `src/views/LoginView.vue`、`ReviewListView.vue`、`ReviewDetailView.vue`、`ForbiddenView.vue` | 阶段 1 页面 |
| `src/components/`、`src/styles/`、`src/**/*.spec.ts`、`e2e/` | 共用状态/图片组件、样式及行为验证 |
| `README.md`、`ARCHITECTURE.md`、工程开发规则 | 启动、部署、权限边界与验证说明 |

建议未来在工程目录定义下列脚本，**本次未创建或执行**：

| 命令 | 拟映射及验证目标 |
|---|---|
| `npm run lint` | `eslint . --max-warnings 0`，不自动修复 |
| `npm run typecheck` | `vue-tsc --noEmit` |
| `npm run build` | `vite build` |
| `npm run test:unit` | `vitest run`；验证错误映射、会话失效、审核冲突与重复提交行为 |
| `npm run test:e2e` | `playwright test`；验证登录、无权限、审核通过/拒绝/失败及旧版本冲突 |

测试工具选择依据：[Vue 测试指南](https://vuejs.org/guide/scaling-up/testing.html)、[Vitest](https://vitest.dev/guide/)、[Playwright 命令](https://playwright.dev/docs/running-tests)。模拟接口验证须明确标记；真实审核状态和权限须另有后端联调证据。

**待落实项**

- **项目经理与后端冻结**：技术栈、接口路径/字段/枚举、人工审核可操作状态、分页、幂等与并发规则、拒绝原因长度、会话及图片鉴权方式。
- **需要用户或部署负责人提供**：管理域名和部署方式、目标浏览器、审核负责人及管理员账号配置渠道；密钥不进入聊天或仓库。
- **实施门槛**：明确当前 worktree 分支、同步权威资料、完成工程建立后的真实基线检查。

本次仅读取资料与官方文档，未修改文件、安装、构建、运行业务测试、提交或创建子 Agent。报告即本回复，由项目经理登记；等待下一条明确派工。
