## 比那名居天子的个人主页（Hisou-Tenshi.github.io）

静态博客 / 个人主页项目，基于 GitHub Pages 与纯前端实现。  
仓库地址即站点源码，`main` 分支直接部署。

- GitHub Pages：`https://hisou-tenshi.github.io/`
- 自定义域名（`CNAME`）：`https://tenshi.qzz.io/`
- 域名注册商 / DNS 托管 / 续期入口：见「域名与 DNS 管理（重要备忘）」一节。

---

## 2026-10 重构备忘（当前架构）

这一版对整个站点做了重写，**下面的旧章节只保留操作流程类信息（BGM 目录规则、Staticrypt 旧方案、部署、DNS），界面/主题相关描述以本节为准。**

设计方向：Apple 产品页式的克制排版（大字号紧字距标题、大面积留白、发丝线分栏、明暗交替的区块底色、克制的滚动入场动效）+《明日方舟：终末地》的「雷霆大字」气质（超重 CJK 标题、等宽大写小字标签、电蓝闪电符号、暗色标本板）。浅色为默认主形态，深色为夜间形态，**不是**「神秘全黑」风格。

性能上的关键改动（这也是当初重构的主要原因）：

| 项目 | 重构前 | 重构后 |
| --- | --- | --- |
| 主页首屏图片体积 | ≈ 12.3 MB（24 张原图立绘 10.7 MB） | ≈ 0.42 MB（全部 WebP） |
| 主页传输总量 | ≈ 18.1 MB | ≈ 0.85 MB |
| 阻塞渲染的第三方请求 | Google Fonts `@import`、APlayer 58 KB、Meting 组件、worldtimeapi | 0 |
| 主页加载动画 | 强制最少停留 3 秒（其他页 1 秒） | 已删除，加载完即可交互 |
| 播放器 | APlayer + Meting（含网易云外链） | 自绘轻量播放器，首次点击才拉歌单与音频 |
| 私密页面 | 整页 Staticrypt 加密（撞密码墙、样式冻结） | 普通页 + 就地解密展开（新增 14 KB 标题字体） |

架构要点：

- `static/css/root.css`：**只放设计变量**（颜色 `--ink/--ink-2/3/4`、底色 `--bg/--bg-band/--card`、强调色 `--accent` 绯红 / `--arc` 电蓝、字体栈、`--fs-*` 字号、`--ease` 缓动、圆角、阴影、`--bolt` 闪电几何）。换主题只改这里。
- `static/css/style.css`：**全部组件**，按编号分节（设计变量 → 基础 → 导航 → 首屏/雷霆大字 → 区块 → 卡片/链接/标签/统计 → 角色跑马灯 → 技能标本板 → 更新记录 → 页脚 → 播放器 → 灯箱 → 文档页 → 404 → 兼容层 → 响应式）。无 `@import`、无远程字体。
- `static/js/script.js`：主题切换（cookie `themeMode`/`themeState`，首屏前由 `<head>` 内联脚本上色，无闪白）、`[data-rv]` 滚动入场、导航滚动态/移动端抽屉、页脚年份、标签页标题彩蛋、角色立绘图灯箱、自绘 BGM 播放器（`preload="none"`，首帧不下载 mp3；歌名按命名约定拆成「标签 + 曲名」，超长时在播放位跑马灯）。**不再有** `worldtimeapi` 请求、FPS 覆盖层、加载遮罩。
- `static/js/vault.js`：页面内「就地解锁」逻辑（见下文“私密内容”一节）。
- 图片：所有位图都在 `static/img/opt/`，来源是 `static/img/` 下的原图。角色缩略图为 `opt/th/thNN.webp`（约 18 KB/张，原图 200 KB–1.6 MB）。
- 字体：`static/fonts/display-900.woff2` 是 **Noto Sans SC Black（SIL OFL 1.1）子集化**后的 43.5 KB 字体，覆盖 ASCII 全量、0–9、常用中日标点与全站标题里出现过的字（`static/fonts/subset-chars.txt`），给 `.mega` / `.sec__title` / `.pagehead__title` / `.nf__code` 使用。标题文案增删字后要重新子集化（命令见 `static/fonts/README.txt`；**不要加 `--no-hinting`**，去掉 CFF 微调数据会让 FreeType 自动 hint，在 1x 屏上把字形交叉处的笔画啃出洞）。
- 路径：新页面统一使用**站点根绝对路径**（`/static/css/style.css`），因此子目录页面无需 `../` 前缀。
- 旧文件名 `head.PNG`、`title.png`、`background.PNG`、`mobile-bg.jpg` **仍然保留**：`download/` 页把两张背景图作为公开壁纸直接提供下载，Staticrypt 模板（`template/my_template.html`）也还在引用它们，请不要删除。

