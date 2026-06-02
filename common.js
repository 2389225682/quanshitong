/* ============================================
   全史通 - 全局共享交互脚本 v2.0
   渐进增强：JS加载失败时所有内容可见
   ============================================ */

(function () {
    'use strict';

    // 0. 渐进增强标记：JS加载成功 → 激活动画
    var root = document.documentElement;
    root.classList.add('js-animate');
    // 立即隐藏所有 .fade-in 元素（CSS已准备好过渡效果）
    document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.remove('visible');
    });

    // 1. 阅读进度条
    var progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', function () {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                progressBar.style.width = ((scrollTop / scrollHeight) * 100) + '%';
            }
        }, { passive: true });
    }

    // 2. 回到顶部按钮
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. IntersectionObserver 滚动显示
    var fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        fadeElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show all immediately
        fadeElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // 4. 平滑锚点滚动
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

    // 5. Accordion 折叠面板
    document.querySelectorAll('.accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var item = this.parentElement;
            var isActive = item.classList.contains('active');

            // 关闭同组其他面板
            var siblings = item.parentElement.querySelectorAll('.accordion-item');
            siblings.forEach(function (sib) {
                sib.classList.remove('active');
            });

            // 切换当前
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 6. 导航栏滚动效果
    var nav = document.querySelector('.nav');
    if (nav) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 7. 移动端汉堡菜单
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

    // 8. Tab 选项卡切换
    document.querySelectorAll('.tab-list').forEach(function (tabList) {
        tabList.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = this.getAttribute('data-tab');
                if (!targetId) return;

                tabList.querySelectorAll('.tab-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');

                var tabsContainer = tabList.parentElement;
                tabsContainer.querySelectorAll('.tab-panel').forEach(function (panel) {
                    panel.classList.remove('active');
                });
                var targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    });

    // 9. 朝代切换器 - 点击切换（class控制，不冲突CSS hover）
    document.querySelectorAll('.dynasty-switcher').forEach(function (switcher) {
        var btn = switcher.querySelector('.dynasty-switcher-btn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                // Close all others
                document.querySelectorAll('.dynasty-switcher').forEach(function (s) {
                    if (s !== switcher) s.classList.remove('open');
                });
                switcher.classList.toggle('open');
            });

            // Close on click outside
            document.addEventListener('click', function (e) {
                if (!switcher.contains(e.target)) {
                    switcher.classList.remove('open');
                }
            });
        }
    });

    // 10. 已可见元素立即激活
    setTimeout(function () {
        document.querySelectorAll('.fade-in:not(.visible)').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 50);

    // 11. 朝代页面导航增强：logo→全史通首页 + 🏠→统一门户
    if (nav) {
        var logoLink = nav.querySelector('a.logo');
        if (logoLink) {
            var logoHref = logoLink.getAttribute('href');
            // 朝代子页面 logo 指向 ../index.html，改为 ../quanshitong.html
            if (logoHref && logoHref === '../index.html') {
                logoLink.setAttribute('href', '../quanshitong.html');
                // 在 logo 旁边插入门户首页按钮
                var portalLink = document.createElement('a');
                portalLink.setAttribute('href', '../index.html');
                portalLink.textContent = '🏠';
                portalLink.style.cssText = 'font-size:0.9em;margin-right:4px;';
                logoLink.parentNode.insertBefore(portalLink, logoLink.nextSibling);
            }
        }
    }

})();
