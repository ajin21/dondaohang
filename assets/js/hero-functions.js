/**
 * 高级标题区域功能
 * Hero Section Functions
 */

// 通告栏功能
function initAnnouncementBar() {
    const announcementBar = document.getElementById('announcementBar');
    const closeBtn = document.getElementById('closeAnnouncement');
    const messageElement = document.getElementById('announcementMessage');
    
    if (!announcementBar || !closeBtn || !messageElement) return;
    
    // 通告消息配置
    const announcements = [
        {
            message: "欢迎使用懂导航！发现更多优质网站和工具，提升您的工作效率 🚀",
            duration: 10000
        },
        {
            message: "新增了多个实用工具网站，快来探索吧！✨",
            duration: 8000
        },
        {
            message: "感谢大家的支持，我们会持续更新优质资源 ❤️",
            duration: 9000
        },
        {
            message: "有好的网站推荐？点击右下角"网站提交"告诉我们 📝",
            duration: 12000
        }
    ];
    
    let currentIndex = 0;
    let announcementTimer = null;
    let progressTimer = null;
    
    // 检查是否已关闭通告栏
    const isAnnouncementClosed = localStorage.getItem('announcementClosed') === 'true';
    if (isAnnouncementClosed) {
        announcementBar.style.display = 'none';
        return;
    }
    
    // 显示通告消息
    function showAnnouncement(index) {
        const announcement = announcements[index];
        messageElement.textContent = announcement.message;
        
        // 重置进度条动画
        const progressBar = announcementBar.querySelector('.announcement-progress');
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; // 触发重排
        progressBar.style.animation = `progressBar ${announcement.duration}ms linear`;
        
        // 设置下一个通告的定时器
        clearTimeout(announcementTimer);
        announcementTimer = setTimeout(() => {
            currentIndex = (currentIndex + 1) % announcements.length;
            showAnnouncement(currentIndex);
        }, announcement.duration);
    }
    
    // 关闭通告栏
    function closeAnnouncement() {
        announcementBar.style.animation = 'slideOutUp 0.5s ease-out forwards';
        setTimeout(() => {
            announcementBar.style.display = 'none';
        }, 500);
        
        // 记住用户关闭状态
        localStorage.setItem('announcementClosed', 'true');
        
        // 清除定时器
        clearTimeout(announcementTimer);
        clearTimeout(progressTimer);
    }
    
    // 绑定关闭按钮事件
    closeBtn.addEventListener('click', closeAnnouncement);
    
    // 点击通告栏其他区域暂停/恢复
    announcementBar.addEventListener('click', (e) => {
        if (e.target === closeBtn || e.target.closest('.announcement-close')) return;
        
        const progressBar = announcementBar.querySelector('.announcement-progress');
        if (progressBar.style.animationPlayState === 'paused') {
            progressBar.style.animationPlayState = 'running';
        } else {
            progressBar.style.animationPlayState = 'paused';
        }
    });
    
    // 鼠标悬停暂停动画
    announcementBar.addEventListener('mouseenter', () => {
        const progressBar = announcementBar.querySelector('.announcement-progress');
        progressBar.style.animationPlayState = 'paused';
    });
    
    announcementBar.addEventListener('mouseleave', () => {
        const progressBar = announcementBar.querySelector('.announcement-progress');
        progressBar.style.animationPlayState = 'running';
    });
    
    // 开始显示通告
    showAnnouncement(currentIndex);
    
    // 添加滑出动画样式
    if (!document.querySelector('#slideOutUpStyle')) {
        const style = document.createElement('style');
        style.id = 'slideOutUpStyle';
        style.textContent = `
            @keyframes slideOutUp {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-30px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 更新分类数量
function updateCategoriesCount() {
    try {
        if (typeof navData !== 'undefined' && navData.list) {
            let categoriesCount = 0;
            
            navData.list.forEach(category => {
                if (category.title !== "最近使用") {
                    categoriesCount++;
                    if (category.child && category.child.length > 0) {
                        categoriesCount += category.child.length;
                    }
                }
            });
            
            const categoriesElements = document.querySelectorAll('#categories-count');
            categoriesElements.forEach(element => {
                element.textContent = categoriesCount;
            });
        }
    } catch (error) {
        console.warn('Error updating categories count:', error);
    }
}

// 更新最近使用网站数量
function updateRecentSitesCount() {
    try {
        const history = localStorage.getItem('zk_history');
        const count = history ? JSON.parse(history).length : 0;
        
        const recentElements = document.querySelectorAll('#recent-sites-count');
        recentElements.forEach(element => {
            element.textContent = count;
        });
    } catch (error) {
        console.warn('Error updating recent sites count:', error);
    }
}

// 数字动画效果
function animateNumber(element, targetNumber, duration = 1000) {
    const startNumber = 0;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);
        
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetNumber;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 增强的统计数据更新
function updateStatsWithAnimation() {
    // 更新网站总数
    const totalElements = document.querySelectorAll('.nav-total');
    if (typeof navTotal !== 'undefined' && totalElements.length > 0) {
        totalElements.forEach(element => {
            animateNumber(element, navTotal, 1500);
        });
    }
    
    // 更新最近使用数量
    const recentElements = document.querySelectorAll('#recent-sites-count');
    if (recentElements.length > 0) {
        try {
            const history = localStorage.getItem('zk_history');
            const count = history ? JSON.parse(history).length : 0;
            recentElements.forEach(element => {
                animateNumber(element, count, 1000);
            });
        } catch (error) {
            console.warn('Error updating recent sites count:', error);
        }
    }
    
    // 更新分类数量
    const categoriesElements = document.querySelectorAll('#categories-count');
    if (categoriesElements.length > 0 && typeof navData !== 'undefined') {
        let categoriesCount = 0;
        navData.list.forEach(category => {
            if (category.title !== "最近使用") {
                categoriesCount++;
                if (category.child && category.child.length > 0) {
                    categoriesCount += category.child.length;
                }
            }
        });
        
        categoriesElements.forEach(element => {
            animateNumber(element, categoriesCount, 1200);
        });
    }
}

// 页面可见性变化时的处理
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // 页面变为可见时，重新开始通告栏动画
        const announcementBar = document.getElementById('announcementBar');
        if (announcementBar && announcementBar.style.display !== 'none') {
            const progressBar = announcementBar.querySelector('.announcement-progress');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
        }
    }
}

// 初始化所有功能
function initHeroSection() {
    // 初始化通告栏
    initAnnouncementBar();
    
    // 更新统计数据
    updateCategoriesCount();
    updateRecentSitesCount();
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 延迟执行动画统计更新
    setTimeout(() => {
        updateStatsWithAnimation();
    }, 1000);
}

// 导出函数供全局使用
if (typeof window !== 'undefined') {
    window.initAnnouncementBar = initAnnouncementBar;
    window.updateCategoriesCount = updateCategoriesCount;
    window.updateRecentSitesCount = updateRecentSitesCount;
    window.updateStatsWithAnimation = updateStatsWithAnimation;
    window.initHeroSection = initHeroSection;
}