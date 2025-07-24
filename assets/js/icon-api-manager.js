// 图标API管理系统
class IconAPIManager {
    constructor() {
        this.apis = [
            {
                name: 'favicon.im',
                url: 'https://favicon.im/',
                priority: 1,
                timeout: 3000,
                active: true
            },
            {
                name: 'iowen',
                url: 'https://api.iowen.cn/favicon/',
                priority: 2,
                timeout: 5000,
                active: true
            },
            {
                name: 'google',
                url: 'https://www.google.com/s2/favicons?domain=',
                priority: 3,
                timeout: 8000,
                active: true
            }
        ];
        
        this.performanceStats = new Map();
        this.loadStats();
    }
    
    // 获取最佳API
    getBestAPI(domain) {
        const activeAPIs = this.apis
            .filter(api => api.active)
            .sort((a, b) => {
                const aStats = this.performanceStats.get(a.name) || { successRate: 0.5, avgResponseTime: 5000 };
                const bStats = this.performanceStats.get(b.name) || { successRate: 0.5, avgResponseTime: 5000 };
                
                // 综合考虑成功率和响应时间
                const aScore = aStats.successRate * 100 - aStats.avgResponseTime / 100;
                const bScore = bStats.successRate * 100 - bStats.avgResponseTime / 100;
                
                return bScore - aScore;
            });
        
        return activeAPIs[0];
    }
    
    // 构建图标URL
    buildIconURL(api, domain) {
        switch (api.name) {
            case 'favicon.im':
                return `${api.url}${domain}`;
            case 'iowen':
                return `${api.url}${domain}`;
            case 'google':
                return `${api.url}${domain}&sz=32`;
            default:
                return `${api.url}${domain}`;
        }
    }
    
    // 记录API性能
    recordPerformance(apiName, success, responseTime) {
        const stats = this.performanceStats.get(apiName) || {
            successCount: 0,
            totalCount: 0,
            totalResponseTime: 0,
            successRate: 0,
            avgResponseTime: 0
        };
        
        stats.totalCount++;
        stats.totalResponseTime += responseTime;
        
        if (success) {
            stats.successCount++;
        }
        
        stats.successRate = stats.successCount / stats.totalCount;
        stats.avgResponseTime = stats.totalResponseTime / stats.totalCount;
        
        this.performanceStats.set(apiName, stats);
        this.saveStats();
    }
    
    // 保存统计数据
    saveStats() {
        try {
            const statsObj = Object.fromEntries(this.performanceStats);
            localStorage.setItem('icon_api_stats', JSON.stringify(statsObj));
        } catch (e) {
            console.warn('Failed to save API stats:', e);
        }
    }
    
    // 加载统计数据
    loadStats() {
        try {
            const saved = localStorage.getItem('icon_api_stats');
            if (saved) {
                const statsObj = JSON.parse(saved);
                this.performanceStats = new Map(Object.entries(statsObj));
            }
        } catch (e) {
            console.warn('Failed to load API stats:', e);
        }
    }
    
    // 获取API统计信息
    getStats() {
        return Object.fromEntries(this.performanceStats);
    }
}

// 导出单例
window.IconAPIManager = new IconAPIManager();