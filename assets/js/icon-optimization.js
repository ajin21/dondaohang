// 图标加载优化脚本
(function() {
    'use strict';
    
    // 图标缓存
    const iconCache = new Map();
    
    // 默认图标 - 一个简单的SVG
    const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzZmNzJlNSIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPg==';
    
    // 预加载重要图标
    const priorityDomains = [
        'github.com',
        'google.com', 
        'baidu.com',
        'tencent.com',
        'alibaba.com'
    ];
    
    // 预加载函数
    function preloadIcons() {
        priorityDomains.forEach(domain => {
            const img = new Image();
            img.src = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
            img.onload = () => {
                iconCache.set(domain, img.src);
            };
        });
    }
    
    // 优化的图标加载函数
    function loadIconWithFallback(imgElement, domain) {
        // 检查缓存
        if (iconCache.has(domain)) {
            imgElement.src = iconCache.get(domain);
            return;
        }
        
        // 设置超时
        const timeout = setTimeout(() => {
            imgElement.src = defaultIcon;
            imgElement.style.display = 'block';
            imgElement.nextElementSibling.style.display = 'none';
        }, 3000); // 3秒超时
        
        const img = new Image();
        img.onload = function() {
            clearTimeout(timeout);
            iconCache.set(domain, this.src);
            imgElement.src = this.src;
            imgElement.style.display = 'block';
            imgElement.nextElementSibling.style.display = 'none';
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            imgElement.src = defaultIcon;
            imgElement.style.display = 'block';
            imgElement.nextElementSibling.style.display = 'none';
        };
        
        img.src = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    }
    
    // 监听DOM变化，为新添加的图标元素添加优化
    function observeNewIcons() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // 元素节点
                        const images = node.querySelectorAll ? node.querySelectorAll('img[data-src*="favicons"]') : [];
                        images.forEach(optimizeIcon);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 优化单个图标
    function optimizeIcon(img) {
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc && dataSrc.includes('favicons')) {
            const domain = dataSrc.match(/domain=([^&]+)/);
            if (domain && domain[1]) {
                img.removeAttribute('data-src');
                loadIconWithFallback(img, domain[1]);
            }
        }
    }
    
    // 初始化
    function init() {
        // 预加载重要图标
        preloadIcons();
        
        // 优化现有图标
        const existingImages = document.querySelectorAll('img[data-src*="favicons"]');
        existingImages.forEach(optimizeIcon);
        
        // 监听新图标
        observeNewIcons();
        
        // 添加CSS样式
        const style = document.createElement('style');
        style.textContent = `
            .xe-user-img img {
                transition: opacity 0.2s ease;
                border-radius: 4px;
                background: #f5f5f5;
            }
            
            .xe-user-img img[src="${defaultIcon}"] {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        
        console.log('图标加载优化已启用');
    }
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();