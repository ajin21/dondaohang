/**
 * 简单版一键上滑按钮
 * Simple Back to Top Button
 */

(function() {
    let button = null;
    const scrollThreshold = 300;

    function init() {
        button = document.getElementById('back-to-top');
        if (!button) return;

        // 滚动监听
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // 点击事件
        button.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
        });
    }

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    }

    function scrollToTop() {
        const startPosition = window.pageYOffset;
        if (startPosition === 0) return;

        const startTime = performance.now();
        const duration = Math.min(400, 200 + startPosition / 10);

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);

            window.scrollTo(0, startPosition * (1 - easeProgress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
