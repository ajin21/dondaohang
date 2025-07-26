/**
 * 增强版一键上滑按钮
 * Enhanced Back to Top Button
 * 
 * 提供现代化的动效和用户体验
 */

class EnhancedBackToTop {
    constructor() {
        this.button = null;
        this.progressRing = null;
        this.isScrolling = false;
        this.scrollThreshold = 300;
        this.documentHeight = 0;
        this.windowHeight = 0;
        
        this.init();
    }
    
    init() {
        this.createButton();
        this.bindEvents();
        this.updateDocumentHeight();
    }
    
    // 创建增强版按钮
    createButton() {
        const existingButton = document.getElementById('back-to-top');
        if (existingButton) {
            // 增强现有按钮
            this.button = existingButton;
            this.enhanceExistingButton();
        } else {
            // 创建新按钮
            this.createNewButton();
        }
    }
    
    // 增强现有按钮
    enhanceExistingButton() {
        // 根据屏幕尺寸确定进度环大小
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        let ringSize, radius, center;
        if (isSmallMobile) {
            ringSize = 40;
            radius = 18;
            center = 20;
        } else if (isMobile) {
            ringSize = 48;
            radius = 22;
            center = 24;
        } else {
            ringSize = 60;
            radius = 28;
            center = 30;
        }
        
        // 添加进度环
        const progressRing = document.createElement('div');
        progressRing.className = 'back-to-top-progress';
        progressRing.innerHTML = `
            <svg class="progress-ring" width="${ringSize}" height="${ringSize}">
                <circle class="progress-ring-circle" 
                        stroke="rgba(59, 130, 246, 0.3)" 
                        stroke-width="2" 
                        fill="transparent" 
                        r="${radius}" 
                        cx="${center}" 
                        cy="${center}"/>
            </svg>
        `;
        
        this.button.appendChild(progressRing);
        this.progressRing = progressRing.querySelector('.progress-ring-circle');
        
        // 设置进度环属性
        const circumference = radius * 2 * Math.PI;
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = circumference;
        
        // 添加数据属性
        this.button.setAttribute('data-enhanced', 'true');
    }
    
    // 创建新按钮
    createNewButton() {
        // 根据屏幕尺寸确定进度环大小
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        let ringSize, radius, center;
        if (isSmallMobile) {
            ringSize = 40;
            radius = 18;
            center = 20;
        } else if (isMobile) {
            ringSize = 48;
            radius = 22;
            center = 24;
        } else {
            ringSize = 60;
            radius = 28;
            center = 30;
        }
        
        const buttonHTML = `
            <a href="javascript:void(0);" id="back-to-top" class="enhanced" aria-label="返回顶部" data-enhanced="true">
                <div class="back-to-top-progress">
                    <svg class="progress-ring" width="${ringSize}" height="${ringSize}">
                        <circle class="progress-ring-circle" 
                                stroke="rgba(59, 130, 246, 0.3)" 
                                stroke-width="2" 
                                fill="transparent" 
                                r="${radius}" 
                                cx="${center}" 
                                cy="${center}"/>
                    </svg>
                </div>
                <img src="assets/images/arrow-up.svg" alt="返回顶部" loading="lazy">
                <div class="ripple-effect"></div>
            </a>
        `;
        
        document.body.insertAdjacentHTML('beforeend', buttonHTML);
        this.button = document.getElementById('back-to-top');
        this.progressRing = this.button.querySelector('.progress-ring-circle');
        
        // 设置进度环
        const circumference = radius * 2 * Math.PI;
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = circumference;
    }
    
