/**
 * kb-article.js — 阅读型页面共享交互
 * 供 guns/xixi/finance 等阅读型板块使用
 * 功能：TOC切换、返回顶部、阅读进度条、阅读时间、主题切换
 */
(function () {
    'use strict';

    /* ---- 配置 ---- */
    var SCROLL_THRESHOLD = 400;
    var CHARS_PER_MINUTE = 400; // 中文阅读速度
    var STORAGE_KEY_THEME = 'kb-theme';

    /* ---- DOM 缓存 ---- */
    var backTopBtn    = document.getElementById('articleBackTop');
    var toolbar       = document.getElementById('articleToolbar');
    var readingTimeEl = document.getElementById('articleReadingTime');
    var progressBar   = document.getElementById('articleProgress');
    var themeToggle   = document.getElementById('articleThemeToggle');
    var tocEl         = document.getElementById('toc');
    var tocToggleBtns = document.querySelectorAll('.toc-toggle');

    /* ---- 初始化 ---- */
    function init() {
        applySavedTheme();
        bindEvents();
        estimateReadingTime();
    }

    /* ---- 主题 ---- */
    function applySavedTheme() {
        var saved = localStorage.getItem(STORAGE_KEY_THEME);
        if (saved === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next === 'dark' ? '' : 'light');
        localStorage.setItem(STORAGE_KEY_THEME, next);
        if (themeToggle) {
            themeToggle.textContent = next === 'light' ? '\u263E' : '\u263D';
        }
    }

    /* ---- 阅读时间 ---- */
    function estimateReadingTime() {
        var contentEl = document.querySelector('.article-content') || document.querySelector('.content');
        if (!contentEl || !readingTimeEl) return;
        var text = contentEl.textContent || '';
        var charCount = text.replace(/\s/g, '').length;
        var minutes = Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE));
        readingTimeEl.textContent = '\u9605\u8BFB\u7EA6 ' + minutes + ' \u5206\u949F';
    }

    /* ---- TOC 切换 ---- */
    function toggleToc() {
        if (tocEl) {
            tocEl.classList.toggle('open');
        }
    }

    /* ---- 滚动处理 ---- */
    function onScroll() {
        var scrollY = window.scrollY || window.pageYOffset;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

        // 进度条
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }

        // 返回顶部
        if (backTopBtn) {
            if (scrollY > SCROLL_THRESHOLD) {
                backTopBtn.classList.add('visible');
            } else {
                backTopBtn.classList.remove('visible');
            }
        }

        // 工具栏
        if (toolbar) {
            if (scrollY > SCROLL_THRESHOLD) {
                toolbar.classList.add('visible');
            } else {
                toolbar.classList.remove('visible');
            }
        }
    }

    /* ---- 事件绑定 ---- */
    function bindEvents() {
        // 滚动
        window.addEventListener('scroll', onScroll, { passive: true });

        // 返回顶部
        if (backTopBtn) {
            backTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 主题切换
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // TOC 切换按钮
        for (var i = 0; i < tocToggleBtns.length; i++) {
            tocToggleBtns[i].addEventListener('click', toggleToc);
        }

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            if (e.key === 't' || e.key === 'T') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    toggleTheme();
                }
            }
            if (e.key === 'Escape') {
                if (tocEl) {
                    tocEl.classList.remove('open');
                }
            }
        });
    }

    /* ---- 启动 ---- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
