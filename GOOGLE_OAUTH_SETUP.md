# Google Drive 授权设置（只需做一次）

目标：让 `https://niehewang.github.io/research-workbench.html` 点击“连接 Google Drive”后弹出 Google 官方授权窗口，并允许 Research Radar 读取你的 `paper` 文件夹、做去重和上传论文。

> 你不需要 Cloudflare、不需要服务器、不需要 Client Secret，也不需要把 Access Token 写进 GitHub。

## 1. 创建 / 选择 Google Cloud 项目

1. 打开 Google Cloud Console：`https://console.cloud.google.com/`
2. 点击页面顶部的项目选择器。
3. 点击 **New Project / 新建项目**。
4. 项目名可以填：`Hewang Research Radar`。
5. 点击 **Create / 创建**，然后确认页面顶部当前选中的就是这个项目。

## 2. 启用 Google Drive API

1. 左上角菜单 → **APIs & Services / API 和服务** → **Library / 库**。
2. 搜索：`Google Drive API`。
3. 点进 **Google Drive API**。
4. 点击 **Enable / 启用**。

## 3. 配置 Google Auth Platform / OAuth 同意屏幕

1. 左侧菜单进入 **Google Auth Platform** → **Branding**。
2. 如果显示 **Get Started / 开始使用**，点击它。
3. App name：`Hewang Research Radar`。
4. User support email：选择你自己的 Google 邮箱。
5. Audience：
   - 如果可以选择 **Internal**，并且你准备用同一 Google Workspace 组织账号访问，可以选 Internal；
   - 否则选 **External**（个人 Gmail 通常选这个）。
6. Contact Information：填写你自己的邮箱。
7. 勾选 Google API Services User Data Policy，然后完成创建。

### 如果你选择了 External

1. 进入 **Google Auth Platform → Audience**。
2. 找到 **Test users**。
3. 点击 **Add users**。
4. 把你实际用于 Google Drive 的那个 Google 账号邮箱加进去。
5. 保存。

只给自己使用时，可以一直保持 Testing，不必为了这个私人工作台去做完整的公开应用审核。页面每次连接 Drive 时获取短期 Access Token，关闭页面后不会保存长期 Token。

## 4. 添加 Drive 权限范围

1. 进入 **Google Auth Platform → Data Access**。
2. 点击 **Add or Remove Scopes**。
3. 搜索 / 添加：
   `https://www.googleapis.com/auth/drive`
4. 保存。

Research Radar 当前使用这个权限，是因为它需要自动找到你已经存在的 `paper` 文件夹、读取其中已有 PDF 的元数据/全文索引，并把新 PDF 上传到这个文件夹。

## 5. 创建 OAuth Client ID

1. 进入 **Google Auth Platform → Clients**。
2. 点击 **Create Client**。
3. Application type：选择 **Web application**。
4. Name：例如 `Nie Homepage GitHub Pages`。
5. 在 **Authorized JavaScript origins** 下点击 **Add URI**。
6. 精确填写：

   `https://niehewang.github.io`

   注意：
   - 必须是 `https`；
   - 不要填 `/research-workbench.html`；
   - 不要在最后加 `/`；
   - 不要填 GitHub 仓库地址。

7. **Authorized redirect URIs** 这里可以留空。这个项目使用 Google Identity Services 的浏览器 Token Popup 流程，不需要你自己部署 redirect endpoint。
8. 点击 **Create**。

## 6. 复制 Client ID

创建完成后会看到类似：

`123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

只复制 **Client ID**。

不要把 Client Secret 填到网页里；这个项目完全不需要 Client Secret。

## 7. 在你的主页里连接 Drive

1. 确保新版项目已经上传到 GitHub Pages。
2. 打开：`https://niehewang.github.io/research-workbench.html`
3. 点击右上角 **连接 Google Drive**。
4. 第一次会弹出一个小设置框。
5. 粘贴刚才的 Client ID → **保存**。
6. 页面会继续弹出 Google 官方授权窗口。
7. 选择刚才加入 Test users 的 Google 账号。
8. 同意 Drive 权限。
9. 页面会自动搜索名为 `paper` 的文件夹，并读取其中的文件。

以后同一浏览器不需要再次输入 Client ID；通常只需要在 Access Token 过期或重新打开页面后再次点击“连接 Google Drive”。

## 常见错误

### `Error 400: origin_mismatch`

检查 OAuth Client 的 **Authorized JavaScript origins** 是否精确包含：

`https://niehewang.github.io`

不要带路径，也不要多一个尾部 `/`。

### `Error 403: access_denied` / “Access blocked”

如果 Audience 是 External + Testing：确认你当前登录的 Google 账号已经加入 **Audience → Test users**。

### “Google hasn't verified this app”

私人测试应用使用受限 Drive scope 时可能出现测试警告。确认页面显示的是你自己创建的 `Hewang Research Radar`，并且你使用的是自己添加到 Test users 的账号。

### 授权成功，但显示找不到 `paper`

确认你的 Google Drive 根目录或可搜索位置中确实有一个名字精确为 `paper` 的文件夹。大小写不同会被视为不同名称。

### Client ID 粘错了

在工作区右上角点 **Drive 设置**，重新粘贴并保存即可。