    // 绑定事件
    bindEvents() {
        // 滚动事件 - 使用节流
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // 点击事件
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
        
        // 触摸事件优化
        this.button.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.button.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // 鼠标事件
        this.button.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.button.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.updateDocumentHeight();
        });
    }
    
    // 处理滚动 - 超流畅版本
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = scrollTop / (this.documentHeight - this.windowHeight);
        
        // 使用更低的阈值，让按钮更早出现
        const threshold = Math.min(this.scrollThreshold, 200);
        
        // 更新按钮显示状态
        if (scrollTop > threshold) {
            this.showButton();
        } else {
            this.hideButton();
        }
        
        // 更新进度环 - 使用平滑插值
        const smoothPercent = Math.min(scrollPercent, 1);
        this.updateProgress(smoothPercent);
        
        // 根据滚动速度调整按钮透明度
        this.adjustButtonOpacity(scrollTop);
    }
    
    // 根据滚动位置调整按钮透明度
    adjustButtonOpacity(scrollTop) {
        if (this.button && this.button.classList.contains('show')) {
            // 根据滚动位置动态调整透明度，让按钮更有层次感
            const maxScroll = 1000;
            const opacity = Math.min(0.7 + (scrollTop / maxScroll) * 0.3, 1);
            this.button.style.opacity = opacity;
        }
    }
    
    // 显示按钮
    showButton() {
        if (!this.button.classList.contains('show')) {
            this.button.classList.add('show');
            
            // 添加入场动画
            this.button.style.animation = 'backToTopSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        }
    }
    
    // 隐藏按钮
    hideButton() {
        if (this.button.classList.contains('show')) {
            this.button.classList.remove('show');
            
            // 添加退场动画
            this.button.style.animation = 'backToTopSlideOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
        }
    }
    
    // 更新进度
    updateProgress(percent) {
        if (this.progressRing) {
            const radius = this.progressRing.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percent * circumference);
            
            this.progressRing.style.strokeDashoffset = offset;
            this.progressRing.style.stroke = `rgba(59, 130, 246, ${0.3 + percent * 0.7})`;
        }
    }
    
    // 滚动到顶部 - 超流畅版本
    scrollToTop() {
        // 添加点击反馈
        this.button.classList.add('clicking');
        this.createRippleEffect();
        
        // 获取当前滚动位置
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        
        // 动态计算持续时间，距离越远时间越长，但有上限
        const baseDuration = 600;
        const maxDuration = 1200;
        const duration = Math.min(baseDuration + (startPosition / 5), maxDuration);
        
        // 使用更流畅的缓动函数
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
        
        // 高性能滚动动画
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 应用缓动函数
            const easeProgress = easeOutQuart(progress);
            
            // 计算当前位置
            const currentPosition = startPosition * (1 - easeProgress);
            
            // 使用 scrollTo 而不是 scrollTop 以获得更好的性能
            window.scrollTo({
                top: currentPosition,
                behavior: 'auto' // 禁用浏览器默认的平滑滚动，使用我们的自定义动画
            });
            
            // 更新进度环
            this.updateProgress(easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                // 滚动完成
                this.button.classList.remove('clicking');
                this.onScrollComplete();
                
                // 确保完全到达顶部
                window.scrollTo({ top: 0, behavior: 'auto' });
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    // 创建涟漪效果
    createRippleEffect() {
        const ripple = this.button.querySelector('.ripple-effect');
        if (ripple) {
            ripple.classList.remove('active');
            // 强制重排
            ripple.offsetHeight;
            ripple.classList.add('active');
            
            setTimeout(() => {
                ripple.classList.remove('active');
            }, 600);
        }
    }
    
    // 触摸开始
    handleTouchStart(e) {
        this.button.classList.add('touch-active');
    }
    
    // 触摸结束
    handleTouchEnd(e) {
        setTimeout(() => {
            this.button.classList.remove('touch-active');
        }, 150);
    }
    
    // 鼠标进入
    handleMouseEnter() {
        this.button.classList.add('hover-active');
    }
    
    // 鼠标离开
    handleMouseLeave() {
        this.button.classList.remove('hover-active');
    }
    
    // 滚动完成回调
    onScrollComplete() {
        // 可以在这里添加完成后的效果
        this.button.style.animation = 'backToTopBounce 0.6s ease-out';
        
        setTimeout(() => {
            this.button.style.animation = '';
        }, 600);
    }
    
    // 更新文档高度
    updateDocumentHeight() {
        this.documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        this.windowHeight = window.innerHeight;
    }
    
    // 销毁实例
    destroy() {
        if (this.button) {
            this.button.remove();
        }
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.updateDocumentHeight);
    }
    
    // 获取状态
    getStatus() {
        return {
            isVisible: this.button.classList.contains('show'),
            scrollPercent: window.pageYOffset / (this.documentHeight - this.windowHeight),
            documentHeight: this.documentHeight,
            windowHeight: this.windowHeight
        };
    }
}

