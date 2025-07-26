/**
 * 移动端响应式处理器
 * Mobile Responsive Handler
 * 
 * 负责处理移动端的交互功能，包括：
 * - 汉堡菜单控制
 * - 侧边栏滑动效果
 * - 触摸手势识别
 * - 断点检测和状态管理
 */

class ResponsiveHandler {
    constructor() {
        this.state = {
            breakpoint: 'desktop',
            sidebarOpen: false,
            searchFocused: false,
            orientation: 'portrait'
        };
        
        this.elements = {
            mobileMenuToggle: null,
            mobileOverlay: null,
            sidebar: null,
            body: null
        };
        
        this.touchHandler = new TouchHandler();
        this.resizeDebounceTimer = null;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.updateBreakpoint();
        this.initializeState();
    }
    
    bindElements() {
        this.elements.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.elements.mobileOverlay = document.getElementById('mobileOverlay');
        this.elements.sidebar = document.querySelector('.sidebar-menu');
        this.elements.body = document.body;
        
        // 检查必要元素是否存在
        if (!this.elements.mobileMenuToggle || !this.elements.mobileOverlay || !this.elements.sidebar) {
            console.warn('ResponsiveHandler: 缺少必要的DOM元素');
            return;
        }
    }
    
    bindEvents() {
        // 汉堡菜单点击事件
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }
        
        // 遮罩层点击事件
        if (this.elements.mobileOverlay) {
            this.elements.mobileOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 方向变化事件
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // 侧边栏链接点击事件（移动端自动关闭）
        if (this.elements.sidebar) {
            this.elements.sidebar.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && this.state.breakpoint !== 'desktop') {
                    setTimeout(() => {
                        this.closeSidebar();
                    }, 150);
                }
            });
        }
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.sidebarOpen) {
                this.closeSidebar();
            }
        });
        
        // 触摸事件
        this.bindTouchEvents();
    }
    
    bindTouchEvents() {
        // 移动端不需要侧边栏手势，直接返回
        if (window.innerWidth <= 768) {
            return;
        }
        
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        const threshold = 50;
        const timeThreshold = 300; // 最大手势时间
        
        document.addEventListener('touchstart', (e) => {
            // 移动端不处理侧边栏手势
            if (this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet') {
                return;
            }
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;
            
            // 移动端不处理侧边栏手势
            if (this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet') {
                return;
            }
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // 只在桌面端处理手势
            if (this.state.breakpoint === 'desktop') return;
            
            // 手势时间太长，忽略
            if (deltaTime > timeThreshold) return;
            
            // 垂直滑动距离太大，忽略水平手势
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) return;
            
            // 右滑打开侧边栏（从左边缘开始）
            if (deltaX > threshold && startX < 30 && !this.state.sidebarOpen) {
                e.preventDefault();
                this.openSidebar();
            }
            
            // 左滑关闭侧边栏（从侧边栏区域开始）
            if (deltaX < -threshold && this.state.sidebarOpen) {
                e.preventDefault();
                this.closeSidebar();
            }
        }, { passive: false });
    }
    
    handleResize() {
        // 防抖处理
        clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = setTimeout(() => {
            const oldBreakpoint = this.state.breakpoint;
            this.updateBreakpoint();
            
            // 如果从移动端切换到桌面端，关闭侧边栏
            if (oldBreakpoint !== 'desktop' && this.state.breakpoint === 'desktop') {
                this.closeSidebar();
            }
        }, 150);
    }
    
    handleOrientationChange() {
        this.updateOrientation();
        this.updateBreakpoint();
        
        // 方向变化时关闭侧边栏
        if (this.state.sidebarOpen) {
            this.closeSidebar();
        }
    }
    
    updateBreakpoint() {
        const width = window.innerWidth;
        const oldBreakpoint = this.state.breakpoint;
        
        if (width <= 480) {
            this.state.breakpoint = 'mobile';
        } else if (width <= 768) {
            this.state.breakpoint = 'tablet';
        } else if (width <= 1024) {
            this.state.breakpoint = 'medium';
        } else {
            this.state.breakpoint = 'desktop';
        }
        
        // 更新body类名
        if (oldBreakpoint !== this.state.breakpoint) {
            this.elements.body.classList.remove(`breakpoint-${oldBreakpoint}`);
            this.elements.body.classList.add(`breakpoint-${this.state.breakpoint}`);
            
            // 移动端特殊处理 - 强制关闭侧边栏
            if (this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet') {
                this.state.sidebarOpen = false;
                this.elements.body?.classList.remove('sidebar-open');
            }
            
            this.handleBreakpointChange(oldBreakpoint, this.state.breakpoint);
            
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('breakpointChange', {
                detail: {
                    oldBreakpoint,
                    newBreakpoint: this.state.breakpoint
                }
            }));
        }
    }
    
    handleBreakpointChange(oldBreakpoint, newBreakpoint) {
        // 从桌面端切换到移动端时的处理
        if (oldBreakpoint === 'desktop' && newBreakpoint !== 'desktop') {
            this.optimizeForMobile();
        }
        
        // 从移动端切换到桌面端时的处理
        if (oldBreakpoint !== 'desktop' && newBreakpoint === 'desktop') {
            this.optimizeForDesktop();
        }
        
        // 调整网格布局
        this.adjustGridLayout();
    }
    
    optimizeForMobile() {
        // 移动端优化
        const images = document.querySelectorAll('.xe-comment-entry img');
        images.forEach(img => {
            // 延迟加载优化
            if (!img.classList.contains('lozad')) {
                img.loading = 'lazy';
            }
        });
        
        // 减少动画复杂度
        document.body.classList.add('mobile-optimized');
        
        // 优化触摸滚动
        const scrollElements = document.querySelectorAll('.main-content, .sidebar-menu .menu-content1');
        scrollElements.forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    optimizeForDesktop() {
        // 桌面端优化
        document.body.classList.remove('mobile-optimized');
        
        // 恢复完整动画
        const scrollElements = document.querySelectorAll('.main-content, .sidebar-menu .menu-content1');
        scrollElements.forEach(el => {
            el.style.webkitOverflowScrolling = '';
        });
    }
    
    adjustGridLayout() {
        // 动态调整网格布局
        const cols = document.querySelectorAll('.col-sm-3, .col-lg-2');
        const breakpoint = this.state.breakpoint;
        
        cols.forEach(col => {
            // 移除所有响应式类
            col.classList.remove('mobile-col', 'tablet-col', 'medium-col', 'desktop-col');
            
            // 添加对应的响应式类
            col.classList.add(`${breakpoint}-col`);
        });
    }
    
    updateOrientation() {
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        if (this.state.orientation !== orientation) {
            this.state.orientation = orientation;
            this.elements.body.classList.remove('orientation-portrait', 'orientation-landscape');
            this.elements.body.classList.add(`orientation-${orientation}`);
        }
    }
    
    initializeState() {
        this.updateOrientation();
        this.elements.body.classList.add(`breakpoint-${this.state.breakpoint}`);
        this.elements.body.classList.add(`orientation-${this.state.orientation}`);
    }
    
    toggleSidebar() {
        // 移动端不允许操作侧边栏
        if (this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet') {
            return;
        }
        
        if (this.state.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        // 移动端不允许打开侧边栏
        if (this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet') {
            return;
        }
        
        if (this.state.sidebarOpen) return;
        
        this.state.sidebarOpen = true;
        
        // 更新UI状态
        this.elements.mobileMenuToggle?.classList.add('active');
        this.elements.sidebar?.classList.add('mobile-open');
        this.elements.mobileOverlay?.classList.add('active');
        this.elements.body?.classList.add('sidebar-open');
        
        // 防止背景滚动
        this.elements.body.style.overflow = 'hidden';
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('sidebarOpen'));
        
        // 无障碍支持
        this.elements.mobileMenuToggle?.setAttribute('aria-expanded', 'true');
        this.elements.sidebar?.setAttribute('aria-hidden', 'false');
    }
    
    closeSidebar() {
        if (!this.state.sidebarOpen) return;
        
        this.state.sidebarOpen = false;
        
        // 更新UI状态
        this.elements.mobileMenuToggle?.classList.remove('active');
        this.elements.sidebar?.classList.remove('mobile-open');
        this.elements.mobileOverlay?.classList.remove('active');
        this.elements.body?.classList.remove('sidebar-open');
        
        // 恢复背景滚动
        this.elements.body.style.overflow = '';
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('sidebarClose'));
        
        // 无障碍支持
        this.elements.mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        this.elements.sidebar?.setAttribute('aria-hidden', 'true');
    }
    
    // 公共API
    getCurrentBreakpoint() {
        return this.state.breakpoint;
    }
    
    isMobile() {
        return this.state.breakpoint === 'mobile' || this.state.breakpoint === 'tablet';
    }
    
    isDesktop() {
        return this.state.breakpoint === 'desktop';
    }
    
    isSidebarOpen() {
        return this.state.sidebarOpen;
    }
}

