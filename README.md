# niehewang.github.io — Research Radar v5

Hewang Nie 的静态 GitHub Pages 学术主页与个人 Research Radar。

## v5 主要变化

- Research Radar 增加个人访问门禁；解锁状态只保留在当前浏览器标签页会话中，并提供“锁定”按钮。
- Google OAuth Web Client ID 已预置，部署到 `https://niehewang.github.io` 后可直接点击“连接 Google Drive”。
- 论文来源扩展为 **IEEE Transactions + ACM Transactions + CCF A + arXiv**。
- 默认检索主题显著扩展，不再只盯模型水印：同时覆盖 ML/LLM/生成模型安全、后门、投毒、模型窃取、隐私、模型编辑/遗忘、AI 取证、深伪、数据/模型 provenance、可信 AI、联邦学习安全，以及密码学验证、统计推断、信息论、异常/OOD、表示学习、因果推断、影响函数、数据估值等可迁移方法。
- Balanced / Explore 模式增加检索种子与候选配额，并对主题词做均匀抽样，避免只搜索列表前几项。
- Google Drive `/paper` 去重仍使用 DOI/arXiv ID、文件名/metadata 与 Drive 全文索引。
- 主页论文/引用同步继续使用公开 OpenAlex 数据，无需额外后端。

## 页面

- `index.html` — 双语学术主页。
- `research-workbench.html` — 私人 Research Radar。
- `ccf-2026.html` — CCF 第七版目录查询。

## 关键文件

- `assets/research-config.js` — 公开配置（Google OAuth Client ID、ORCID、paper 文件夹名等）。OAuth Client ID 不是密码。
- `assets/radar-gate.js` — Research Radar 的前端访问门禁。
- `assets/workbench.js` — 论文发现、Drive OAuth、去重、归档与灵感篮子逻辑。
- `assets/ccf-a-2026.js` — CCF A 类 venue 数据。
- `GOOGLE_OAUTH_SETUP.md` — Google OAuth 配置说明与排错。

## 安全说明

Research Radar 的密码门禁运行在纯静态 GitHub Pages 前端，因此它适合“防普通访客误入/随手访问”，但不能替代真正的服务器端身份认证。熟悉前端的人仍可能绕过页面门禁。若未来需要真正的访问控制，应使用 Cloudflare Access、反向代理登录或其他服务端认证方案。

Google Drive Access Token 仅保存在当前页面运行内存，不写入仓库或 localStorage。
