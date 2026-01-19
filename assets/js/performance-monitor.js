/**
 * 性能监控器
 * Performance Monitor
 * 
 * 监控一键上滑按钮和其他动效的性能表现
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            scrollEvents: 0,
            animationFrames: 0,
            lastScrollTime: 0,
            averageScrollDelay: 0,
            memoryUsage: 0,
            fps: 0
        };
        
        this.isMonitoring = false;
        this.fpsCounter = 0;
        this.lastFpsTime = performance.now();
        
        this.init();
    }
    
    init() {
        if (window.location.search.includes('debug=performance')) {
            this.startMonitoring();
        }
        
        this.setupPerformanceOptimizations();
    }
    
    // 开始性能监控
    startMonitoring() {
        this.isMonitoring = true;
        
        // 监控滚动性能
        this.monitorScrollPerformance();
        
        // 监控FPS
        this.monitorFPS();
        
        // 监控内存使用
        this.monitorMemoryUsage();
        
        // 定期输出报告
        setInterval(() => {
            this.generateReport();
        }, 5000);
        
        console.log('🚀 Performance Monitor started');
    }
    
    // 监控滚动性能
    monitorScrollPerformance() {
        let scrollStartTime = 0;
        
        window.addEventListener('scroll', () => {
            const now = performance.now();
            
            if (scrollStartTime === 0) {
                scrollStartTime = now;
            }
            
            this.metrics.scrollEvents++;
            this.metrics.lastScrollTime = now;
            
            // 计算平均滚动延迟
            const delay = now - scrollStartTime;
            this.metrics.averageScrollDelay = 
                (this.metrics.averageScrollDelay + delay) / 2;
            
            scrollStartTime = now;
        }, { passive: true });
    }
    
    // 监控FPS
    monitorFPS() {
        const measureFPS = (timestamp) => {
            this.fpsCounter++;
            
            if (timestamp - this.lastFpsTime >= 1000) {
                this.metrics.fps = Math.round(
                    (this.fpsCounter * 1000) / (timestamp - this.lastFpsTime)
                );
                this.fpsCounter = 0;
                this.lastFpsTime = timestamp;
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    // 监控内存使用
    monitorMemoryUsage() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }, 2000);
        }
    }
    
    // 生成性能报告
    generateReport() {
        const report = {
            timestamp: new Date().toLocaleTimeString(),
            fps: this.metrics.fps,
            scrollEvents: this.metrics.scrollEvents,
            averageScrollDelay: Math.round(this.metrics.averageScrollDelay * 100) / 100,
            memoryUsage: this.metrics.memoryUsage,
            backToTopStatus: window.EnhancedBackToTop ? 
                window.EnhancedBackToTop.getStatus() : 'Not initialized'
        };
        
        console.group('📊 Performance Report');
        console.table(report);
        console.groupEnd();
        
        // 性能警告
        if (this.metrics.fps < 30) {
            console.warn('⚠️ Low FPS detected:', this.metrics.fps);
        }
        
        if (this.metrics.averageScrollDelay > 16.67) {
            console.warn('⚠️ High scroll delay detected:', this.metrics.averageScrollDelay + 'ms');
        }
    }
    
    // 设置性能优化
    setupPerformanceOptimizations() {
        // 优化滚动事件
        this.optimizeScrollEvents();
        
        // 优化动画
        this.optimizeAnimations();
        
        // 优化内存
        this.optimizeMemory();
        
        // 预加载关键资源
        this.preloadCriticalResources();
    }
    
    // 优化滚动事件
    optimizeScrollEvents() {
        // 使用 Intersection Observer 优化可见性检测
        if ('IntersectionObserver' in window) {
            const backToTopObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target.id === 'back-to-top') {
                        // 当按钮进入视口时进行优化
                        if (entry.isIntersecting) {
                            entry.target.style.willChange = 'transform, opacity';
                        } else {
                            entry.target.style.willChange = 'auto';
                        }
                    }
                });
            }, {
                threshold: [0, 1]
            });
            
            // 延迟观察，等待按钮创建
            setTimeout(() => {
                const backToTop = document.getElementById('back-to-top');
                if (backToTop) {
                    backToTopObserver.observe(backToTop);
                }
            }, 1000);
        }
    }
    
    // 优化动画
    optimizeAnimations() {
        // 检测设备性能
        const isLowEndDevice = this.detectLowEndDevice();
        
        if (isLowEndDevice) {
            document.body.classList.add('low-performance-mode');
            
            // 添加低性能模式样式
            const lowPerfStyles = document.createElement('style');
            lowPerfStyles.textContent = `
                .low-performance-mode #back-to-top {
                    transition: opacity 0.2s ease !important;
                }
                
                .low-performance-mode #back-to-top::before,
                .low-performance-mode #back-to-top::after {
                    display: none !important;
                }
                
                .low-performance-mode .progress-ring-circle {
                    transition: none !important;
                }
                
                .low-performance-mode .ripple-effect {
                    display: none !important;
                }
            `;
            document.head.appendChild(lowPerfStyles);
        }
    }
    
    // 检测低端设备
    detectLowEndDevice() {
        // 检测硬件并发数
        const cores = navigator.hardwareConcurrency || 2;
        
        // 检测内存
        const memory = navigator.deviceMemory || 2;
        
        // 检测连接类型
        const connection = navigator.connection;
        const isSlowConnection = connection && 
            (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        
        return cores <= 2 || memory <= 2 || isSlowConnection;
    }
    
    // 优化内存
    optimizeMemory() {
        // 定期清理未使用的事件监听器
        setInterval(() => {
            this.cleanupEventListeners();
        }, 30000);
        
        // 页面隐藏时暂停动画
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    
    // 清理事件监听器
    cleanupEventListeners() {
        // 移除不活跃的监听器
        const backToTop = document.getElementById('back-to-top');
        if (backToTop && !backToTop.classList.contains('show')) {
            // 如果按钮长时间不显示，可以考虑临时移除某些监听器
        }
    }
    
    // 暂停动画
    pauseAnimations() {
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.style.animationPlayState = 'paused';
        }
    }
    
    // 恢复动画
    resumeAnimations() {
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.style.animationPlayState = 'running';
        }
    }
    
    // 预加载关键资源
    preloadCriticalResources() {
        // 预连接字体资源
        const fontPreconnect = document.createElement('link');
        fontPreconnect.rel = 'preconnect';
        fontPreconnect.href = 'https://fonts.gstatic.com';
        fontPreconnect.crossOrigin = 'anonymous';
        document.head.appendChild(fontPreconnect);
    }
    
    // 获取性能指标
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }
    
    // 停止监控
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('🛑 Performance Monitor stopped');
    }
    
    // 导出性能数据
    exportData() {
        const data = {
            metrics: this.getMetrics(),
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// 创建全局实例
let performanceMonitor = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        performanceMonitor = new PerformanceMonitor();
        
        // 暴露到全局作用域
        window.PerformanceMonitor = performanceMonitor;
        
        // 添加调试命令
        if (window.location.search.includes('debug=performance')) {
            window.exportPerformanceData = () => performanceMonitor.exportData();
            console.log('💡 Use exportPerformanceData() to export performance data');
        }
        
    } catch (error) {
        console.warn('PerformanceMonitor initialization failed:', error);
    }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}