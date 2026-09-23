# Hewang Nie — Research OS v6

这是个人主页的私有科研工作区。它保持纯静态 GitHub Pages 部署，不新增服务器依赖。

## v6 核心功能

- 今日科研：从 Radar、Drive 项目、阅读待处理、论文库健康中生成下一步提示。
- 多研究方向 Radar：模型版权/模型安全、具身智能/双臂抓取、跨域方法灵感。
- Drive 项目监视：登记长期项目目录，查看最近变动和材料结构。
- Experiment Inspector：识别 seed、retry、status/result/log 等实验文件线索。
- 阅读笔记：论文一键生成结构化 Markdown 阅读卡，可上传回 Drive。
- 项目继续包：生成 `PROJECT_CONTEXT_*.md`，用于新会话或隔一段时间继续项目。
- `/paper` 健康检查：重复组、临时命名、纯 arXiv 编号文件等。
- Drive 整理中心：扫描后人工确认批量重命名/移动，可新建分类文件夹；没有删除功能。

## 隐私

Google Drive access token 只存在当前浏览器页面内存，不写入 GitHub 或 localStorage。
项目目录 ID、摘要、阅读卡等只保存在你的浏览器 localStorage 或你主动上传的 Google Drive 中。
工作区密码属于 GitHub Pages 前端门禁，不是服务器级访问控制。
