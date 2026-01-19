/**
 * 滚动同步功能
 * 右边内容滚动时，左边侧边栏对应分类也同步滑动
 */

document.addEventListener('DOMContentLoaded', function() {
    let isScrolling = false;
    let scrollTimeout;
    
    // 获取所有导航项和对应的内容区域
    function initScrollSync() {
        const sidebarLinks = document.querySelectorAll('.sidebar-menu .main-menu a[href^="#"]');
        const contentSections = document.querySelectorAll('.nav-item[id]');
        const sidebar = document.querySelector('.sidebar-menu .menu-content1');
        
        if (!sidebarLinks.length || !contentSections.length || !sidebar) {
            return;
        }
        
        // 创建观察器来监听内容区域的可见性 - 更平滑的触发
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -70% 0px', // 更温和的触发区域
            threshold: [0, 0.05, 0.1, 0.2, 0.3]
        };
        
        let lastActiveId = null;
        const observer = new IntersectionObserver((entries) => {
            if (isScrolling) return; // 如果正在程序化滚动，跳过
            
            let mostVisible = null;
            let maxRatio = 0;
            
            entries.forEach(entry => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    mostVisible = entry.target;
                }
            });
            
            // 只有当切换到不同的区域且有足够的可见度时才更新
            if (mostVisible && maxRatio > 0.05 && mostVisible.id !== lastActiveId) {
                lastActiveId = mostVisible.id;
                updateActiveNavigation(mostVisible.id);
            }
        }, observerOptions);
        
        // 观察所有内容区域
        contentSections.forEach(section => {
            observer.observe(section);
        });
        
        // 更新激活的导航项 - 添加渐进式过渡
        function updateActiveNavigation(activeId) {
            // 使用防抖，避免频繁切换
            clearTimeout(updateActiveNavigation.debounceTimer);
            updateActiveNavigation.debounceTimer = setTimeout(() => {
                // 清除所有激活状态
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                    link.parentElement.classList.remove('active');
                });
                
                // 设置新的激活状态
                const activeLink = document.querySelector(`.sidebar-menu .main-menu a[href="#${activeId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    activeLink.parentElement.classList.add('active');
                    
                    // 延迟滚动，让激活状态先显示
                    setTimeout(() => {
                        scrollSidebarToActive(activeLink);
                    }, 50);
                }
            }, 150); // 150ms防抖延迟
        }
        
        // 滚动侧边栏到激活项 - 更流畅的动画
        function scrollSidebarToActive(activeLink) {
            if (!sidebar || !activeLink) return;
            
            // 检查链接是否已经在可视区域内
            const sidebarRect = sidebar.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            
            // 如果链接已经在侧边栏的可视区域内，就不需要滚动
            const linkRelativeTop = linkRect.top - sidebarRect.top;
            const linkRelativeBottom = linkRect.bottom - sidebarRect.top;
            
            if (linkRelativeTop >= 50 && linkRelativeBottom <= sidebarRect.height - 50) {
                return; // 链接已经可见，不需要滚动
            }
            
            // 计算需要滚动的距离 - 更温和的居中
            const linkTop = linkRect.top - sidebarRect.top + sidebar.scrollTop;
            const sidebarCenter = sidebar.clientHeight / 3; // 改为1/3位置，不是正中心
            const targetScroll = linkTop - sidebarCenter;
            
            // 使用更平滑的滚动
            const currentScroll = sidebar.scrollTop;
            const scrollDiff = Math.abs(targetScroll - currentScroll);
            
            // 如果滚动距离很小，就不滚动
            if (scrollDiff < 20) return;
            
            // 平滑滚动到目标位置
            sidebar.scrollTo({
                top: Math.max(0, Math.min(targetScroll, sidebar.scrollHeight - sidebar.clientHeight)),
                behavior: 'smooth'
            });
        }
        
        // 处理侧边栏点击事件
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    isScrolling = true;
                    
                    // 滚动到目标区域
                    const headerOffset = 80; // 考虑固定头部的高度
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // 更新激活状态
                    updateActiveNavigation(targetId);
                    
                    // 重置滚动标志
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        isScrolling = false;
                    }, 1000);
                }
            });
        });
        
        // 监听主内容区域的滚动事件（备用方案）
        let scrollTimer;
        window.addEventListener('scroll', function() {
            if (isScrolling) return;
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                // 找到当前最可见的区域
                let currentSection = null;
                let minDistance = Infinity;
                
                contentSections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const distance = Math.abs(rect.top - 100); // 距离顶部100px的位置
                    
                    if (distance < minDistance && rect.top < window.innerHeight && rect.bottom > 0) {
                        minDistance = distance;
                        currentSection = section;
                    }
                });
                
                if (currentSection) {
                    updateActiveNavigation(currentSection.id);
                }
            }, 100);
        });
        
        console.log('滚动同步功能已初始化');
    }
    
    // 等待页面内容加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollSync);
    } else {
        // 延迟初始化，确保所有内容都已渲染
        setTimeout(initScrollSync, 500);
    }
});