// 图片预加载函数
function preloadExternalImages() {
    // 获取所有 lozad 类的图片
    const images = document.querySelectorAll('img.lozad');
    const viewportHeight = window.innerHeight;
    const preloadDistance = 1000; // 预加载视窗下方1000px的图片
    
    images.forEach((img) => {
        // 如果图片还没有被加载（没有src属性）
        if (!img.src && img.dataset.src) {
            const rect = img.getBoundingClientRect();
            
            // 如果图片在预加载范围内
            if (rect.top > 0 && rect.top < viewportHeight + preloadDistance) {
                // 创建一个新的Image对象来预加载
                const preloadImg = new Image();
                
                // 设置加载错误处理
                preloadImg.onerror = () => {
                    img.style.display = 'none';
                    if (img.nextElementSibling) {
                        img.nextElementSibling.style.display = 'block';
                    }
                };
                
                // 图片加载成功后
                preloadImg.onload = () => {
                    // 设置原始图片的src
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                };
                
                // 开始加载图片
                preloadImg.src = img.dataset.src;
            }
        }
    });
}

// 使用 Intersection Observer 来触发预加载
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (!img.src && img.dataset.src) {
                preloadExternalImages();
            }
        }
    });
}, {
    rootMargin: '50px 0px', // 提前50px观察
    threshold: 0.1
});

// 监听滚动事件，使用节流控制调用频率
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            preloadExternalImages();
            scrollTimeout = null;
        }, 200); // 200ms的节流
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取所有需要预加载的图片
    const images = document.querySelectorAll('img.lozad');
    
    // 开始观察所有图片
    images.forEach(img => imageObserver.observe(img));
    
    // 首次执行预加载
    preloadExternalImages();
});

// 添加CSS来处理加载状态
const style = document.createElement('style');
style.textContent = `
    .lozad {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    .lozad.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);