/**
 * 站点跨页面公共运行配置
 *
 * 只保留真正被 static/js/script.js 读取的字段：
 *   footer      —— 页脚年份与作者（年份在运行时按当前时间计算）
 *   titlePairs  —— 切到后台再回来时，标签页标题的颜文字替换
 *
 * 页面文案本身写在各自的 HTML 里，改文案请改 HTML；项目卡片文案在
 * scripts/fetch-repos.mjs（见 scripts/check-repos.mjs）。
 */
window.SITE_CONTENT = {
    footer: {
        startYear: 2022,
        author: 'GitHub@Hisou-Tenshi',
        authorUrl: 'https://github.com/Hisou-Tenshi',
        rights: 'All rights reserved.'
    },

    titlePairs: [
        { away: '( - ω - ) zzZ 睡着啦 ~', back: '( ･ω･)ﾉ 醒来了哦 ~' },
        { away: '┌(。Д。)┐ 藏起来了 ~', back: '(^・ω・^ ) 找到你啦 ~' },
        { away: '(；ω；) 人家想你 ~', back: '(*^▽^*) 好开心呀 ~' },
        { away: '(>_<) 页面崩溃！', back: '(^_^) 又好了呢！' },
        { away: '(￣ω￣;) 休息一下 ~', back: '(｀・ω・´) 开始工作！' },
        { away: '(´⊙ω⊙) 面煮好啦 ~', back: '(๑¯∀¯๑) 开动啦 ~' },
        { away: '(´⊙ω⊙) 去探险啦！', back: '(●´ω｀●) 带回宝藏 ~' },
        { away: '🌧️ 下雨收衣服啦', back: '🌈 天晴晒太阳 ~' },
        { away: '( ˘ω˘ )ｽﾔｧ 电量不足…', back: '(๑•̀ㅂ•́)و✧ 充满活力！' },
        { away: '(｡•́︿•̀｡) 偷偷说再见…', back: '(っ´ω｀ｃ) 悄悄回来啦' },
        { away: '(＞﹏＜) 故事暂停…', back: '(๑´ㅂ๑) 继续读下去 ~' },
        { away: '(☆▽☆) 变成小星星 ~', back: '(´▽｀) 变回月亮啦' },
        { away: '(ﾟ⊿ﾟ) 突然消失！', back: '(★ω★) 魔法出现 ~' },
        { away: '(´･ω･) 乖乖等你 ~', back: '(っ´▽｀)っ 欢迎回来！' },
        { away: '(=｀ω´=) 嗷呜，走开啦', back: '(^・x・^) 呼噜，蹭蹭你' },
        { away: '(⊙ˍ⊙) 天黑请闭眼', back: '(◕‿◕) 天亮啦 ~' },
        { away: '(×_×) 螺丝飞走啦', back: '(✔ᴗ✔) 修好咯！' },
        { away: '( •́ _ •̀) 演出暂停…', back: '(✧∇✧) 好戏继续！' },
        { away: '(ｏ・_・)ノ” 咻~飞走了', back: '( ﾟ▽ﾟ)/ 噗，又出现' },
        { away: '(。-ω-) 秋天落叶…', back: '(๑•̀ㅂ•́)و 春天发芽！' },
        { away: '(◉_◉) 角色掉线！', back: '(^∇^) 重新连接 ~' }
    ],
};
