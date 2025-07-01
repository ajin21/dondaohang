// 图标加载优化脚本 - 使用icon.horse服务
(function() {
    'use strict';
    
    // 图标缓存
    const iconCache = new Map();
    
    // 默认网站图标 - 简单的地球图标
    const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiM0Yjc2ODgiLz4KPHBhdGggZD0iTTggMTJjMi0yIDQtMiA2IDBzNCAyIDYgMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik04IDIwYzItMiA0LTIgNiAwczQgMiA2IDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=';
    
    // 预加载重要图标
    const priorityDomains = [
        'github.com',
        'baidu.com',
        'tencent.com',
        'alibaba.com',
        'bilibili.com',
        'zhihu.com',
        'weibo.com',
        'taobao.com'
    ];
    
    // 预加载函数
    function preloadIcons() {
        priorityDomains.forEach(domain => {
            const img = new Image();
            img.src = `https://icon.horse/icon/${domain}`;
            img.onload = () => {
                iconCache.set(domain, img.src);
            };
            img.onerror = () => {
                // 预加载失败时使用默认图标
                iconCache.set(domain, defaultIcon);
            };
        });
    }
    
    // 从URL中提取域名
    function extractDomain(url) {
        if (!url) return '';
        const match = url.match(/https:\/\/icon\.horse\/icon\/(.+)/);
        return match ? match[1] : '';
    }
    
    // 优化图标加载函数
    function optimizeIconLoading() {
        const images = document.querySelectorAll('img.lozad');
        
        images.forEach(img => {
            const src = img.getAttribute('data-src') || img.src;
            if (!src || !src.includes('icon.horse')) return;
            
            const domain = extractDomain(src);
            if (!domain) return;
            
            // 检查缓存
            if (iconCache.has(domain)) {
                if (img.getAttribute('data-src')) {
                    img.src = iconCache.get(domain);
                    img.removeAttribute('data-src');
                } else {
                    img.src = iconCache.get(domain);
                }
                return;
            }
            
            // 设置加载超时
            const timeout = setTimeout(() => {
                if (!img.complete || img.naturalHeight === 0) {
                    img.src = defaultIcon;
                    iconCache.set(domain, defaultIcon);
                }
            }, 5000); // 增加到5秒
            
            // 图标加载成功
            const onLoad = () => {
                clearTimeout(timeout);
                iconCache.set(domain, img.src);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };
            
            // 图标加载失败
            const onError = () => {
                clearTimeout(timeout);
                img.src = defaultIcon;
                iconCache.set(domain, defaultIcon);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };
            
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
        });
    }
    
    // DOM变化监听
    function observeChanges() {
        const observer = new MutationObserver(() => {
            optimizeIconLoading();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // 初始化
    function init() {
        // 预加载重要图标
        preloadIcons();
        
        // 优化现有图标
        optimizeIconLoading();
        
        // 监听动态变化
        observeChanges();
        
        console.log('Icon optimization initialized with icon.horse service');
    }
    
    // DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();