// 图标缓存管理
const IconCache = {
    // 缓存键前缀
    CACHE_PREFIX: 'icon_cache_',
    CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24小时过期
    
    // 获取缓存的图标
    get(url) {
        try {
            const key = this.CACHE_PREFIX + btoa(url);
            const cached = localStorage.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.CACHE_EXPIRY) {
                    return data.dataUrl;
                } else {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.warn('Cache get error:', e);
        }
        return null;
    },
    
    // 设置缓存
    set(url, dataUrl) {
        try {
            const key = this.CACHE_PREFIX + btoa(url);
            const data = {
                dataUrl: dataUrl,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Cache set error:', e);
            // 如果存储空间不足，清理旧缓存
            this.cleanup();
        }
    },
    
    // 清理过期缓存
    cleanup() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_PREFIX)) {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const data = JSON.parse(cached);
                        if (Date.now() - data.timestamp >= this.CACHE_EXPIRY) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            });
        } catch (e) {
            console.warn('Cache cleanup error:', e);
        }
    }
};

// 热门网站图标预加载列表
const POPULAR_ICONS = [
    'https://favicon.im/mp.weixin.qq.com',
    'https://favicon.im/editor.mdnice.com',
    'https://favicon.im/www.135editor.com',
    'https://favicon.im/kimi.moonshot.cn',
    'https://favicon.im/chat100.ai',
    'https://favicon.im/www.juzikong.com',
    'https://favicon.im/tophub.today'
];

// 预加载热门图标
function preloadPopularIcons() {
    POPULAR_ICONS.forEach(url => {
        if (!IconCache.get(url)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL();
                    IconCache.set(url, dataUrl);
                } catch (e) {
                    console.warn('Failed to cache icon:', url, e);
                }
            };
            img.src = url;
        }
    });
}

// 图片预加载函数
function preloadExternalImages() {
    // 获取所有 lozad 类的图片
    const images = document.querySelectorAll('img.lozad');
    const viewportHeight = window.innerHeight;
    const initialPreloadDistance = 1200; // 首次加载1200px范围
    const scrollPreloadDistance = 2400; // 滚动时预加载2400px范围
    const preloadDistance = document.documentElement.scrollTop > 0 ? scrollPreloadDistance : initialPreloadDistance;
    
    // 创建加载队列
    const loadQueue = [];
    
    // 收集需要加载的图片
    images.forEach((img) => {
        if (!img.src && img.dataset.src) {
            const rect = img.getBoundingClientRect();
            if (rect.top > 0 && rect.top < viewportHeight + preloadDistance) {
                loadQueue.push(img);
            }
        }
    });
    
    // 并发加载图片，增加批次大小提高加载速度
    const batchSize = 8;
    let currentIndex = 0;
    
    function loadNextBatch() {
        const batch = loadQueue.slice(currentIndex, currentIndex + batchSize);
        if (batch.length === 0) return;
        
        const promises = batch.map(img => {
            return new Promise((resolve) => {
                // 首先检查缓存
                const cachedIcon = IconCache.get(img.dataset.src);
                if (cachedIcon) {
                    requestAnimationFrame(() => {
                        img.src = cachedIcon;
                        img.classList.add('loaded');
                        resolve();
                    });
                    return;
                }
                
                const preloadImg = new Image();
                let retryCount = 0;
                const maxRetries = 3;
                
                const startTime = Date.now();
                let currentAPI = null;
                
                preloadImg.onerror = () => {
                    const responseTime = Date.now() - startTime;
                    if (currentAPI && window.IconAPIManager) {
                        window.IconAPIManager.recordPerformance(currentAPI.name, false, responseTime);
                    }
                    
                    if (retryCount < maxRetries) {
                        retryCount++;
                        
                        // 使用智能API选择
                        if (window.IconAPIManager && img.dataset.src.includes('favicon.im')) {
                            try {
                                const domain = new URL(img.dataset.src).hostname;
                                currentAPI = window.IconAPIManager.getBestAPI(domain);
                                const fallbackUrl = window.IconAPIManager.buildIconURL(currentAPI, domain);
                                preloadImg.src = fallbackUrl;
                            } catch (e) {
                                // 如果API管理器失败，使用原有逻辑
                                const fallbackUrl = 'https://api.iowen.cn/favicon/' + new URL(img.dataset.src).hostname;
                                preloadImg.src = fallbackUrl;
                            }
                        } else {
                            setTimeout(() => {
                                preloadImg.src = img.dataset.src + '?retry=' + retryCount;
                            }, 200 * retryCount);
                        }
                    } else {
                        // 最终fallback：显示首字母占位符
                        img.style.display = 'none';
                        if (img.nextElementSibling) {
                            img.nextElementSibling.style.display = 'block';
                        }
                        resolve();
                    }
                };
                
                preloadImg.onload = () => {
                    const responseTime = Date.now() - startTime;
                    if (currentAPI && window.IconAPIManager) {
                        window.IconAPIManager.recordPerformance(currentAPI.name, true, responseTime);
                    }
                    
                    // 尝试缓存成功加载的图标
                    try {
                        if (preloadImg.src.includes('favicon.im') || preloadImg.src.includes('api.iowen.cn')) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = preloadImg.width;
                            canvas.height = preloadImg.height;
                            ctx.drawImage(preloadImg, 0, 0);
                            const dataUrl = canvas.toDataURL();
                            IconCache.set(img.dataset.src, dataUrl);
                        }
                    } catch (e) {
                        console.warn('Failed to cache icon:', img.dataset.src, e);
                    }
                    
                    requestAnimationFrame(() => {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        resolve();
                    });
                };
                
                preloadImg.src = img.dataset.src;
            });
        });
        
        Promise.all(promises).then(() => {
            currentIndex += batchSize;
            if (currentIndex < loadQueue.length) {
                setTimeout(loadNextBatch, 50);
            }
        });
    }
    
    // 开始加载第一批
    if (loadQueue.length > 0) {
        loadNextBatch();
    }
}

