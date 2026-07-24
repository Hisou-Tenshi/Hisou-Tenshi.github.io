## 比那名居天子的个人主页（Hisou-Tenshi.github.io）

静态博客 / 个人主页项目，基于 GitHub Pages 与纯前端实现。  
仓库地址即站点源码，`main` 分支直接部署。

- GitHub Pages：`https://hisou-tenshi.github.io/`
- 自定义域名（`CNAME`）：`https://tenshi.qzz.io/`

---

## 目录结构概览

仓库根目录关键结构：

- `index.html`：主页，包含本地 BGM 播放器、个人信息与项目展示等。
- `404.html`：自定义 404 页面。
- `about-us/`：关于页面（明文源 `about-us.html` 经 Staticrypt 加密为 `index.html`）。
- `contact-us/index.html`：联系页面。
- `download/`：下载与受保护资源入口（明文源 `download.html` 经 Staticrypt 加密为 `index.html`）。
- `tools/index.html`：工具页入口。
  - `tools/cellCalculator/index.html`：单元格计算相关工具。
- `privacy-policy/index.html`：隐私政策页面。
- `terms-and-conditions/index.html`：服务条款页面。
- `template/my_template.html`：Staticrypt 自定义密码页模板。
- `.staticrypt.json`：Staticrypt 盐值配置（应随仓库提交，保证多次加密使用同一 salt，Remember me 可跨页复用）。
- `CNAME`：GitHub Pages 自定义域名（当前为 `tenshi.qzz.io`）。
- `.nojekyll`：禁用 Jekyll 处理，保证静态资源路径原样发布。
- `_config.yml`：GitHub Pages / Jekyll 配置（兼容保留）。
- `static/`：站点静态资源根目录。
  - `static/css/`：站点样式文件（`style.css`、`root.css`、`APlayer.min.css`）。
  - `static/js/`：公共脚本（`site-content.js` 跨页文案配置、`script.js`、`APlayer.min.js`、`Meting.min.js`）。
  - `static/img/`：图片资源（角色立绘、logo、背景图等）。
  - `static/fonts/`：字体资源。
  - `static/svg/`：SVG 图标及主题相关资源。
  - `static/bgm/`：本地 BGM 文件与歌词目录（详见“本地 BGM 播放器”）。
  - `static/resources/`：受保护下载相关资源（加密文件、hash、iv 等）。
- `generate_playlist.py`：扫描 `static/bgm` 自动生成播放器列表的脚本。
- `README.md`：本说明文档。

说明：`about-us/about-us.html` 与 `download/download.html` 为明文源文件，已写入 `.gitignore`，不会进入公开仓库；对外访问的是同目录下加密后的 `index.html`。

---

## 本地预览与开发

项目为纯静态站点，不依赖 Node.js 或后端服务，任何支持静态文件的 HTTP 服务器都可以使用。  
推荐使用 Python 自带的 `http.server` 快速预览。

### 1. 启动本地服务器

在仓库根目录执行：

```bash
cd /path/to/Hisou-Tenshi.github.io
python3 -m http.server 8080
```

然后在浏览器中打开：

- 主页：`http://localhost:8080/`
- 关于：`http://localhost:8080/about-us/`
- 联系：`http://localhost:8080/contact-us/`
- 工具：`http://localhost:8080/tools/`
- 下载：`http://localhost:8080/download/`
- 隐私政策：`http://localhost:8080/privacy-policy/`
- 服务条款：`http://localhost:8080/terms-and-conditions/`

如使用其他静态服务器（如 nginx、serve 等），确保站点根目录指向仓库根目录即可。

### 2. 主题与公共组件

公共组件与主题逻辑主要集中在：

- `static/js/site-content.js`
  - 跨页面共用文案与链接配置（顶栏导航、侧栏头像/地址/标签/更新记录、右侧欢迎区、页脚、标签页切换文案等）。
  - 修改站点级文案时优先编辑此文件。
  - 页面级覆盖：在引入脚本前设置 `window.SITE_PAGE`（如 `'download'`），并在 `SITE_CONTENT.pages` 中配置对应 `*Overrides`；也可直接设置 `window.sidebarOverrides` / `navbarOverrides` / `rightHeaderOverrides` / `footerOverrides`。
