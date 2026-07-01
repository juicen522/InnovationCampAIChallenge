# AI 提示词挑战

这是一个静态网页版本的 AI 提示词挑战活动工具，包含挑战分配、现场投票、结果看板和管理后台。

## 页面入口

- `index.html`：首页入口，会自动打开主持工具页。
- `AI Prompt Challenge.html`：主持工具页，用于随机分配挑战卡、调整小组和题目。
- `vote.html`：投票页，参与者选择奖项投票。
- `results.html`：结果页，展示实时投票结果。
- `admin.html`：管理后台，用于开始/停止投票、清空票数、导出结果。

## 本地启动

在项目根目录运行：

```powershell
cd "C:\Users\shuai.liu\Documents\创意营AIChallenge"
C:\Users\shuai.liu\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 8000 --bind 127.0.0.1
```

浏览器打开：

```text
http://127.0.0.1:8000/
```

管理后台：

```text
http://127.0.0.1:8000/admin.html
```

默认管理员密码：

```text
admin123
```

## 数据说明

当前版本使用浏览器 `localStorage` / `sessionStorage` 保存配置、挑战分配、投票记录和投票状态。它不会写入原项目的远程数据库。

这意味着：

- 同一台设备、同一个浏览器里可以完整演示流程。
- 换浏览器或换设备后，数据不会自动同步。
- 如果要给多人真实线上投票，需要接入远程数据库或后端 API。

## 部署方式一：GitHub Pages

1. 在 GitHub 新建一个仓库，例如 `ai-prompt-challenge-cn`。
2. 把本项目根目录里的文件提交并推送到仓库。
3. 进入仓库 `Settings` -> `Pages`。
4. `Source` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub Pages 生成网址。

部署后访问：

```text
https://你的用户名.github.io/仓库名/
```

## 部署方式二：Netlify 或 Vercel

这是纯静态项目，不需要构建命令。

Netlify：

- 拖拽整个项目文件夹到 Netlify Drop，或连接 Git 仓库。
- Build command 留空。
- Publish directory 填项目根目录，通常是 `.`。

Vercel：

- 导入 Git 仓库。
- Framework Preset 选择 `Other`。
- Build Command 留空。
- Output Directory 留空或填 `.`。

## 真实多人投票提醒

当前本地存储版适合复刻、演示、单机活动或现场主持端展示。如果希望不同手机扫码后票数汇总到同一个线上结果页，需要把 `voting-config.js` 里的本地数据层替换成 Supabase、Firebase、Bmob 或你自己的后端接口。