// 增强版按钮的CSS动画
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* 进度环样式 */
    .back-to-top-progress {
        position: absolute;
        top: -2px;
        left: -2px;
        width: 60px;
        height: 60px;
        pointer-events: none;
        z-index: -1;
    }
    
    .progress-ring {
        transform: rotate(-90deg);
        transition: all 0.3s ease;
    }
    
    .progress-ring-circle {
        transition: stroke-dashoffset 0.1s ease, stroke 0.3s ease;
    }
    
    /* 涟漪效果 */
    .ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.3);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -1;
    }
    
    .ripple-effect.active {
        animation: rippleExpand 0.6s ease-out;
    }
    
    /* 动画关键帧 */
    @keyframes backToTopSlideIn {
        0% {
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.8) rotate(180deg);
        }
        100% {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1) rotate(0deg);
        }
    }
    
    @keyframes backToTopSlideOut {
        0% {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.8) rotate(-180deg);
        }
    }
    
    @keyframes backToTopBounce {
        0%, 100% {
            transform: translateY(0) scale(1);
        }
        25% {
            transform: translateY(-8px) scale(1.1);
        }
        50% {
            transform: translateY(-4px) scale(1.05);
        }
        75% {
            transform: translateY(-2px) scale(1.02);
        }
    }
    
    @keyframes rippleExpand {
        0% {
            width: 0;
            height: 0;
            opacity: 0.8;
        }
        100% {
            width: 120px;
            height: 120px;
            opacity: 0;
        }
    }
    
    /* 增强版按钮特殊状态 */
    #back-to-top[data-enhanced="true"].hover-active .progress-ring-circle {
        stroke: rgba(59, 130, 246, 0.8);
        stroke-width: 3;
    }
    
    #back-to-top[data-enhanced="true"].touch-active {
        transform: translateY(-4px) scale(0.95);
    }
    
    #back-to-top[data-enhanced="true"].clicking {
        transform: translateY(-6px) scale(1.05);
    }
    
    /* 移动端优化 */
    @media (max-width: 768px) {
        .back-to-top-progress {
            width: 48px;
            height: 48px;
            top: -2px;
            left: -2px;
        }
        
        .progress-ring {
            width: 48px;
            height: 48px;
        }
        
        .progress-ring-circle {
            r: 22;
            cx: 24;
            cy: 24;
            stroke-width: 2;
        }
        
        @keyframes rippleExpand {
            0% {
                width: 0;
                height: 0;
                opacity: 0.6;
            }
            100% {
                width: 80px;
                height: 80px;
                opacity: 0;
            }
        }
    }
    
    /* 小屏幕设备进一步优化 */
    @media (max-width: 480px) {
        .back-to-top-progress {
            width: 40px;
            height: 40px;
            top: -2px;
            left: -2px;
        }
        
        .progress-ring {
            width: 40px;
            height: 40px;
        }
        
        .progress-ring-circle {
            r: 18;
            cx: 20;
            cy: 20;
            stroke-width: 2;
        }
    }
    
    /* 减少动画偏好支持 */
    @media (prefers-reduced-motion: reduce) {
        .progress-ring-circle {
            transition: none;
        }
        
        .ripple-effect.active {
            animation: none;
        }
        
        #back-to-top[data-enhanced="true"] {
            animation: none !important;
        }
    }
`;

document.head.appendChild(enhancedStyles);

// 全局实例
let enhancedBackToTop = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 延迟初始化，确保其他脚本加载完成
        setTimeout(() => {
            enhancedBackToTop = new EnhancedBackToTop();
            
            // 暴露到全局作用域
            window.EnhancedBackToTop = enhancedBackToTop;
            
            // 调试模式
            if (window.location.search.includes('debug=backtotop')) {
                console.log('Enhanced Back to Top Status:', enhancedBackToTop.getStatus());
                
                // 定期输出状态
                setInterval(() => {
                    console.log('Back to Top Status:', enhancedBackToTop.getStatus());
                }, 2000);
            }
        }, 100);
        
    } catch (error) {
        console.warn('EnhancedBackToTop initialization failed:', error);
    }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedBackToTop;
}