第三轮（2026-10-31）修补，三处「交互/排版」细节：

- **大字不再被裁**：`.mega__char` / `.sec__title` / `.pagehead__title` / `.nf__code` 都是「渐变填充 + `background-clip:text`」的独立盒子，盒子按字宽与 `line-height: .94` 算，比字形墨迹窄、矮，于是每个字的右、下各丢一条边（不只是整行最右那个字）。现在统一给这些元素加 `padding` 撑开绘制区域、再用等量负 `margin` 抵消布局；`.mega__latin` 与 `[data-rv="mask"]` 过去用 `clip-path: inset()` 的非法负值做擦除（浏览器会钳到 0，等于永久裁掉右边），已改成不裁边界的写法（透明度 + 字距、`polygon`）。**另有隐藏原因**：字体 woff2 早期用 `--no-hinting` 构建，缺 CFF 微调数据，小尺寸下被自动 hint 啃出洞，见上文「字体」一条。
- **播放位跑马灯 = LED 广告牌**：`::after { content: attr(data-marq) }` 把文本复制一份，整条轨道匀速左移「正好一份」的宽度，于是尾部离开的瞬间头部就从右边接上；只在回到原点时停一次（`@keyframes marq`：0/10% 停 → 90/100% 到位 → 循环）。短标题（不溢出）不滚。
- **右侧章节导航**（`.secnav`，仅首页、>1100px）：静止时每节一根短横，当前节加长加深；hover/focus 时横杠变长、左侧浮出圆角标签。scrollspy 在 `script.js` 末尾的 `initSecnav()` 里，用 `getBoundingClientRect().top` 与视口 42% 线比较，`requestAnimationFrame` 节流。

第四轮（2026-10-31）内容与数据：

- **章节导航的手感**：`.secnav` 改成 `gap: 0`，每一项自己带 `7px / 20px` 的内边距，相邻两项的盒子首尾相接，指针在上下移动时不会掉进 1px 的死区；hover 时显示的是**介于静止短横与当前节长条之间**的中号深灰条（`21px` / `--ink-2`），不再直接跳到当前节的黑色长条。实测沿整条导轨每 1px 采样，hover 命中率 100%。
- **首页数据改为实时抓取**：`static/data/bangumi.json`（看过 / 在看 / 玩过 / 读过四项收藏数）与 `static/data/repos.json`（Projects 卡片）由 `.github/workflows/data.yml` 每小时 :17 跑 `scripts/fetch-bangumi.mjs` + `scripts/fetch-repos.mjs` 生成并自动提交；页面在 `script.js` 末尾的水合代码里读这两个 JSON 填充 `[data-stat]` 与 `.tiles[data-repos]`，抓不到就保留 HTML 里的静态兜底值。访客浏览器**不会**请求 `api.bgm.tv` 或 GitHub API，Token 只存在于仓库 secret `BANGUMI_API` 和本地 `.env`（已 gitignore）。
  - 本地跑：`node scripts/fetch-bangumi.mjs` / `node scripts/fetch-repos.mjs`（读 `.env` 或环境变量，`fetch-repos` 没 token 时退回 `gh api`）。两个脚本都失败安全：请求报错就退出且不覆盖已有 JSON。
  - 改 Projects 列表时手改 `static/data/repos.json` 的 `items`（顺序即卡片顺序），脚本只刷新 stars / 语言 / 时间戳。
  - 收录规则：排除没改动过的 fork（`weclone` / `ustcthesis` / `Clash-for-Mac`）、纯存文件的仓库（`Course-Projects`）、只有日志的仓库（`unideveloplog`）和 profile 仓库；保留有实际改动的 fork（`ACGMN-Grid` 领先上游 81 个提交，`dsh-whale-desktop-launcher` 领先 3 个）。
