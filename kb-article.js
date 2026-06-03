/**
 * kb-article.js — 阅读型页面共享交互
 * 供 guns/xixi/finance 等阅读型板块使用
 * 功能：TOC切换、返回顶部、阅读进度条、阅读时间、主题切换、记笔记、手机底部操作栏
 */
(function () {
    'use strict';

    /* ---- 配置 ---- */
    var SCROLL_THRESHOLD = 400;
    var CHARS_PER_MINUTE = 400;
    var STORAGE_KEY_THEME = 'kb-theme';
    var STORAGE_KEY_NOTES = 'kb-notes';

    /* ---- 笔记分类 ---- */
    var NOTE_CATEGORIES = [
        { value: 'finance', label: '财经想法' },
        { value: 'history', label: '历史理解' },
        { value: 'reading', label: '读书笔记' },
        { value: 'life', label: '生活感悟' },
        { value: 'other', label: '其他' }
    ];

    /* ---- 笔记API ---- */
    var NoteAPI = {
        getAll: function () {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES)) || []; }
            catch (e) { return []; }
        },
        save: function (notes) {
            localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
        },
        add: function (note) {
            var notes = this.getAll();
            note.id = 'n_' + Date.now();
            note.createdAt = new Date().toISOString();
            notes.unshift(note);
            this.save(notes);
            return note;
        },
        remove: function (id) {
            var notes = this.getAll().filter(function (n) { return n.id !== id; });
            this.save(notes);
        }
    };

    /* ---- DOM 缓存 ---- */
    var backTopBtn    = document.getElementById('articleBackTop');
    var themeToggle   = document.getElementById('articleThemeToggle');
    var tocEl         = document.getElementById('toc');
    var tocToggleBtns = document.querySelectorAll('.toc-toggle');

    /* ---- 初始化 ---- */
    function init() {
        applySavedTheme();
        bindEvents();
        estimateReadingTime();
        injectNoteButton();
        injectNoteModal();
        injectMobileBar();
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
        // 同步更新底部栏图标
        var mobileThemeBtn = document.getElementById('mobileThemeBtn');
        if (mobileThemeBtn) {
            mobileThemeBtn.textContent = next === 'light' ? '☀️' : '🌙';
        }
        if (themeToggle) {
            themeToggle.textContent = next === 'light' ? '☾' : '☀';
        }
    }

    /* ---- 阅读时间 ---- */
    function estimateReadingTime() {
        var contentEl = document.querySelector('.article-content') || document.querySelector('.content');
        var readingTimeEl = document.getElementById('articleReadingTime');
        if (!contentEl || !readingTimeEl) return;
        var text = contentEl.textContent || '';
        var charCount = text.replace(/\s/g, '').length;
        var minutes = Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE));
        readingTimeEl.textContent = '阅读约 ' + minutes + ' 分钟';
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
        var progressBar = document.getElementById('articleProgress');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }

        // 返回顶部（桌面端按钮 + 手机底部栏）
        if (backTopBtn) {
            if (scrollY > SCROLL_THRESHOLD) {
                backTopBtn.classList.add('visible');
            } else {
                backTopBtn.classList.remove('visible');
            }
        }
        var mobileBackTop = document.getElementById('mobileBackTop');
        if (mobileBackTop) {
            if (scrollY > SCROLL_THRESHOLD) {
                mobileBackTop.classList.add('visible');
            } else {
                mobileBackTop.classList.remove('visible');
            }
        }

        // 工具栏（桌面端）
        var toolbar = document.getElementById('articleToolbar');
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
        window.addEventListener('scroll', onScroll, { passive: true });

        if (backTopBtn) {
            backTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        for (var i = 0; i < tocToggleBtns.length; i++) {
            tocToggleBtns[i].addEventListener('click', toggleToc);
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 't' || e.key === 'T') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    toggleTheme();
                }
            }
            if (e.key === 'Escape') {
                if (tocEl) tocEl.classList.remove('open');
                closeNoteModal();
            }
        });
    }

    /* ========== 手机底部操作栏 ========== */
    function injectMobileBar() {
        var existing = document.getElementById('articleMobileBar');
        if (existing) return;

        var bar = document.createElement('div');
        bar.className = 'article-mobile-bar';
        bar.id = 'articleMobileBar';
        bar.innerHTML =
            '<button class="mbtn mbtn-back" id="mobileBack" aria-label="返回知识库">←</button>' +
            '<button class="mbtn mbtn-top" id="mobileBackTop" aria-label="回到顶部">↑</button>' +
            '<button class="mbtn mbtn-theme" id="mobileThemeBtn" aria-label="切换主题">' +
                (document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙') +
            '</button>' +
            '<button class="mbtn mbtn-note" id="mobileNoteBtn" aria-label="记笔记">📝</button>';

        document.body.appendChild(bar);

        document.getElementById('mobileBack').addEventListener('click', function () {
            // 统一回到知识库首页（/quanshitong/index.html）
            var base = window.location.pathname.indexOf('/quanshitong/') !== -1
                ? '/quanshitong/index.html'
                : '../index.html';
            window.location.href = base;
        });

        document.getElementById('mobileBackTop').addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.getElementById('mobileThemeBtn').addEventListener('click', toggleTheme);

        document.getElementById('mobileNoteBtn').addEventListener('click', openNoteModal);
    }

    /* ========== 笔记按钮（桌面端） ========== */
    function injectNoteButton() {
        var btn = document.createElement('button');
        btn.className = 'article-note-btn';
        btn.id = 'articleNoteBtn';
        btn.innerHTML = '&#x1F4DD;';
        btn.title = '记笔记';
        btn.setAttribute('aria-label', '记笔记');
        document.body.appendChild(btn);
        btn.addEventListener('click', openNoteModal);
    }

    /* ========== 笔记弹窗 ========== */
    function injectNoteModal() {
        var overlay = document.createElement('div');
        overlay.className = 'note-modal-overlay';
        overlay.id = 'noteModalOverlay';

        // 自定义下拉 HTML（替换原生 select）
        var dropdownOptions = NOTE_CATEGORIES.map(function (c, i) {
            return '<div class="note-dropdown-option' + (i === 0 ? ' selected' : '') +
                '" data-value="' + c.value + '" data-label="' + c.label + '">' + c.label + '</div>';
        }).join('');

        overlay.innerHTML =
            '<div class="note-modal" id="noteModal">' +
                '<div class="note-modal-header">' +
                    '<span class="note-modal-title">&#x1F4DD; 记笔记</span>' +
                    '<button class="note-modal-close" id="noteModalClose">&times;</button>' +
                '</div>' +
                '<div class="note-modal-body">' +
                    '<label class="note-label">&#x1F4C1; 分类</label>' +
                    '<div class="note-dropdown-wrapper" id="noteCategoryWrapper">' +
                        '<button class="note-dropdown-btn" id="noteCategoryBtn">' +
                            '<span class="note-dropdown-label" id="noteCategoryLabel">财经想法</span>' +
                            '<span class="note-dropdown-arrow">▾</span>' +
                        '</button>' +
                        '<div class="note-dropdown-list" id="noteCategoryList">' +
                            dropdownOptions +
                        '</div>' +
                        '<input type="hidden" id="noteCategory" value="finance">' +
                    '</div>' +
                    '<label class="note-label">&#x270F;&#xFE0F; 内容</label>' +
                    '<textarea class="note-textarea" id="noteText" placeholder="写下你的想法..."></textarea>' +
                '</div>' +
                '<div class="note-modal-footer">' +
                    '<button class="note-btn note-btn-cancel" id="noteCancel">取消</button>' +
                    '<button class="note-btn note-btn-save" id="noteSave">保存</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // 下拉交互
        initNoteDropdown();

        document.getElementById('noteModalClose').addEventListener('click', closeNoteModal);
        document.getElementById('noteCancel').addEventListener('click', closeNoteModal);
        document.getElementById('noteSave').addEventListener('click', saveNote);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeNoteModal();
        });
    }

    /* ---- 自定义下拉初始化 ---- */
    function initNoteDropdown() {
        var btn  = document.getElementById('noteCategoryBtn');
        var list = document.getElementById('noteCategoryList');
        var label = document.getElementById('noteCategoryLabel');
        var input = document.getElementById('noteCategory');

        if (!btn || !list) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            list.classList.toggle('open');
        });

        list.addEventListener('click', function (e) {
            var option = e.target.closest('.note-dropdown-option');
            if (!option) return;

            var value = option.getAttribute('data-value');
            var text  = option.getAttribute('data-label');

            // 更新隐藏 input
            input.value = value;

            // 更新按钮文字
            label.textContent = text;

            // 更新选中状态
            var all = list.querySelectorAll('.note-dropdown-option');
            for (var i = 0; i < all.length; i++) {
                all[i].classList.remove('selected');
            }
            option.classList.add('selected');

            // 关闭列表
            list.classList.remove('open');
        });

        // 点击外部关闭
        document.addEventListener('click', function () {
            if (list) list.classList.remove('open');
        });
    }

    function openNoteModal() {
        var overlay = document.getElementById('noteModalOverlay');
        if (overlay) {
            overlay.classList.add('open');
            document.getElementById('noteText').value = '';

            // 默认根据页面路径猜测分类
            var path = window.location.pathname || '';
            var categoryMap = {
                finance: 'finance',
                qin: 'history', han: 'history', sang: 'history', jin: 'history',
                nanbei: 'history', sui: 'history', tang: 'history', wudai: 'history',
                song: 'history', yuan: 'history', ming: 'history', qing: 'history',
                minguo: 'history', quanshitong: 'history',
                guns: 'reading', xixi: 'life'
            };
            var guessed = 'other';
            var keys = Object.keys(categoryMap);
            for (var i = 0; i < keys.length; i++) {
                if (path.indexOf(keys[i]) !== -1) {
                    guessed = categoryMap[keys[i]];
                    break;
                }
            }

            // 更新自定义下拉的选中状态
            var input = document.getElementById('noteCategory');
            var label = document.getElementById('noteCategoryLabel');
            var list  = document.getElementById('noteCategoryList');
            input.value = guessed;
            var all = list.querySelectorAll('.note-dropdown-option');
            for (var j = 0; j < all.length; j++) {
                var v = all[j].getAttribute('data-value');
                if (v === guessed) {
                    all[j].classList.add('selected');
                    label.textContent = all[j].getAttribute('data-label');
                } else {
                    all[j].classList.remove('selected');
                }
            }

            setTimeout(function () { document.getElementById('noteText').focus(); }, 100);
        }
    }

    function closeNoteModal() {
        var overlay = document.getElementById('noteModalOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    function saveNote() {
        var text = document.getElementById('noteText').value.trim();
        if (!text) {
            document.getElementById('noteText').style.borderColor = '#ef4444';
            setTimeout(function () {
                document.getElementById('noteText').style.borderColor = '';
            }, 1500);
            return;
        }
        var category = document.getElementById('noteCategory').value;
        var categoryLabel = NOTE_CATEGORIES.filter(function (c) { return c.value === category; })[0].label;

        NoteAPI.add({
            category: category,
            categoryLabel: categoryLabel,
            text: text,
            pagePath: window.location.pathname.replace(/^\/quanshitong\//, ''),
            pageTitle: document.title.split('|')[0].trim()
        });

        closeNoteModal();
        showToast('笔记已保存');
    }

    /* ---- Toast 提示 ---- */
    function showToast(msg) {
        var existing = document.querySelector('.note-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'note-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.classList.add('visible'); }, 10);
        setTimeout(function () {
            toast.classList.remove('visible');
            setTimeout(function () { toast.remove(); }, 300);
        }, 2000);
    }

    /* ---- 启动 ---- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
