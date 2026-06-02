/* ============================================
   全史通 v2.0 — 全局共享交互脚本
   渐进增强：JS加载失败时所有内容可见
   ============================================ */

(function () {
    'use strict';

    // 0. 渐进增强标记
    var root = document.documentElement;
    root.classList.add('js-animate');
    document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.remove('visible');
    });

    // 1. 阅读进度条
    var progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', updateProgressBar, { passive: true });
    }
    function updateProgressBar() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
            progressBar.style.width = ((scrollTop / scrollHeight) * 100) + '%';
        }
    }

    // 2. 阅读时间估算
    var readingTimeBadge = document.getElementById('readingTime');
    var mainContainer = document.querySelector('.container');
    if (readingTimeBadge && mainContainer) {
        var text = mainContainer.innerText || mainContainer.textContent || '';
        var charCount = text.replace(/\s/g, '').length;
        // 中文约400字/分钟
        var minutes = Math.ceil(charCount / 400);
        readingTimeBadge.textContent = minutes <= 1 ? '< 1 分钟' : minutes + ' 分钟阅读';
    }

    // 3. 返回顶部 & 阅读时间显示
    var backToTop = document.getElementById('backToTop');
    var scrollThreshold = 400;

    window.addEventListener('scroll', function () {
        var scrolled = window.scrollY > scrollThreshold;
        if (backToTop) {
            backToTop.classList.toggle('visible', scrolled);
        }
        if (readingTimeBadge) {
            readingTimeBadge.classList.toggle('visible', scrolled);
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. IntersectionObserver 滚动显示
    var fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        fadeElements.forEach(function (el) { observer.observe(el); });
    } else {
        fadeElements.forEach(function (el) { el.classList.add('visible'); });
    }

    // 5. 平滑锚点滚动
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (link) {
            var target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // 6. Accordion 折叠面板
    document.querySelectorAll('.accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var item = this.parentElement;
            var isActive = item.classList.contains('active');
            var siblings = item.parentElement.querySelectorAll('.accordion-item');
            siblings.forEach(function (sib) { sib.classList.remove('active'); });
            if (!isActive) item.classList.add('active');
        });
    });

    // 7. 导航栏滚动效果
    var nav = document.querySelector('.nav');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 30);
        }, { passive: true });
    }

    // 8. 移动端汉堡菜单
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = nav ? nav.querySelector('div') : null;
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.textContent = navLinks.classList.contains('open') ? '\u2715' : '\u2630';
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.textContent = '\u2630';
            });
        });
    }

    // 9. Tab 选项卡切换
    document.querySelectorAll('.tab-list').forEach(function (tabList) {
        tabList.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = this.getAttribute('data-tab');
                if (!targetId) return;
                tabList.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                var tabsContainer = tabList.parentElement;
                tabsContainer.querySelectorAll('.tab-panel').forEach(function (panel) { panel.classList.remove('active'); });
                var targetPanel = document.getElementById(targetId);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    });

    // 10. 朝代切换器
    document.querySelectorAll('.dynasty-switcher').forEach(function (switcher) {
        var btn = switcher.querySelector('.dynasty-switcher-btn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                document.querySelectorAll('.dynasty-switcher').forEach(function (s) {
                    if (s !== switcher) s.classList.remove('open');
                });
                switcher.classList.toggle('open');
            });
            document.addEventListener('click', function (e) {
                if (!switcher.contains(e.target)) switcher.classList.remove('open');
            });
        }
    });

    // 11. 主题切换（暗/亮）
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // 读取保存的主题
        var savedTheme = localStorage.getItem('qst-theme');
        if (savedTheme) {
            root.setAttribute('data-theme', savedTheme);
            themeToggle.textContent = savedTheme === 'light' ? '\u263E' : '\u263D';
        }

        themeToggle.addEventListener('click', function () {
            var current = root.getAttribute('data-theme');
            var next = current === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            themeToggle.textContent = next === 'light' ? '\u263E' : '\u263D';
            localStorage.setItem('qst-theme', next);
        });
    }

    // 12. 已可见元素立即激活
    setTimeout(function () {
        document.querySelectorAll('.fade-in:not(.visible)').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 60);

    // 13. 朝代页面导航增强
    if (nav) {
        var logoLink = nav.querySelector('a.logo');
        if (logoLink) {
            var logoHref = logoLink.getAttribute('href');
            if (logoHref && logoHref === '../index.html') {
                logoLink.setAttribute('href', '../quanshitong.html');
                var portalLink = document.createElement('a');
                portalLink.setAttribute('href', '../index.html');
                portalLink.textContent = '\uD83C\uDFE0';
                portalLink.style.cssText = 'font-size:0.9em;margin-right:4px;';
                logoLink.parentNode.insertBefore(portalLink, logoLink.nextSibling);
            }
        }
    }

    // 14. 键盘快捷键（可选增强）
    document.addEventListener('keydown', function (e) {
        // Escape 关闭所有下拉
        if (e.key === 'Escape') {
            document.querySelectorAll('.dynasty-switcher.open').forEach(function (s) {
                s.classList.remove('open');
            });
            if (navLinks) navLinks.classList.remove('open');
            if (navToggle) navToggle.textContent = '\u2630';
        }
        // T 键切换主题
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (themeToggle) themeToggle.click();
        }
    });

    // 15. 首页滚动提示点击
    var scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function () {
            var intro = document.getElementById('intro');
            if (intro) {
                intro.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
            }
        });
    }

})();
