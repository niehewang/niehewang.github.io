# Research OS v6

正常使用无需 Cloudflare Worker、SerpAPI 或其他后端。

- OpenAlex / arXiv：浏览器直接查询。
- Google Drive：Google Identity Services OAuth 弹窗授权。
- OAuth Client ID 已预置在 `assets/research-config.js`。
- Google Drive 权限用于读取、移动、重命名和上传你确认的文件。

如果未来更换域名或 OAuth Client ID，再修改 Google Cloud 的 Authorized JavaScript origins 和 `assets/research-config.js` 即可。