- **字体子集补全**：上一轮的子集是在统计数字上线之前切的，缺少 `8` 和 `9`，于是这两个字回退到系统字体，看起来比其它数字小一圈、细一档。现在字符集从 118 个扩到 ASCII 全量 + 站点标点 + 全站标题用字（`subset-chars.txt` 795 B，woff2 43.5 KB），用 CDP 的 `CSS.getPlatformFontsForNode` 逐个数字确认全部落在 `Noto Sans SC Black` 上。
- **法律文档重写**：`privacy-policy/` 与 `terms-and-conditions/` 按站点现状重写（隐私 22 节、条款 23 节，均含变更记录，日期 2026-10-31）。删掉了旧 Staticrypt 时代的会员 / 登录 / 服务器端存储 / 跨境传输 / 整套商品销售条款，补上了「没有账号也没有统计」「只有两个主题 Cookie」「页内 vault 的本地加解密」「文件层的 AES-256-CBC 与完整性校验」「BGM 播放器点了才请求」`第三方服务与托管`「版权与第三方素材（東方Project © 上海アリス幻樂団 / ZUN、字体 OFL 1.1 等）」「留存与删除」「未成年」「管辖与适用法律」。
- **about 的公开部分**：只写大类领域和兴趣，完整简历加密放在 `about-us/vault.json`，输入密码就在本页展开。
- **文案去 AI 味**：主页与 contact / tools / 404 / download 的可见文本重写了一遍，清掉「不是…而是…」式强行转折、滥用冒号破折号解释、定义腔、刻意形容词与表演共情；性格台词（「夢と現と交えては…」等）保持原样。法律条款属于格式文本，不在这次重写范围内。`/download/` 的密码提示改得绕了一点，页面里不出现密码本身。
- **部署侧**：`deploy.py` 的 CORE 清单新增 `static/data/*.json`、`scripts/*.mjs`、`.github/workflows/data.yml`、`.gitignore`；`.env` 永远不进仓库（已 gitignore），CI 里用仓库 secret。

---

## 目录结构概览

仓库根目录关键结构：

- `index.html`：主页，包含本地 BGM 播放器、个人信息与项目展示等。
- `404.html`：自定义 404 页面。
- `about-us/`：关于页面。`index.html` 是**普通页面**（公开简介 + 密码门），完整简历加密后放在 `vault.json`。
- `contact-us/index.html`：联系页面。
- `download/`：下载页面。`index.html` 是**普通页面**（公开壁纸 + 密码门），加密文件清单在 `vault.json`。
- `tools/index.html`：工具页入口。
  - `tools/cellCalculator/index.html`：单元格计算相关工具。
- `privacy-policy/index.html`：隐私政策页面。
- `terms-and-conditions/index.html`：服务条款页面。
- `template/my_template.html`：Staticrypt 自定义密码页模板（旧方案，现已不再用于上述两页，仅作历史保留）。
- `.staticrypt.json`：Staticrypt 盐值配置（旧方案遗留）。
- `vault_build.mjs`：把明文片段加密成 `vault.json` 的构建脚本（Node 内置 webcrypto，无依赖）。
- `CNAME`：GitHub Pages 自定义域名（当前为 `tenshi.qzz.io`）。
- `.nojekyll`：禁用 Jekyll 处理，保证静态资源路径原样发布。
- `_config.yml`：GitHub Pages / Jekyll 配置（兼容保留）。
- `static/`：站点静态资源根目录。
  - `static/css/`：站点样式（`root.css` 设计变量 + `style.css` 组件；`APlayer.min.css` 已不再引用，保留仅作备份）。
  - `static/js/`：公共脚本（`site-content.js` 跨页文案配置、`script.js`、`vault.js`；`APlayer.min.js`/`Meting.min.js` 已不再引用）。
  - `static/img/`：图片资源原图（角色立绘、logo、背景图等）。
  - `static/img/opt/`：**页面实际使用的优化后图片**（WebP + favicon + `th/` 角色缩略图）。
  - `static/fonts/`：`display-900.woff2` 标题子集字体 + `subset-chars.txt` + `README.txt`（构建说明）。
  - `static/svg/`：SVG 资源（技能图标墙 `skillPc.svg`/`skillWap.svg`）。
  - `static/bgm/`：本地 BGM 文件与歌词目录（详见“本地 BGM 播放器”）。
  - `static/resources/`：受保护下载相关资源（加密文件、hash、iv 等）。
