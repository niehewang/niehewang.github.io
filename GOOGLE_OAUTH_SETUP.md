# Google Drive 授权设置

当前 v5 项目已经预置了你创建好的 Google OAuth Web Client ID，因此正常情况下重新上传 GitHub 后无需再次填写 Client ID。

## Google Cloud 端必须保持的设置

1. 已启用 **Google Drive API**。
2. OAuth 应用允许你实际使用 Drive 的 Google 账号（External + Testing 时，该账号需位于 Test users）。
3. OAuth Client 类型为 **Web application**。
4. **Authorized JavaScript origins** 包含：

   `https://niehewang.github.io`

5. Drive scope 当前使用：

   `https://www.googleapis.com/auth/drive`

## 使用

打开：

`https://niehewang.github.io/research-workbench.html`

解锁个人论文雷达后，点击 **连接 Google Drive**。浏览器会弹出 Google 官方授权窗口。授权后页面自动搜索 `paper` 文件夹，并读取目录用于去重与归档。

## 常见错误

### `Error 400: origin_mismatch`

检查 Authorized JavaScript origins 是否精确包含：

`https://niehewang.github.io`

不要带页面路径。

### `403 access_denied`

若应用仍处于 External + Testing，确认当前 Google 账号已加入 **Google Auth Platform → Audience → Test users**。

### 找不到 paper 文件夹

确认当前授权的 Google 账号里存在名为 `paper` 的文件夹。

## 关于 Client ID

OAuth Client ID 是浏览器端 Web OAuth 的公开标识，不等于 Client Secret；项目中不会包含 Client Secret。Drive Access Token 仅在当前页面内存中使用。
