// 性能监控面板
class PerformanceMonitor {
    constructor() {
        this.isVisible = false;
        this.createPanel();
        this.bindEvents();
    }
    
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-monitor';
        panel.innerHTML = `
            <div class="monitor-header">
                <h3>图标加载性能监控</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="monitor-content">
                <div class="stats-section">
                    <h4>API性能统计</h4>
                    <div id="api-stats"></div>
                </div>
                <div class="cache-section">
                    <h4>缓存统计</h4>
                    <div id="cache-stats"></div>
                </div>
                <div class="actions-section">
                    <button id="clear-cache">清理缓存</button>
                    <button id="refresh-stats">刷新统计</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            #performance-monitor {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: none;
            }
            
            .monitor-header {
                padding: 12px 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 8px 8px 0 0;
            }
            
            .monitor-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .monitor-content {
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .stats-section, .cache-section {
                margin-bottom: 16px;
            }
            
            .stats-section h4, .cache-section h4 {
                margin: 0 0 8px 0;
                font-size: 12px;
                font-weight: 600;
                color: #666;
                text-transform: uppercase;
            }
            
            .api-item {
                background: #f8f9fa;
                padding: 8px 12px;
                margin-bottom: 6px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .api-name {
                font-weight: 600;
                color: #333;
            }
            
            .api-metrics {
                color: #666;
                margin-top: 4px;
            }
            
            .actions-section {
                display: flex;
                gap: 8px;
            }
            
            .actions-section button {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                background: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }
            
            .actions-section button:hover {
                background: #f8f9fa;
            }
            
            .cache-info {
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                color: #666;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        this.panel = panel;
    }
    
    bindEvents() {
        // 关闭按钮
        this.panel.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        // 清理缓存
        this.panel.querySelector('#clear-cache').addEventListener('click', () => {
            this.clearCache();
        });
        
        // 刷新统计
        this.panel.querySelector('#refresh-stats').addEventListener('click', () => {
            this.updateStats();
        });
        
        // 键盘快捷键 Ctrl+Shift+P 打开面板
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    show() {
        this.panel.style.display = 'block';
        this.isVisible = true;
        this.updateStats();
    }
    
    hide() {
        this.panel.style.display = 'none';
        this.isVisible = false;
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    updateStats() {
        this.updateAPIStats();
        this.updateCacheStats();
    }
    
    updateAPIStats() {
        const apiStatsContainer = this.panel.querySelector('#api-stats');
        
        if (window.IconAPIManager) {
            const stats = window.IconAPIManager.getStats();
            
            if (Object.keys(stats).length === 0) {
                apiStatsContainer.innerHTML = '<div class="api-item">暂无API使用统计</div>';
                return;
            }
            
            let html = '';
            Object.entries(stats).forEach(([apiName, data]) => {
                const successRate = (data.successRate * 100).toFixed(1);
                const avgTime = data.avgResponseTime.toFixed(0);
                
                html += `
                    <div class="api-item">
                        <div class="api-name">${apiName}</div>
                        <div class="api-metrics">
                            成功率: ${successRate}% | 
                            平均响应: ${avgTime}ms | 
                            总请求: ${data.totalCount}
                        </div>
                    </div>
                `;
            });
            
            apiStatsContainer.innerHTML = html;
        } else {
            apiStatsContainer.innerHTML = '<div class="api-item">API管理器未加载</div>';
        }
    }
    
    updateCacheStats() {
        const cacheStatsContainer = this.panel.querySelector('#cache-stats');
        
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith('icon_cache_'));
            const cacheSize = cacheKeys.reduce((size, key) => {
                return size + localStorage.getItem(key).length;
            }, 0);
            
            const cacheSizeKB = (cacheSize / 1024).toFixed(1);
            
            cacheStatsContainer.innerHTML = `
                <div class="cache-info">
                    缓存图标数量: ${cacheKeys.length}<br>
                    缓存大小: ${cacheSizeKB} KB<br>
                    存储使用率: ${((cacheSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%
                </div>
            `;
        } catch (e) {
            cacheStatsContainer.innerHTML = '<div class="cache-info">无法获取缓存统计</div>';
        }
    }
    
    clearCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('icon_cache_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // 也清理API统计
            localStorage.removeItem('icon_api_stats');
            
            alert('缓存已清理');
            this.updateStats();
        } catch (e) {
            alert('清理缓存失败: ' + e.message);
        }
    }
}

// 初始化性能监控器
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
});

// 添加控制台命令
window.showPerformanceMonitor = () => {
    if (window.performanceMonitor) {
        window.performanceMonitor.show();
    }
};