- `generate_playlist.py`：扫描 `static/bgm` 自动生成播放器列表的脚本。
- `README.md`：本说明文档。

说明：`about-us/vault-src.html`、`download/vault-src.html` 是**明文源片段**（已写入 `.gitignore`），经 `vault_build.mjs` 加密成同目录的 `vault.json` 后才会被页面使用；公开仓库里只有密文。

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

- `static/css/root.css`：设计变量层，改主题色/字号/圆角/动效只动这里。
- `static/css/style.css`：所有组件样式，按编号分节。
- `static/js/site-content.js`
  - 跨页面共用的**文案数据**（角色标签、更新记录、页脚、彩蛋标题对、社交图标路径等）。
  - 修改站点级文案时优先编辑此文件。
  - 页面级覆盖：在引入脚本前设置 `window.SITE_PAGE`（如 `'download'`），并在 `SITE_CONTENT.pages` 中配置对应 `*Overrides`。
- `static/js/script.js`
  - 深浅色主题切换（写 cookie，`<head>` 内联脚本在首帧前套用，避免闪白）。
  - `[data-rv]` 元素滚动入场（rAF + 视口矩形判定，支持 `--rv-d` 延迟；`prefers-reduced-motion` 下全部直出）。
  - 顶部导航滚动态、移动端抽屉、按路径自动标记 `aria-current`。
  - 页脚年份、标签页标题彩蛋、角色立绘图灯箱。
  - 自绘 BGM 播放器（歌单首次交互才 `fetch`，音频 `preload="none"`）。

#### 引文块 `.epigraph`（全宽、作品名随行）

页面里要放一句引文时，直接套这个结构即可，样式全站统一（`style.css` 第 13 节）：

```html
<blockquote class="epigraph">
  <p class="epigraph__text">Lo! men have become the tools of their tools. <cite class="epigraph__cite">Henry David Thoreau, <i>Walden</i> (1854)</cite></p>
</blockquote>
```

- 引文左侧留 44px 给悬挂的红色引号（`::before`），正文用 Georgia 系斜体，宽度吃满容器。
- `<cite>` 必须写在 `epigraph__text` 段落**内部且位于末尾**：它 `float: right`，最后一行的右侧还有位置时就贴在那一行，位置不够才落到下一行右对齐（距右边缘 16px）。
- 想让它全宽，所在 `section` 要带 `doc--wide`（否则 `.doc__body` 的 76ch 会限制宽度）。
- 720px 以下 `<cite>` 自动改为块级右对齐。

导航项包括：Home、About us、Contact us、Tools、Download、Privacy Policy、Terms and Conditions。  
新页面统一在 `</body>` 前引入 `/static/js/site-content.js` 与 `/static/js/script.js`，并在 `<head>` 里引入 `/static/css/root.css` + `/static/css/style.css`，即可获得同一套导航栏、页脚、主题与动效。

首屏防闪白的最小 `<head>` 内联脚本（与 `index.html` 一致）：

```html
<script>
(function () {
  var d = document.documentElement, m = /themeMode=([a-z]+)/.exec(document.cookie);
  var s = /themeState=([a-zA-Z]+)/.exec(document.cookie);
  var dark = (m && m[1] === 'manual') ? (s && s[1] === 'Dark')
           : window.matchMedia('(prefers-color-scheme: dark)').matches;
  d.setAttribute('data-theme', dark ? 'Dark' : 'Light');
  d.className += ' js';
})();
</script>
```

---

## 本地 BGM 播放器与自动歌单

主页 `index.html` 内置了一个自绘的轻量 BGM 播放器（右下角胶囊，点开是面板），歌单来自本地 `playlist.json` 自动识别结果。

播放器的性能约束（勿破坏）：

- `<audio preload="none">`：**不点播放就不下载任何 mp3**（原实现会在首次点击页面任意处就开始拉 5–9 MB 的音频）。
- `playlist.json` 也只在用户第一次与播放器交互时才 `fetch`。
- 不使用 `cover` 字段（封面图最大 15 MB，会把省下的流量全赔回去），列表只显示「曲名 / 艺术家」。

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

### 3. 播放器初始化与切歌

播放器主要代码位置：

