# happyAnyway 微信小程序


## 技术栈

原生微信小程序、TypeScript 5.9.3、ESLint 9.39.4；需要 Node.js 22+ 和微信开发者工具。

## 启动小程序

在本目录（happyAnyway-wechat）打开 PowerShell：

~~~powershell
npm ci
npm run dev
~~~

用微信开发者工具导入 happyAnyway-wechat/，将 touristappid 替换为自己的小程序 AppID。TypeScript 由上述命令编译为开发者工具可读取的 JavaScript。

后端运行后，点击首页“检查后端连接”。本机调试 127.0.0.1 时，在开发者工具的本地设置中关闭请求合法域名校验；该设置仅用于本地调试。真机访问需修改 miniprogram/config.ts 中的地址，并配置可访问的 HTTPS 服务和小程序合法域名。

~~~powershell
npm run lint
npm run typecheck
npm run build
~~~

## 迁移入口

页面位于 miniprogram/pages/，应用入口为 miniprogram/app.ts，页面注册在 miniprogram/app.json，后端请求地址在 miniprogram/config.ts。逐步将需要的页面和调用代码迁入即可。

## 工程规则

- [开发 Agent 配置](agent.md)

- [项目结构与职责边界](ARCHITECTURE.md)
- [开发规则](docs/rules/development.md)