// 使用 Intersection Observer 来触发预加载
const imageObserver = new IntersectionObserver((entries) => {
    if (!window.requestIdleCallback) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (!img.src && img.dataset.src) {
                    requestAnimationFrame(() => preloadExternalImages());
                }
            }
        });
    } else {
        window.requestIdleCallback(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (!img.src && img.dataset.src) {
                        requestAnimationFrame(() => preloadExternalImages());
                    }
                }
            });
        }, { timeout: 1000 });
    }
}, {
    rootMargin: '300px 0px', // 提前300px观察
    threshold: 0
});

// 监听滚动事件，使用 requestAnimationFrame 和节流优化
let ticking = false;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            if (Math.abs(currentScrollY - lastScrollY) > 50) { // 只在滚动距离超过50px时触发
                preloadExternalImages();
                lastScrollY = currentScrollY;
            }
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// 在render函数执行后立即初始化
function initializeImagePreloader() {
    // 清理过期缓存
    IconCache.cleanup();
    
    // 预加载热门图标
    preloadPopularIcons();
    
    // 获取所有需要预加载的图片
    const images = document.querySelectorAll('img.lozad');
    
    // 开始观察所有图片
    images.forEach(img => {
        const rect = img.getBoundingClientRect();
        // 对于首屏1200px范围内的图片，立即加载
        if (rect.top < 1200) {
            // 首先检查缓存
            const cachedIcon = IconCache.get(img.dataset.src);
            if (cachedIcon) {
                requestAnimationFrame(() => {
                    img.src = cachedIcon;
                    img.classList.add('loaded');
                });
            } else {
                const preloadImg = new Image();
                preloadImg.onload = () => {
                    requestAnimationFrame(() => {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                    });
                };
                preloadImg.src = img.dataset.src;
            }
        } else {
            imageObserver.observe(img);
        }
    });
    
    // 延迟执行一次预加载，处理可能的遗漏
    setTimeout(() => {
        preloadExternalImages();
    }, 100);
}

// 导出初始化函数
window.initializeImagePreloader = initializeImagePreloader;

// 添加CSS来处理加载状态
const style = document.createElement('style');
style.textContent = `
    .lozad {
        opacity: 0;
        transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: opacity;
        transform: translateZ(0);
    }
    .lozad.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);