- `static/js/script.js` 的「BGM player / 自绘播放器」一节。
- 页面骨架在 `index.html` 的 `.player` 片段（面板 + 胶囊 + `<audio id="pAudio">`）。

关键点：

- 首次交互（点胶囊或面板按钮）才 `fetch('/static/bgm/playlist.json')`，拿到数组后打乱顺序（Fisher-Yates）并从当前曲开始播。
- `url` 字段以 `./static/bgm/...` 开头，播放前统一规范化成 `/static/bgm/...`，因此在子目录页面同样可用。
- 切歌/上一首下一首/拖动进度条（`pointerdown` + `pointermove`，另支持 `ArrowLeft`/`ArrowRight`）/列表点选都已实现；当前曲在列表里高亮 `is-on`。
- 歌词：`playlist.json` 里的 `lrc` 字段仍然会生成，但**当前播放器不显示歌词**（歌词滚动会带来持续重排，收益不抵成本）。需要时可按 `timeupdate` 事件自己接。

添加新歌时，只需：

1. 按上述规则增加 `static/bgm/` 下的歌曲文件夹。
2. 执行 `python3 generate_playlist.py` 重新生成 `playlist.json`。
3. 推送到 GitHub 之后，刷新页面点播放器即可看到新歌。

---

## 私密内容：页面内就地解锁（vault）

**这一节是 2026-10 重构后的现行方案，取代了下面的 Staticrypt 整页加密。**

旧方案把 `about-us/`、`download/` 整页加密成一个自包含的密码页，后果是：点导航会撞上一堵密码墙、那两页永远拿不到新设计（样式在加密那一刻就被冻进去了）、PSI/LCP 极差。现在改成「公开页 + 就地解锁」：

| 文件 | 作用 |
| --- | --- |
| `about-us/index.html` | 普通页面：公开简介 + 密码门（`.vault`） |
| `about-us/vault.json` | 加密后的完整简历（密文） |
| `about-us/vault-src.html` | 简历明文片段，**已 gitignore** |
| `download/index.html` | 普通页面：公开壁纸 + 密码门 |
| `download/vault.json` | 加密后的 10 个受保护文件清单 |
| `download/vault-src.html` | 该清单的明文片段，**已 gitignore** |
| `vault_build.mjs` | 把明文片段加密成 `vault.json` |
| `static/js/vault.js` | 浏览器端解密并就地展开 |

构建（Node 18+，无第三方依赖）：

```powershell
$env:VAULT_PASSWORD = "你的密码"
node vault_build.mjs --src about-us/vault-src.html  --out about-us/vault.json
node vault_build.mjs --src download/vault-src.html  --out download/vault.json
```

- 算法：PBKDF2-SHA256（210000 次）派生密钥 → AES-256-GCM，每次随机 16 字节 salt + 12 字节 iv；`vault.json` 只含 `salt/iv/ct` 与 KDF 参数，不含明文、不含密码校验值。
- 脚本内置往返校验（加密后立刻解密比对），并会拒绝任何含 `<script`、`<style`、`<!DOCTYPE`、`<html` 的片段——密文只承载内容，不承载代码。
- 浏览器端：`submit` → `fetch(vault.json)` → 派生密钥 → 解密 → 注入 `[data-vault-out]` → 给 `.vault` 加 `.is-open`；不需要刷新页面，也没有跳转。`[data-vault-relock]` 可重新锁上。
- 错误提示只有两种：「密码不正确」与「无法载入加密内容，请稍后重试」，不泄露任何额外信息。
- 加密文件的**第二层**（`/static/resources/encrypted_00N.bin`）仍沿用旧页面的机制，`vault.js` 原样移植：密钥 = SHA-256(文件密码 + 站点盐)，IV 取自 `static/resources/keys/<文件名>.iv`，完整性校验取自 `static/resources/hash/<文件名>.hash`（`文件名|sha256`），明文格式为 `[2 字节大端文件名长度][文件名][文件字节]`。**全部在本地完成，密码不会离开浏览器。**

---

## HTML 纯前端加密（Staticrypt，旧方案 / 已停用）

> ⚠️ 2026-10 之后 `about-us/` 与 `download/` **不再使用** Staticrypt，改为上面的 vault 方案。本节保留仅为操作参考；万一要回滚或加密其它页面，流程仍然有效。

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

