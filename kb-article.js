/**
 * kb-article.js — 阅读型页面共享交互
 * 供 guns/xixi/finance 等阅读型板块使用
 * 功能：TOC切换、返回顶部、阅读进度条、阅读时间、主题切换、记笔记
 */
(function () {
    'use strict';

    /* ---- 配置 ---- */
    var SCROLL_THRESHOLD = 400;
    var CHARS_PER_MINUTE = 400; // 中文阅读速度
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
        injectNoteButton();
        injectNoteModal();
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

    /* ---- 笔记按钮注入 ---- */
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

    /* ---- 笔记弹窗注入 ---- */
    function injectNoteModal() {
        var overlay = document.createElement('div');
        overlay.className = 'note-modal-overlay';
        overlay.id = 'noteModalOverlay';

        var categoryOptions = NOTE_CATEGORIES.map(function (c) {
            return '<option value="' + c.value + '">' + c.label + '</option>';
        }).join('');

        overlay.innerHTML =
            '<div class="note-modal" id="noteModal">' +
                '<div class="note-modal-header">' +
                    '<span class="note-modal-title">&#x1F4DD; 记笔记</span>' +
                    '<button class="note-modal-close" id="noteModalClose">&times;</button>' +
                '</div>' +
                '<div class="note-modal-body">' +
                    '<label class="note-label">&#x1F4C1; 分类</label>' +
                    '<select class="note-select" id="noteCategory">' + categoryOptions + '</select>' +
                    '<label class="note-label">&#x270F;&#xFE0F; 内容</label>' +
                    '<textarea class="note-textarea" id="noteText" placeholder="写下你的想法..."></textarea>' +
                '</div>' +
                '<div class="note-modal-footer">' +
                    '<button class="note-btn note-btn-cancel" id="noteCancel">取消</button>' +
                    '<button class="note-btn note-btn-save" id="noteSave">保存</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // 弹窗事件
        document.getElementById('noteModalClose').addEventListener('click', closeNoteModal);
        document.getElementById('noteCancel').addEventListener('click', closeNoteModal);
        document.getElementById('noteSave').addEventListener('click', saveNote);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeNoteModal();
        });

        // Escape 关闭
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closeNoteModal();
            }
        });
    }

    function openNoteModal() {
        var overlay = document.getElementById('noteModalOverlay');
        if (overlay) {
            overlay.classList.add('open');
            document.getElementById('noteText').value = '';
            // 默认根据页面路径猜测分类
            var path = window.location.pathname || '';
            var sel = document.getElementById('noteCategory');
            if (path.indexOf('finance') !== -1) sel.value = 'finance';
            else if (path.indexOf('qin') !== -1 || path.indexOf('han') !== -1 || path.indexOf('sang') !== -1 || path.indexOf('jin') !== -1 || path.indexOf('nanbei') !== -1 || path.indexOf('sui') !== -1 || path.indexOf('tang') !== -1 || path.indexOf('wudai') !== -1 || path.indexOf('song') !== -1 || path.indexOf('yuan') !== -1 || path.indexOf('ming') !== -1 || path.indexOf('qing') !== -1 || path.indexOf('minguo') !== -1 || path.indexOf('quanshitong') !== -1) sel.value = 'history';
            else if (path.indexOf('guns') !== -1) sel.value = 'reading';
            else if (path.indexOf('xixi') !== -1) sel.value = 'life';
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
