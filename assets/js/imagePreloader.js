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
    
    // 并发加载图片，每批次最多5张
    const batchSize = 5;
    let currentIndex = 0;
    
    function loadNextBatch() {
        const batch = loadQueue.slice(currentIndex, currentIndex + batchSize);
        if (batch.length === 0) return;
        
        const promises = batch.map(img => {
            return new Promise((resolve) => {
                const preloadImg = new Image();
                let retryCount = 0;
                const maxRetries = 3;
                
                preloadImg.onerror = () => {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(() => {
                            preloadImg.src = img.dataset.src + '?retry=' + retryCount;
                        }, 500 * retryCount); // 减少重试延迟
                    } else {
                        if (img.dataset.src.includes('favicon.im')) {
                            preloadImg.src = 'https://api.iowen.cn/favicon/' + new URL(img.dataset.src).hostname;
                        } else {
                            img.style.display = 'none';
                            if (img.nextElementSibling) {
                                img.nextElementSibling.style.display = 'block';
                            }
                            resolve();
                        }
                    }
                };
                
                preloadImg.onload = () => {
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
                setTimeout(loadNextBatch, 100);
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
    // 获取所有需要预加载的图片
    const images = document.querySelectorAll('img.lozad');
    
    // 开始观察所有图片
    images.forEach(img => {
        const rect = img.getBoundingClientRect();
        // 对于首屏1200px范围内的图片，立即加载
        if (rect.top < 1200) {
            const preloadImg = new Image();
            preloadImg.onload = () => {
                requestAnimationFrame(() => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                });
            };
            preloadImg.src = img.dataset.src;
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