> ⚠️ **2026-10 重构后的重要提醒**：Staticrypt 生成的是**自包含**的 HTML——模板的样式与脚本在加密那一刻就被整段复制进 `about-us/index.html` / `download/index.html` 了。因此：
>
> - 改 `template/my_template.html` **不会**改变已经生成的两个加密页；它只影响**下一次**重新加密的结果。
> - 这两个加密页目前仍是**旧版视觉**（玻璃拟态 + 1.4 MB `background.PNG` / 5.4 MB `mobile-bg.jpg`），是全场仅剩的「慢」页面。
> - 想让它们也变成新版：用原来的密码重新加密一次
>   `npx staticrypt about-us/about-us.html -t template/my_template.html --remember 1 -d about-us`
>   （`download` 同理），密码从 `STATICRYPT_PASSWORD` 环境变量读取。需要在本地持有被 `.gitignore` 掉的明文源文件。
> - 在此之前**不要删除** `static/img/background.PNG`、`static/img/mobile-bg.jpg`、`static/img/head.PNG`、`static/img/title.png`，旧页仍在引用。


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

### 备用部署通道：GitHub Data API（大仓库 / 网络受限时）

本仓库约 **2.95 GB**（`static/bgm/*.mp3`、`static/resources/*.bin` 占绝大部分）。在 TLS 不稳的网络下 `git clone` / `git push` 会以
`RPC failed; curl 56 ... missing close_notify` 或 `fatal: early EOF` 失败。这时可以**只推送改动的那几个 blob**，完全不需要克隆：

```bash
# 1. 当前 main 的 tree
gh api repos/Hisou-Tenshi/Hisou-Tenshi.github.io/git/trees/main?recursive=1

# 2. 为每个改动文件建 blob（base64）
gh api -X POST repos/.../git/blobs --input blob.json      # {"content":"<base64>","encoding":"base64"}

# 3. 在旧 tree 上打补丁建新 tree
gh api -X POST repos/.../git/trees --input tree.json      # {"base_tree":"<old>","tree":[{"path":...,"mode":"100644","type":"blob","sha":...}]}

# 4. 建 commit（parents = 当前 main 的 commit）
gh api -X POST repos/.../git/commits --input commit.json

# 5. 建分支 → gh pr create → 合并
gh api -X POST repos/.../git/refs --input ref.json        # {"ref":"refs/heads/<branch>","sha":"<commit>"}
```

判断某文件是否真的变了，不必下载：本地算 `sha1("blob <len>\0" + bytes)` 与 `git/trees` 返回的 `sha` 比对即可。

---

---

## 域名与 DNS 管理（重要备忘）

> 目的：以后忘了 `tenshi.qzz.io` 在哪家注册、解析在哪托管时，看这一节即可。
> 最后核查：2026-10-31，当天的 DNS 快照见本节末尾。

### 1. 三层结构一览

| 层级 | 服务商 | 说明 |
| --- | --- | --- |
| 域名（子域）注册 / 续期 | **DigitalPlat FreeDomain** | `qzz.io` 是其免费后缀之一（同批还有 `.dpdns.org`、`.us.kg`、`.xx.kg`、`.qd.je`）。本站在其面板注册了 `tenshi` 这个子域。 |
| DNS 解析托管 | **Cloudflare** | zone 名 `tenshi.qzz.io`，NS 为 `zod.ns.cloudflare.com` / `melissa.ns.cloudflare.com`（免费计划）。A / AAAA / TXT 等记录都在这里改。 |
| 站点托管 | **GitHub Pages** | 本仓库 `main` 分支直接部署，根目录 `CNAME` 文件内容必须为 `tenshi.qzz.io`。 |

链路：DigitalPlat 在 `qzz.io` 的权威 DNS 中把 `tenshi.qzz.io` 通过 NS 记录**委派**给 Cloudflare → Cloudflare 再把域名指向 GitHub Pages 的 IP → GitHub Pages 负责签发 Let's Encrypt 证书。

### 2. 账号与入口

- **DigitalPlat（域名注册 / 续期 / 改 NS）**
  - 面板：<https://dash.domain.digitalplat.org/>
  - **登录方式：GitHub 账号 OAuth 登录**（不是邮箱密码）。对应 GitHub 账号：`Hisou-Tenshi`。
  - 进入后在 `Domains` 列表里找到 `tenshi.qzz.io`，可查看 / 修改 NS 委派、续期、删除。