- `static/js/script.js`
  - 深浅色主题切换（`changeTheme`、`initThemeSwitch`）。
  - 左侧信息栏渲染（`renderSidebar`）。
  - 顶部导航栏渲染（`renderNavbar`）。
  - 标签云布局（`initWordCloud`）。
  - 页脚更新记录与页尾年份自动更新。

导航项包括：Home、About us、Contact us、Tools、Download、Privacy Policy、Terms and Conditions。  
各页面需先引入 `site-content.js`，再引入 `script.js` 与统一样式，即可自动套用相同的导航栏与侧边栏布局。

---

## 本地 BGM 播放器与自动歌单

主页 `index.html` 集成了 APlayer 播放器，并支持本地 BGM 自动识别。

### 1. 目录结构与命名规则

所有本地 BGM 均放在：

- 目录：`static/bgm/`

约定一首歌对应一个文件夹：

- 文件夹命名格式：`歌曲名【艺术家】`
  - 示例：
    - `天狗舞踏会【Foxtail-Grass Studio】`
    - `风神少女【上海アリス幻樂団】`

每个歌曲文件夹中：

- 音频文件：任意命名，后缀为以下之一：
  - `.mp3`、`.flac`、`.ogg`、`.wav`、`.m4a`、`.aac`、`.webm`
- 封面图：任意命名，后缀为以下之一：
  - `.jpg`、`.jpeg`、`.png`、`.gif`、`.webp`、`.bmp`
- 歌词文件：
  - 必须为 `.lrc` 后缀，任意文件名。

每个歌曲文件夹应当满足：

- “至少且只期望有 1 个音频 + 1 张图片 + 1 个 `.lrc` 文件”。

### 2. 自动生成歌单 `playlist.json`

脚本位置：

- `generate_playlist.py`

核心行为：

- 扫描 `static/bgm/` 下所有子文件夹。
- 使用正则 `(.+?)【(.+?)】$` 从文件夹名中解析：
  - `name`：`【】` 之前的部分。
  - `artist`：`【】` 中的部分。
- 在每个子文件夹中：
  - 选择第一个匹配音频后缀的文件作为 `url`。
  - 选择第一个匹配图片后缀的文件作为 `cover`。
  - 选择第一个 `.lrc` 文件作为 `lrc`。
- 生成数组并写入：
  - `static/bgm/playlist.json`。

生成示例（实际内容由目录结构决定）：

```json
[
  {
    "name": "天狗舞踏会",
    "artist": "Foxtail-Grass Studio",
    "url": "./static/bgm/天狗舞踏会【Foxtail-Grass Studio】/天狗舞踏会.mp3",
    "cover": "./static/bgm/天狗舞踏会【Foxtail-Grass Studio】/天狗舞踏会.jpg",
    "lrc": "./static/bgm/天狗舞踏会【Foxtail-Grass Studio】/天狗舞踏会.lrc"
  }
]
```

使用方式（每次变更 BGM 文件夹后执行）：

```bash
cd /path/to/Hisou-Tenshi.github.io
python3 generate_playlist.py
```

GitHub Pages 不支持在运行时列目录，因此通过此脚本预先生成静态 `playlist.json`，播放器即可在前端正常读取。

### 3. 播放器初始化与歌词同步

播放器主要代码位置：

- `index.html` 中的内联脚本。

关键点：

- APlayer 初始化时 `audio` 为空数组，由前端在页面加载后通过 `fetch('./static/bgm/playlist.json')` 获取列表，并逐条 `ap.list.add(item)`。
- 歌词相关：
  - `lrc` 字段为每首歌对应的 `.lrc` 文件地址。
  - `parseLrc` 将 `.lrc` 文本解析为时间戳 + 行文本。
  - `loadCustomLrc` 在切歌时加载相应歌词。
  - `updateCurrentLrc` 在 `timeupdate` 事件中同步当前高亮行。

添加新歌时，只需：

1. 按上述规则增加 `static/bgm/` 下的歌曲文件夹。
2. 执行 `python3 generate_playlist.py` 重新生成 `playlist.json`。
3. 推送到 GitHub 之后，APlayer 会自动展示新歌并显示对应歌词。

---

## HTML 纯前端加密（Staticrypt）

