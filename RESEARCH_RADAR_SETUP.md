# Research Radar v4

本版本已取消“必须部署 Research Worker 才能扫描论文”的要求。

- 论文雷达：浏览器直接查询 OpenAlex + arXiv。
- 首页论文/引用同步：默认直接查询 OpenAlex（ORCID）。
- Google Drive：使用 Google Identity Services 弹窗 OAuth；第一次只需粘贴一个 Web OAuth Client ID。
- Drive Access Token：只保存在当前页面内存，不写入 GitHub，也不写入 localStorage。
- Google OAuth Client ID：可在网页“Drive 设置”中粘贴，保存在你自己的浏览器 localStorage，不需要修改代码。

详细 Google Cloud 操作见 `GOOGLE_OAUTH_SETUP.md`。
