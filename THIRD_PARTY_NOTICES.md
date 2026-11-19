# 开源许可与第三方素材说明

最后核查：2026-11-19。

本站原创软件采用 [GNU Affero General Public License v3.0](LICENSE)（AGPL-3.0）；只有 [原创内容许可清单](CONTENT-LICENSE.md) 列出的原创内容适用 CC BY-NC-SA 4.0。本说明不替换原许可证，也不为第三方作品重新授权。文件或组件的独立许可声明只适用于其覆盖的材料。

## 本站软件与源码

- 源码：<https://github.com/Hisou-Tenshi/Hisou-Tenshi.github.io>。
- 原创站点软件按仓库 `LICENSE` 使用，包括依其条件复制、修改、分发和商业使用。
- 分发或部署修改版时，应检查 AGPL 对声明保留、修改标注、许可证及 Corresponding Source（对应源码）的要求。修改版支持远程网络交互时，应依第 13 条向交互用户显著提供该运行版本的对应源码；只链接未修改的上游仓库不能替代提供自己版本的源码。
- 对应源码应包含许可证要求的构建、安装、运行及修改所需材料。访问令牌、邮箱内容、密码和其他私密数据应与源码分离配置，不应放入仓库或贡献中。
- 本站服务条款不限制许可证赋予的商用、修改、分发或镜像权利。第三方素材、字体和独立项目须分别检查。

## 字体

| 资源 | 来源 | 许可与注意事项 |
| --- | --- | --- |
| `static/fonts/shrine-hand.woff2`，CSS 名称 ShrineHand | [LXGW WenKai / 霞鹜文楷](https://github.com/lxgw/LxgwWenKai)，基于 Klee One；网页子集 | SIL OFL 1.1；完整版权、保留字体名和附加许可见 [wenkai-OFL.txt](static/fonts/wenkai-OFL.txt)。 |
| `static/fonts/display-900.woff2`，CSS 名称 HST Display | Noto Sans SC Black 的网页子集，源于 Noto / Source Han Sans 字体项目 | SIL OFL 1.1；随附 [noto-OFL.txt](static/fonts/noto-OFL.txt)。子集构建说明见 [字体 README](static/fonts/README.txt)。 |

字体软件保留各自 OFL 许可，不因与本站一同分发而改为 AGPL。重新分发字体时保留其完整版权和许可声明，遵守保留字体名等条款。字体使用不意味着用它排版的文档也必须采用 OFL。

Noto 许可文本来源：[Google Fonts 的 Noto Sans SC OFL 文件](https://github.com/google/fonts/blob/main/ofl/notosanssc/OFL.txt)。WenKai 许可沿用本仓库随字体提供的原文件。

## 图像、音乐、出版物与名称

下表记录已知来源与权利边界，**不是素材再分发授权清单**。公开可访问、注明来源、个人使用、非商业或同人目的均不自动产生复制、托管或再分发许可。复用站点时，应逐项核实许可，必要时删除、替换素材或向权利人取得授权。

| 素材类别 | 已知来源或权利人 | 复用边界 |
| --- | --- | --- |
| 東方Project 的名称、角色与世界观 | 上海アリス幻樂団 / ZUN 及相关创作者；其他作品依各自来源 | 本站为非官方同人站点，不代表原作者，也不承诺所有使用都已获授权。参阅[日文官方二创指引](https://touhou-project.news/guideline/)、[英文版本](https://touhou-project.news/guidelines_en/)及其引用的既有规则。 |
| 角色立绘、缩略图、背景及其他原作品图片 | 对应画师、出版者或其他权利人 | 不随站点软件许可证授权。尚未逐项建立完整作者、来源及授权记录，不能据本站收录推断可复用。 |
| 云天鸟居背景、仙桃等提供素材 | 来源线索见 `DESIGN-SOURCES.md`；部分作者或原始发布地址尚待补全 | 未核实的权利及来源明确保留为待确认；不宣称为本站原创或 AGPL 素材。 |
| `static/cursors/lily/` 的鼠标主题素材 | 提供的「莉莉概念光标 (64x) Ver1.2」ANI 主题转换为网页图片；线索见 `DESIGN-SOURCES.md` | 格式转换不改变原素材版权；原作者、发布地址及具体再分发许可仍待补全，不随光标脚本的代码许可授权。 |
| 御神籤页图，`static/img/shrine/oracles/` | 《東方幻存神籤 ～ Whispered Oracle of Hakurei Shrine》及相应创作者 | 原尺寸页图的格式转换不改变原作版权，不纳入本站代码许可。 |
| `static/bgm/` 中的录音、作品及可能附带的封面 | 对应作曲者、表演者、唱片权利人和美术作者 | 播放器代码的 AGPL 许可不覆盖音频或封面；未建立逐曲完整授权清单。 |
| 技术栈、产品、社交平台的图标与名称 | 相应项目及权利人 | 依实际图标许可和商标规则；标识性使用不代表合作或背书。 |
| Tools 的 ACGMN-Grid 示例 | `Hisou-Tenshi/ACGMN-Grid` 的 `public/example.webp`，浏览器直接从 GitHub 加载 | 链接项目及示例中可能出现的图片分别适用其实际许可，不因本站展示而统一改为 AGPL。 |
| 两处加密档案、密文及解密后的资料、文档和下载 | 各文件的实际权利人 | 各权利人保留所有权利；本站不以 AGPL 或 CC 对其授权。密码及访问许可不等于复制或再分发授权；依法取得的独立许可仍按其实际范围适用。 |
| GitHub Release `assets-v1` 的壁纸、角色原图、测试附件和素材压缩包 | 逐个附件、压缩包内逐个文件处理；目前无统一本人原创或发布授权证明 | 不随仓库采用 AGPL 或 CC。下载前确认文件来源和许可；无法确认时不要下载或复用。参见[下载声明](https://tenshi.qzz.io/terms-and-conditions/#download-terms)。 |

有关视觉参考、原创绘制部分及素材线索，见 [DESIGN-SOURCES.md](DESIGN-SOURCES.md)。其中用于研究的外部参考图不等于已发布素材；保留的来源记录也不等于已取得授权。独立代码组件若已有许可头或其他声明，应继续保留；没有找到声明时，不应自行替它补造许可。

## 贡献、问题与权利请求

普通缺陷和改进可通过 [GitHub Issues](https://github.com/Hisou-Tenshi/Hisou-Tenshi.github.io/issues) 或 pull request 提交。代码贡献默认按所修改文件适用的许可提交；贡献者保留自己的版权，不需要因此转让著作权。请说明引入的第三方内容和许可，不要提交无权提供的素材、私人资料或访问凭证。

隐私、安全漏洞、素材版权和署名请求请私下联系：<shameimaru.ayaaya@gmail.com>。版权请求可附页面及具体文件 URL、原作或权利依据、代表身份、回复方式及期望处理；不要在公开 issue 中附密码、解密后的私人内容或不必要的身份证明。详见[侵权反馈与处理](https://tenshi.qzz.io/terms-and-conditions/#feedback)及 [GitHub 的独立版权投诉程序](https://docs.github.com/en/site-policy/content-removal-policies/dmca-takedown-policy)。

公开页面另见 [服务条款](https://tenshi.qzz.io/terms-and-conditions/#open-source) 和 [隐私政策](https://tenshi.qzz.io/privacy-policy/)。
