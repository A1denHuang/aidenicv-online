# AidenICV 数字花园

一个基于 [Quartz](https://quartz.jzhao.xyz/) 的 Obsidian Markdown 个人知识库。网站是纯静态的，支持中文路径、Wiki 双向链接、反向链接、离线全文搜索、知识图谱、KaTeX、Shiki 代码高亮和深浅色主题。

## 本地运行

需要 Node.js 24（最低要求见 `package.json`）与 npm 10.9.2 以上。

```bash
npm ci
npm run install-plugins
npm run dev
```

浏览器打开 `http://localhost:8080/`。只构建静态文件时运行：

```bash
npm run build
```

构建产物位于 `public/`。

## 用 Obsidian 维护内容

1. 在 Obsidian 中选择“打开本地仓库”，把本项目的 `content/` 目录作为 Vault。
2. 新建普通 `.md` 文件即可；站内链接推荐写成 `[[文件名]]`、`[[路径/文件名|显示文字]]` 或 `[[文件名#标题]]`。
3. 每篇公开笔记建议包含 YAML Frontmatter：`title`、`description`、`date`、`updated`、`tags` 和 `draft`。
4. 图片放在 `content/assets/`，使用相对 Markdown 路径引用。
5. `draft: true` 的笔记不会出现在生产站点。

`.obsidian/`、`.trash/`、`private/` 与 `templates/` 已忽略，不会提交 Obsidian 缓存、模板或私密笔记。不要把密钥写入 Markdown 或 Git 历史。

## 常用修改位置

| 想修改的内容                      | 文件                           |
| --------------------------------- | ------------------------------ |
| 网站名称、介绍、GitHub 与社交链接 | `site.config.ts`               |
| 域名、语言、字体、颜色与插件      | `quartz.config.yaml`           |
| 首页模块                          | `content/index.md`             |
| 知识目录和文章                    | `content/`                     |
| 三栏、正文与响应式样式            | `quartz/styles/custom.scss`    |
| 自动部署流程                      | `.github/workflows/deploy.yml` |

新增内容后先运行 `npm run build`。构建日志会提示无法解析的内部链接；应在发布前修正。该命令也会把 KaTeX 的 CSS、脚本和字体复制到 `public/static/katex/`，因此线上公式不依赖第三方 CDN。

## GitHub Pages 部署

工作流会在推送到 `master` 后自动执行：安装依赖、安装 Quartz 插件、构建 `public/`，再部署到 GitHub Pages。

首次启用：

1. 打开 GitHub 仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 推送到 `master`，在 **Actions** 页面等待 `Deploy Quartz to GitHub Pages` 完成。
4. 当前 `site.config.ts` 的 `baseUrl` 已配置为 `A1denHuang.github.io/aidenicv-online`，对应仓库子路径地址。

如果默认分支以后改名为 `main`，同步修改 `.github/workflows/deploy.yml` 中的触发分支。

## 自定义域名

切换到 `aidenicv.online` 时：

1. 把 `site.config.ts` 中的 `baseUrl` 改为 `aidenicv.online`。
2. 将 `quartz.config.yaml` 的 `@quartz-community/cname` 插件改为 `enabled: true`。
3. 在 GitHub **Settings → Pages → Custom domain** 填写域名，并按 GitHub 返回的记录修改 DNS。
4. 域名验证成功后开启 **Enforce HTTPS**。

切换完成前不要删除旧托管记录，以免当前线上站点意外中断。

## 已实现

- 响应式三栏布局；桌面显示文件树、正文、目录/图谱/反链，移动端折叠导航
- Obsidian Wiki 链接、标题锚点、Callout、任务列表、表格、引用、脚注与高亮
- KaTeX 数学公式、Shiki 代码高亮和代码复制
- 静态离线全文搜索，支持键盘选择与关闭
- 内部链接悬浮预览（移动端自动关闭）
- 当前页面局部图谱及全局图谱入口
- SPA 式页面切换、可分享 URL、浏览器前进/后退
- 深浅色主题持久化、目录阅读位置高亮、返回顶部
- sitemap.xml、RSS、Open Graph、友好 404
- GitHub Actions 自动部署与仓库子路径配置
- 示例中文 Vault 内容与 SVG 技术插图

## 当前限制

- “最近更新”和“精选笔记”目前在首页 Markdown 中手工维护，以便完全控制排序与说明。
- 示例文章的上一篇、下一篇与相关笔记使用 Markdown 显式维护；新增文章时需同步更新相邻页面。
- Quartz 的本地搜索需要页面首次加载后下载站内静态索引；它不依赖外部搜索服务。
- 自定义域名的 CNAME 插件默认关闭，避免在 GitHub Pages 子路径预览阶段错误接管现有域名。

## 许可证

网站构建框架 Quartz 及本仓库保留的框架代码遵循其 MIT 许可证。个人笔记内容的再使用许可可在正式公开前另行声明。