- **Cloudflare（改解析记录）**
  - 面板：<https://dash.cloudflare.com/>
  - 找 zone 名为 `tenshi.qzz.io`、且 NS 正好是 `zod` + `melissa` 的那个账号。
- **GitHub Pages（站点发布）**
  - 仓库：<https://github.com/Hisou-Tenshi/Hisou-Tenshi.github.io>
  - Settings → Pages：来源 `main` 分支，自定义域名 `tenshi.qzz.io`。

> 判断口诀：**要改 A / CNAME / TXT → Cloudflare；要续期或换 NS 服务商 → DigitalPlat；页面不出来 → 先看 Pages 构建。**

### 3. 当前解析记录（Cloudflare 侧）

| 类型 | 值 | 说明 |
| --- | --- | --- |
| `A` | `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153` | GitHub Pages 标准 IPv4，四条都要保留 |
| `AAAA` | `2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153` | GitHub Pages 标准 IPv6 |
| 代理状态 | **仅 DNS（灰云）** | 不要开橙云，否则证书由 Cloudflare 接管，与 GitHub Pages 的签发流程不一致 |

`www.tenshi.qzz.io` 目前也指向同一组地址；TTL 300。

### 4. 续期与找回

- DigitalPlat 的免费域名**免费但不自动续期**，社区反馈需每年手动续一次（到期前约 120 天可续），过期不续可能被回收。
- 建议每年 7 月（首次注册为 2026-07-03）登录面板检查一次到期时间，或加个日历提醒。
- 面板支持删除域名，删除会有数天 pending 期，误删前想清楚。

### 5. 常见故障排查顺序

1. `https://tenshi.qzz.io/` 打不开：
   - 先用 DoH 确认解析是否正常（命令见下节）；A 记录为空 → 去 **Cloudflare** 查记录是否被删。
   - 解析正常仍打不开 → 去 **GitHub** 仓库 Actions / Pages 看构建是否失败，或看 `CNAME` 是否被误改。
   - 证书报错 → 等 GitHub Pages 重签，或在 Pages 设置里移除再重新添加自定义域名。
2. 忘了 Cloudflare 账号、要换解析服务商：
   - 在 **DigitalPlat 面板**把 NS 改成新账号给出的两条 NS（或改回 DigitalPlat 自带 DNS），再回 GitHub Pages 重新保存一次自定义域名，等证书重签。
3. 域名被回收 / 遗失：
   - 只能去 DigitalPlat 面板确认状态。`.qzz.io` 等免费后缀滥用较多，部分网络会被跳转警示或被墙，此时换后缀重新注册比修 DNS 更省事。

### 6. 查证用的命令（注意本地代理干扰）

本机开着 TUN / fake-ip 代理时，`nslookup` / `Resolve-DnsName` 会返回 `198.18.x.x` 之类的假地址，**不代表真实解析**。用 DoH 查权威结果：

PowerShell：

```powershell
Invoke-RestMethod -Uri 'https://cloudflare-dns.com/dns-query?name=tenshi.qzz.io&type=A' -Headers @{ accept = 'application/dns-json' } |
  Select-Object -ExpandProperty Answer
```

Bash（curl）：

```bash
curl -sH 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=tenshi.qzz.io&type=A'
```

想看委派是否正确，把 `type=A` 换成 `type=NS`：应返回 `zod.ns.cloudflare.com` 与 `melissa.ns.cloudflare.com`。

### 7. 2026-10-31 核查快照

- 上级域 `qzz.io` 权威 NS：`ns1.qzz.io`、`ns2.qzz.io`、`ns3.qzz.io`（SOA 为 `ns1.dpdns.org`）。
- `tenshi.qzz.io` NS 委派：`zod.ns.cloudflare.com`、`melissa.ns.cloudflare.com`。
- A：`185.199.108.153` / `.109.153` / `.110.153` / `.111.153`；AAAA：`2606:50c0:800{0,1,2,3}::153`；TTL 300，仅 DNS。
- 站点 `https://tenshi.qzz.io/` 返回 200，证书由 Let's Encrypt 签发（`CN=tenshi.qzz.io`），到期 2026-11-30。
- 仓库 `CNAME` 内容：`tenshi.qzz.io`。

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