/**
 * 触摸处理器类
 * 处理更复杂的触摸手势
 */
class TouchHandler {
    constructor() {
        this.isTouch = 'ontouchstart' in window;
        this.touchStartTime = 0;
        this.touchEndTime = 0;
    }
    
    // 检测是否为快速点击
    isTap(startTime, endTime, startPos, endPos) {
        const timeDiff = endTime - startTime;
        const distance = Math.sqrt(
            Math.pow(endPos.x - startPos.x, 2) + 
            Math.pow(endPos.y - startPos.y, 2)
        );
        
        return timeDiff < 200 && distance < 10;
    }
    
    // 检测滑动方向
    getSwipeDirection(startPos, endPos) {
        const deltaX = endPos.x - startPos.x;
        const deltaY = endPos.y - startPos.y;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }
}

/**
 * 错误处理器
 */
class ResponsiveErrorHandler {
    static handleError(error, context = '') {
        console.warn(`ResponsiveHandler Error ${context}:`, error);
        
        // 在开发环境下显示更详细的错误信息
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Detailed error:', error);
        }
        
        // 可以在这里添加错误上报逻辑
        // ErrorReporter.report(error, context);
    }
    
    static handleResizeError(error) {
        this.handleError(error, 'Resize');
        // 降级到基础布局
        document.body.classList.add('fallback-layout');
    }
    
    static handleTouchError(error) {
        this.handleError(error, 'Touch');
        // 禁用手势功能
        document.body.classList.add('no-gestures');
    }
}

// 全局实例
let responsiveHandler = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        responsiveHandler = new ResponsiveHandler();
        
        // 将实例暴露到全局作用域，方便调试和其他脚本使用
        window.ResponsiveHandler = responsiveHandler;
        
        // 添加调试信息
        if (window.location.search.includes('debug=responsive')) {
            const debugElement = document.createElement('div');
            debugElement.className = 'debug-breakpoint';
            debugElement.style.display = 'block';
            document.body.appendChild(debugElement);
        }
        
    } catch (error) {
        ResponsiveErrorHandler.handleError(error, 'Initialization');
    }
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponsiveHandler, TouchHandler, ResponsiveErrorHandler };
}