`about-us/`、`download/` 等敏感内容使用 [Staticrypt](https://github.com/robinmoisson/staticrypt) 进行纯前端加密。  
核心思路是：对原始 HTML 进行加密，生成一个包含解密逻辑的 HTML，用户在前端输入密码后解密并展示原页面内容。

当前站点约定：

| 明文源（本地，已 gitignore） | 对外发布（加密后） |
| --- | --- |
| `about-us/about-us.html` | `about-us/index.html` |
| `download/download.html` | `download/index.html` |

密码提示为********；加密时使用环境变量传递密钥，避免写入命令历史。

### 1. 环境准备与密钥传递

先安装 Staticrypt（全局或项目内均可）：

```bash
npm install -g staticrypt
```

推荐通过环境变量传递密码：

Linux / macOS / Git Bash / WSL：

```bash
export STATICRYPT_PASSWORD='********'
```

Windows **命令提示符（cmd.exe）**：

```bat
set "STATICRYPT_PASSWORD=********"
```

Windows **PowerShell**：

```powershell
$env:STATICRYPT_PASSWORD = "********"
```

说明：以上写法只对**当前终端窗口**生效；关闭窗口后需重新设置。之后运行 `staticrypt` 时若未显式指定 `-p`，会自动读取该环境变量。

### 2. 基本加密命令

通用形式（先输出到临时目录，再覆盖为 `index.html`，避免覆盖明文源）：

```bash
staticrypt A.html \
  -t template/my_template.html \
  --template-title "Protected Page" \
  --template-instructions "To unlock this file, you should enter the author's mail address." \
  --remember 1 \
  -d /tmp/staticrypt-out
```

Windows `cmd.exe`：

```bat
staticrypt A.html ^
  -t template\my_template.html ^
  --template-title "Protected Page" ^
  --template-instructions "To unlock this file, you should enter the author's mail address." ^
  --remember 1 ^
  -d %TEMP%\staticrypt-out
```

Windows PowerShell：

```powershell
staticrypt A.html `
  -t template\my_template.html `
  --template-title "Protected Page" `
  --template-instructions "To unlock this file, you should enter the author's mail address." `
  --remember 1 `
  -d $env:TEMP\staticrypt-out
```

参数说明：

- `A.html`：要加密的源 HTML 文件。
- `-t template/my_template.html`：自定义模板文件路径。
- `--template-title`：密码输入页面标题（默认为 `"Protected Page"`）。
- `--template-instructions`：密码提示语。
- `--remember`：记住密码的天数（设置为 `1` 表示 1 天内不再要求输入密码）。
- `-d`：输出目录；Staticrypt 会按源文件名写出加密 HTML，需再复制/重命名为对应目录的 `index.html`。

更多用法参考：

- 官方仓库：https://github.com/robinmoisson/staticrypt  
- 在线快速加密：https://robinmoisson.github.io/staticrypt/

### 3. 实际使用示例

以下示例均假设已设置 `STATICRYPT_PASSWORD`，且当前目录为仓库根目录。

#### 3.1 下载页加密（推荐流程）

PowerShell：

```powershell
$env:STATICRYPT_PASSWORD = "********"
$out = Join-Path $env:TEMP "staticrypt-download"
New-Item -ItemType Directory -Force -Path $out | Out-Null
staticrypt .\download\download.html `
  -t .\template\my_template.html `
  --template-title "Protected Page" `
  --template-instructions "To unlock this file, you should enter the author's mail address." `
  --remember 1 `
  -d $out
Copy-Item (Join-Path $out "download.html") .\download\index.html -Force
```

Bash：

```bash
export STATICRYPT_PASSWORD='********'
OUT="$(mktemp -d)"
staticrypt ./download/download.html \
  -t ./template/my_template.html \
  --template-title "Protected Page" \
  --template-instructions "To unlock this file, you should enter the author's mail address." \
  --remember 1 \
  -d "$OUT"
cp "$OUT/download.html" ./download/index.html
```

#### 3.2 关于页加密（推荐流程）

PowerShell：

```powershell
$env:STATICRYPT_PASSWORD = "********"
$out = Join-Path $env:TEMP "staticrypt-about-us"
New-Item -ItemType Directory -Force -Path $out | Out-Null
staticrypt .\about-us\about-us.html `
  -t .\template\my_template.html `
  --template-title "Protected Page" `
  --template-instructions "To unlock this file, you should enter the author's mail address." `
  --remember 1 `
  -d $out
Copy-Item (Join-Path $out "about-us.html") .\about-us\index.html -Force
```

Bash：

```bash
export STATICRYPT_PASSWORD='********'
OUT="$(mktemp -d)"
staticrypt ./about-us/about-us.html \
  -t ./template/my_template.html \
  --template-title "Protected Page" \
  --template-instructions "To unlock this file, you should enter the author's mail address." \
  --remember 1 \
  -d "$OUT"
cp "$OUT/about-us.html" ./about-us/index.html
```

#### 3.3 一次加密两个页面（共享 salt，Remember me 可跨页复用）

```powershell
$env:STATICRYPT_PASSWORD = "********"
$out = Join-Path $env:TEMP "staticrypt-pages"
New-Item -ItemType Directory -Force -Path $out | Out-Null
staticrypt .\about-us\about-us.html .\download\download.html `
  -t .\template\my_template.html `
  --template-title "Protected Page" `
  --template-instructions "To unlock this file, you should enter the author's mail address." `
  --remember 1 `
  -d $out
Copy-Item (Join-Path $out "about-us.html") .\about-us\index.html -Force
Copy-Item (Join-Path $out "download.html") .\download\index.html -Force
```

#### 3.4 生成带分享链接的加密页

如需生成可自动解密的分享链接，可追加 `--share`：

```powershell
staticrypt .\download\download.html `
  -t .\template\my_template.html `
  --template-title "Protected Page" `
  --template-instructions "To unlock this file, you should enter the author's mail address." `
  --remember 1 `
  -d $out `
  --share https://tenshi.qzz.io/download/
```

注意：

- **不要**把 `-d` 直接指到 `about-us/` 或 `download/`，否则可能覆盖同名明文源文件。
- 若命令未如期输出文件，可先去掉 `--share` 排查。
- 修改明文源后，必须重新执行加密并更新对应 `index.html`，再提交推送。

### 4. 自定义模板 `my_template.html`

模板文件位于 `template/my_template.html`，通常包含背景图像等静态资源引用。  
需要根据“生成后文件的实际目录”（本站为 `about-us/`、`download/`）调整相对路径。

建议做法：

1. 打开 `template/my_template.html`。
2. 搜索：
   - `background: url('../static/img/`
3. 确认前缀与输出位置一致（从 `about-us/index.html` / `download/index.html` 出发，`../static/...` 正确）。

当前模板已按子目录页面配置为 `../static/img/background.PNG`。

---

## 部署到 GitHub Pages

仓库已配置为 GitHub Pages 站点，典型步骤：

1. 如修改了 `static/bgm/`，先执行 `python3 generate_playlist.py`。
2. 如修改了 `about-us.html` / `download.html`，先按上文重新加密并覆盖对应 `index.html`。
3. 提交并推送：

   ```bash
   git add .
   git commit -m "update site"
   git push origin main
   ```

4. 在 GitHub 仓库设置中确认：
   - Pages 来源为 `main` 分支。
   - 自定义域名与 `CNAME` 文件一致（当前为 `tenshi.qzz.io`）。

5. 等待数十秒到数分钟，访问：
   - `https://hisou-tenshi.github.io/`
   - 或 `https://tenshi.qzz.io/`

---

## 注意事项与小贴士

- BGM 目录：
  - 任何新歌均通过“新增文件夹 + 运行 `generate_playlist.py`”完成，无需修改前端代码。
  - 文件夹命名中的 `【】` 为解析 `name` / `artist` 的唯一依据，请保持格式。
- Staticrypt：
  - 密码通过环境变量传递；当前站点密钥为 `********`。
  - 明文源文件已 gitignore，只提交加密后的 `index.html`。
  - 保留并提交 `.staticrypt.json`，避免每次加密换 salt。
  - 加密输出务必先落到临时目录，再复制为 `index.html`，避免覆盖明文源。
  - 修改模板路径时，重点关注相对路径的起点目录。
- 本地预览：
  - 尽量通过 `http://localhost:PORT/` 访问，避免直接打开 `file://` 协议导致资源路径和脚本行为异常。

如需补充更多页面功能说明或运维细节，可在本 README 中继续扩展对应章节。
