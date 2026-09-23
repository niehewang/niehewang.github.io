# Research Radar 一次性配置

新版个人主页仍然是 **GitHub Pages 静态站点**。为了实现 Google Scholar 实时同步、最近一年论文检索，以及 Google Drive `/paper` 去重/归档，新增一个很小的 Cloudflare Worker 和 Google 官方 OAuth。

> 安全原则：`SERPAPI_KEY` 永远不进入 GitHub；Google Drive Access Token 只存在浏览器当前页面内存，不写入 localStorage，也不会发送给 Worker。

## 1. 部署 Research Worker

目录：`backend/research-worker/`

需要 Node.js，然后在该目录执行：

```bash
npm install -g wrangler
wrangler login
wrangler secret put SERPAPI_KEY
wrangler secret put SCHOLAR_AUTHOR_ID
wrangler deploy
```

### SERPAPI_KEY

Google Scholar 没有官方公开 API。这里使用 SerpAPI 的 Google Scholar Author API 获取作者论文列表和每篇论文的 `cited_by` 数量。

### SCHOLAR_AUTHOR_ID

打开你的 Google Scholar 个人主页，URL 类似：

```text
https://scholar.google.com/citations?user=XXXXXXXXXXX&hl=zh-CN
```

把 `user=` 后面的 `XXXXXXXXXXX` 作为 `SCHOLAR_AUTHOR_ID`。

部署后会得到类似：

```text
https://nhw-research-radar.<account>.workers.dev
```

把它填到 `assets/research-config.js` 的 `workerUrl`。

## 2. 创建 Google OAuth Web Client

在 Google Cloud Console：

1. 创建/选择一个项目。
2. 启用 **Google Drive API**。
3. 配置 OAuth consent screen。若应用保持 Testing，只需把你自己的 Google 账号加入 Test users。
4. 创建 **OAuth Client ID → Web application**。
5. Authorized JavaScript origins 添加：
   - `https://niehewang.github.io`
   - 本地调试时可再加 `http://localhost:8000`
6. 得到形如 `xxxx.apps.googleusercontent.com` 的 Client ID。
7. 将它填到 `assets/research-config.js` 的 `googleClientId`。

这里**不需要、也绝不能**把 OAuth Client Secret 放进网站。

工作区第一次连接 Drive 时会请求 `https://www.googleapis.com/auth/drive`。这是为了：

- 找到你现有的 `paper` 文件夹；
- 列出其中已有 PDF；
- 使用 Drive 的 `fullText contains` 索引做第三层去重；
- 将你勾选的开放 PDF 直接写入该文件夹。

Access Token 只保存在当前标签页内存，刷新页面后需要重新授权。

## 3. 首页 Google Scholar 同步

配置 Worker 后，主页“论文发表 / Publications”区域会出现：

**同步 Google Scholar / Sync Google Scholar**

页面会优先显示本地缓存；配置 Worker 后，每 6 小时最多自动刷新一次，你也可以随时手动点击按钮强制刷新。

手动点击后：

1. Worker 使用固定的 `SCHOLAR_AUTHOR_ID` 查询你的 Scholar profile；
2. 返回最多 100 条作者论文及每篇引用数；
3. 已在主页中的论文按标准化标题匹配并显示 `Google Scholar 引用: N`；
4. Scholar 中存在、主页静态列表中尚不存在的条目会显示在“Google Scholar 同步发现的新条目”区域；
5. 数据缓存在浏览器，同时 Worker 对 Scholar 查询做 6 小时公共缓存，避免反复消耗 API 配额。

动态同步不会自动改写 GitHub 仓库里的 `index.html`，但网页会立即显示新论文和最新引用数。若要让“静态源码本身”也永久增加新论文，仍建议定期把确认过的条目写回 `index.html`，以便搜索引擎抓取。

## 4. Research Radar 工作区

入口：`research-workbench.html`

点击 **扫描最近一年** 后：

- 从 OpenAlex 获取近 365 天候选；
- 从 arXiv API 补充最新预印本；
- 仅保留来源属于：
  - IEEE Transactions；
  - CCF 第七版 A 类期刊/会议；
  - arXiv；
- 再按三个研究邻域分类：
  - **核心相关**：模型水印、确权、指纹、归因、版权、provenance；
  - **相邻安全**：后门、模型窃取、机器遗忘、模型编辑、隐私、鲁棒性、取证等；
  - **跨域启发**：密码承诺、统计检验、conformal inference、信息论、纠错码、因果、异常检测、表示相似性等。

### 三种探索宽度

- `Focused`：核心为主，只保留少量相邻安全；
- `Balanced`：默认。核心 + 相邻 + 少量跨域启发；
- `Explore`：明显增加跨域方法论文，但来源质量约束不变。

### Drive 去重

按三层完成：

1. DOI / arXiv ID / Radar metadata；
2. 文件名与英文标题 token 相似度；
3. 对仍未确认的候选，使用 Google Drive PDF 全文索引中的多个稀有标题词进行 `fullText contains` 查询。

因此，即使你把英文论文 PDF 改成中文文件名，也有机会通过 PDF 内部英文正文识别为“已经存在”。

### 一键归档

只有存在合法开放 PDF 的论文才可以勾选归档。系统不会绕过 IEEE/ACM 等付费墙。

勾选多篇 → **归档选中论文到 Drive**：

1. Worker 根据 arXiv ID 或 OpenAlex Work ID重新解析公开 PDF 地址；
2. 浏览器拿到 PDF；
3. 浏览器直接用当前 Google OAuth Token 上传到 `/paper`；
4. 新文件写入 DOI / arXiv ID / Radar ID 元数据，之后去重更准确。

## 5. 本地调试

不要直接双击 HTML。建议：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

确保该 origin 已加入 Google OAuth Client 的 Authorized JavaScript origins。

## 6. 文件说明

- `assets/research-config.js`：公开配置，仅保存 Worker URL 和 Google OAuth Client ID。
- `backend/research-worker/worker.js`：Cloudflare Worker 源码。
- `backend/research-worker/wrangler.toml`：Worker 部署配置。
- `research-workbench.html`：论文雷达工作区。
- `assets/workbench.js`：Drive OAuth、去重、多选归档、灵感篮子。
- `assets/site.js`：主页 Scholar 同步与引用数显示。

