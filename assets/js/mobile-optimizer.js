/**
 * 移动端性能优化器
 * Mobile Performance Optimizer
 * 
 * 专门针对移动端的性能优化和用户体验增强
 */

class MobileOptimizer {
    constructor() {
        this.isTouch = 'ontouchstart' in window;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.init();
    }
    
    init() {
        if (this.isMobile || window.innerWidth <= 768) {
            this.optimizeViewport();
            this.optimizeImages();
            this.optimizeScrolling();
            this.optimizeTouch();
            this.optimizePerformance();
            this.handleOrientationChange();
        }
    }
    
    // 视口优化
    optimizeViewport() {
        // 确保视口设置正确
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // 设置最佳视口配置
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        
        // iOS Safari 特殊处理
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            this.optimizeForIOS();
        }
        
        // Android 特殊处理
        if (/Android/.test(navigator.userAgent)) {
            this.optimizeForAndroid();
        }
    }
    
    // iOS 优化
    optimizeForIOS() {
        // 防止双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // 处理安全区域
        if (CSS.supports('padding: env(safe-area-inset-top)')) {
            document.body.style.paddingTop = 'env(safe-area-inset-top)';
            document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
        }
    }
    
    // Android 优化
    optimizeForAndroid() {
        // 优化 Android 滚动性能
        document.body.style.overscrollBehavior = 'contain';
        
        // 优化 Android 键盘处理
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDiff = this.viewport.height - currentHeight;
            
            // 检测键盘是否弹出
            if (heightDiff > 150) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
    }
    
    // 图片优化
    optimizeImages() {
        // 懒加载优化
        const images = document.querySelectorAll('img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // 预加载图片
                        if (img.dataset.src && !img.src) {
                            img.src = img.dataset.src;
                            img.classList.add('fade-in');
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            images.forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        }
        
        // 图片错误处理
        images.forEach(img => {
            img.addEventListener('error', () => {
                img.style.display = 'none';
                const fallback = img.nextElementSibling;
                if (fallback && fallback.tagName === 'SPAN') {
                    fallback.style.display = 'flex';
                }
            });
        });
    }
    
    // 滚动优化
    optimizeScrolling() {
        // 平滑滚动
        if (CSS.supports('scroll-behavior', 'smooth')) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        // 滚动性能优化
        let ticking = false;
        
        const updateScrollPosition = () => {
            const scrollTop = window.pageYOffset;
            
            // 更新回到顶部按钮 - 配合新的CSS类
            const backToTop = document.getElementById('back-to-top');
            if (backToTop) {
                if (scrollTop > 300) {
                    backToTop.classList.add('show');
                } else {
                    backToTop.classList.remove('show');
                }
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });
        
        // 阻止过度滚动
        document.body.addEventListener('touchmove', (e) => {
            if (document.body.classList.contains('sidebar-open')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // 触摸优化
    optimizeTouch() {
        // 移除点击延迟
        if (this.isTouch) {
            const clickableElements = document.querySelectorAll('a, button, .box2, .clickable');
            
            clickableElements.forEach(element => {
                element.style.touchAction = 'manipulation';
                element.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
            });
        }
        
        // 优化触摸反馈
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.box2, button, a');
            if (target) {
                target.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.box2, button, a');
            if (target) {
                setTimeout(() => {
                    target.classList.remove('touch-active');
                }, 150);
            }
        }, { passive: true });
        
        document.addEventListener('touchcancel', (e) => {
            const target = e.target.closest('.box2, button, a');
            if (target) {
                target.classList.remove('touch-active');
            }
        }, { passive: true });
    }
    
    // 性能优化
    optimizePerformance() {
        // 减少重绘和回流
        const animatedElements = document.querySelectorAll('.box2, .xe-widget');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
            el.style.transform = 'translateZ(0)';
        });
        
        // 优化字体加载
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.body.classList.add('fonts-loaded');
            });
        }
        
        // 预连接重要资源
        this.preconnectResources();
        
        // 内存管理
        this.setupMemoryManagement();
    }
    
    // 预连接资源
    preconnectResources() {
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // 内存管理
    setupMemoryManagement() {
        // 清理不可见的图片
        const cleanupImages = () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
                
                if (!isVisible && img.src && img.dataset.src) {
                    img.removeAttribute('src');
                    img.classList.remove('fade-in');
                }
            });
        };
        
        // 定期清理
        setInterval(cleanupImages, 30000);
        
        // 页面隐藏时清理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cleanupImages();
            }
        });
    }
    
    // 方向变化处理
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // 延迟处理，等待方向变化完成
            setTimeout(() => {
                this.viewport.width = window.innerWidth;
                this.viewport.height = window.innerHeight;
                
                // 重新计算布局
                this.recalculateLayout();
                
                // 关闭侧边栏
                if (window.ResponsiveHandler && window.ResponsiveHandler.isSidebarOpen()) {
                    window.ResponsiveHandler.closeSidebar();
                }
            }, 200);
        });
    }
    
    // 重新计算布局
    recalculateLayout() {
        // 强制重绘
        document.body.style.display = 'none';
        document.body.offsetHeight; // 触发重排
        document.body.style.display = '';
        
        // 重新初始化某些组件
        if (window.SearchComponent) {
            // 重新调整搜索组件
            const searchContainer = document.querySelector('.modern-search-container');
            if (searchContainer) {
                searchContainer.style.maxWidth = `${this.viewport.width - 32}px`;
            }
        }
    }
    
    // 网络状态优化
    optimizeForNetworkCondition() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            // 根据网络状况调整策略
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.enableLowBandwidthMode();
            } else if (connection.effectiveType === '3g') {
                this.enableMediumBandwidthMode();
            }
            
            // 监听网络变化
            connection.addEventListener('change', () => {
                this.optimizeForNetworkCondition();
            });
        }
    }
    
    // 低带宽模式
    enableLowBandwidthMode() {
        document.body.classList.add('low-bandwidth');
        
        // 禁用非必要动画
        const style = document.createElement('style');
        style.textContent = `
            .low-bandwidth * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
        
        // 延迟加载非关键图片
        const images = document.querySelectorAll('img:not([data-critical])');
        images.forEach(img => {
            if (img.src) {
                img.dataset.src = img.src;
                img.removeAttribute('src');
            }
        });
    }
    
    // 中等带宽模式
    enableMediumBandwidthMode() {
        document.body.classList.add('medium-bandwidth');
        
        // 减少动画复杂度
        const style = document.createElement('style');
        style.textContent = `
            .medium-bandwidth .box2:hover {
                transform: translateY(-2px) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 调试信息
    getDebugInfo() {
        return {
            viewport: this.viewport,
            isTouch: this.isTouch,
            isMobile: this.isMobile,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }
}

// 添加触摸反馈样式
const touchStyles = document.createElement('style');
touchStyles.textContent = `
    .touch-active {
        opacity: 0.7 !important;
        transform: scale(0.98) !important;
        transition: all 0.1s ease !important;
    }
    
    .keyboard-open .footer-container,
    .keyboard-open #back-to-top {
        display: none !important;
    }
    
    .fonts-loaded {
        font-display: swap;
    }
    
    @media (max-width: 768px) {
        .low-bandwidth .xe-widget {
            box-shadow: none !important;
            border: 1px solid #e0e0e0 !important;
        }
        
        .medium-bandwidth .box2 {
            transition: transform 0.1s ease !important;
        }
    }
`;
document.head.appendChild(touchStyles);

// 全局实例
let mobileOptimizer = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        mobileOptimizer = new MobileOptimizer();
        
        // 暴露到全局作用域
        window.MobileOptimizer = mobileOptimizer;
        
        // 调试模式
        if (window.location.search.includes('debug=mobile')) {
            console.log('Mobile Optimizer Debug Info:', mobileOptimizer.getDebugInfo());
        }
        
    } catch (error) {
        console.warn('MobileOptimizer initialization failed:', error);
    }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimizer;
}