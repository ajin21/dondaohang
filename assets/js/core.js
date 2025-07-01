/**
 * 核心应用模块
 * 负责应用初始化、性能监控、基础功能
 */

class NavigationApp {
    constructor() {
        this.config = window.APP_CONFIG;
        this.data = null;
        this.searchEngine = null;
        this.bookmarkManager = null;
        this.githubSync = null;
        this.ui = null;
        
        // 性能监控
        this.performanceMetrics = {
            loadStart: Date.now(),
            firstPaint: null,
            domReady: null,
            loadComplete: null
        };
        
        // 事件系统
        this.events = new EventTarget();
        
        // 缓存系统
        this.cache = new Map();
        
        this.init();
    }
    
    /**
     * 应用初始化
     */
    async init() {
        try {
            console.log('🚀 正在初始化懂导航...');
            
            // 性能标记
            performance.mark('app-init-start');
            
            // 1. 初始化基础组件
            await this.initComponents();
            
            // 2. 加载数据
            await this.loadData();
            
            // 3. 渲染界面
            await this.renderApp();
            
            // 4. 绑定事件
            this.bindEvents();
            
            // 5. 初始化功能模块
            await this.initModules();
            
            // 6. 完成加载
            this.finishLoading();
            
            performance.mark('app-init-end');
            performance.measure('app-init', 'app-init-start', 'app-init-end');
            
            console.log('✅ 懂导航初始化完成');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }
    
    /**
     * 初始化基础组件
     */
    async initComponents() {
        // 获取DOM元素
        this.elements = {
            app: document.getElementById('app'),
            sidebar: document.getElementById('sidebar'),
            sidebarNav: document.getElementById('sidebarNav'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            searchInput: document.getElementById('searchInput'),
            searchClear: document.getElementById('searchClear'),
            searchSuggestions: document.getElementById('searchSuggestions'),
            sitesContainer: document.getElementById('sitesContainer'),
            totalSites: document.getElementById('totalSites'),
            totalViews: document.getElementById('totalViews'),
            runningDays: document.getElementById('runningDays'),
            backToTop: document.getElementById('backToTop'),
            pageLoading: document.getElementById('pageLoading'),
            toastContainer: document.getElementById('toastContainer')
        };
        
        // 检查必要元素
        const requiredElements = ['app', 'sidebar', 'searchInput', 'sitesContainer'];
        for (const key of requiredElements) {
            if (!this.elements[key]) {
                throw new Error(`Required element not found: ${key}`);
            }
        }
    }
    
    /**
     * 加载数据
     */
    async loadData() {
        try {
            // 检查缓存
            const cachedData = this.getFromCache('siteData');
            if (cachedData) {
                this.data = cachedData;
                console.log('📦 从缓存加载数据');
                return;
            }
            
            // 从多个来源加载数据
            const dataPromises = [
                this.loadFromScript(), // 从现有的source.js加载
                this.loadFromLocalStorage(), // 从本地存储加载
                this.loadFromGitHub() // 从GitHub加载（如果配置了）
            ];
            
            const results = await Promise.allSettled(dataPromises);
            
            // 合并数据源
            this.data = this.mergeDataSources(results);
            
            // 缓存数据
            this.setCache('siteData', this.data);
            
            console.log('📊 数据加载完成:', this.data);
            
        } catch (error) {
            console.error('数据加载失败:', error);
            // 使用默认数据
            this.data = this.getDefaultData();
        }
    }
    
    /**
     * 从现有script加载数据
     */
    async loadFromScript() {
        return new Promise((resolve, reject) => {
            if (typeof navData !== 'undefined') {
                resolve(this.transformLegacyData(navData));
            } else {
                reject(new Error('navData not found'));
            }
        });
    }
    
    /**
     * 转换旧数据格式
     */
    transformLegacyData(legacyData) {
        const transformed = {
            categories: [],
            sites: [],
            lastUpdate: Date.now()
        };
        
        if (legacyData && legacyData.list) {
            legacyData.list.forEach(category => {
                if (category.nav) {
                    // 主分类
                    const categoryId = this.generateId(category.title);
                    transformed.categories.push({
                        id: categoryId,
                        title: category.title,
                        icon: category.icon || 'folder',
                        parentId: null,
                        order: transformed.categories.length
                    });
                    
                    // 添加网站
                    category.nav.forEach(site => {
                        transformed.sites.push({
                            ...site,
                            id: this.generateId(site.title + site.url),
                            categoryId: categoryId,
                            image: site.image || `${this.config.iconService}${this.extractDomain(site.url)}`
                        });
                    });
                }
                
                // 子分类
                if (category.child) {
                    const parentId = this.generateId(category.title);
                    category.child.forEach(subCategory => {
                        const subCategoryId = this.generateId(subCategory.title);
                        transformed.categories.push({
                            id: subCategoryId,
                            title: subCategory.title,
                            icon: subCategory.icon || 'folder',
                            parentId: parentId,
                            order: transformed.categories.length
                        });
                        
                        // 添加子分类网站
                        if (subCategory.nav) {
                            subCategory.nav.forEach(site => {
                                transformed.sites.push({
                                    ...site,
                                    id: this.generateId(site.title + site.url),
                                    categoryId: subCategoryId,
                                    image: site.image || `${this.config.iconService}${this.extractDomain(site.url)}`
                                });
                            });
                        }
                    });
                }
            });
        }
        
        return transformed;
    }
    
    /**
     * 从本地存储加载
     */
    async loadFromLocalStorage() {
        const stored = localStorage.getItem('navigationData');
        if (stored) {
            return JSON.parse(stored);
        }
        throw new Error('No data in localStorage');
    }
    
    /**
     * 从GitHub加载
     */
    async loadFromGitHub() {
        // 如果有GitHub配置，尝试从GitHub加载
        const githubConfig = localStorage.getItem('githubConfig');
        if (githubConfig) {
            // 这里会在github-sync.js中实现
            throw new Error('GitHub sync not implemented yet');
        }
        throw new Error('No GitHub config');
    }
    
    /**
     * 合并数据源
     */
    mergeDataSources(results) {
        let finalData = this.getDefaultData();
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                finalData = { ...finalData, ...result.value };
                break; // 使用第一个成功的数据源
            }
        }
        
        return finalData;
    }
    
    /**
     * 获取默认数据
     */
    getDefaultData() {
        return {
            categories: [
                {
                    id: 'default',
                    title: '默认分类',
                    icon: 'folder',
                    parentId: null,
                    order: 0
                }
            ],
            sites: [
                {
                    id: 'github',
                    title: 'GitHub',
                    desc: '全球最大的代码托管平台',
                    url: 'https://github.com',
                    image: `${this.config.iconService}github.com`,
                    categoryId: 'default'
                }
            ],
            lastUpdate: Date.now()
        };
    }
    
    /**
     * 渲染应用
     */
    async renderApp() {
        this.renderSidebar();
        this.renderSites();
        this.updateStats();
    }
    
    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        const categories = this.data.categories.filter(cat => !cat.parentId);
        const html = categories.map(category => {
            const subcategories = this.data.categories.filter(cat => cat.parentId === category.id);
            const siteCount = this.getSiteCountForCategory(category.id);
            
            let subcategoryHtml = '';
            if (subcategories.length > 0) {
                subcategoryHtml = `
                    <ul class="nav-subcategories">
                        ${subcategories.map(sub => {
                            const subSiteCount = this.getSiteCountForCategory(sub.id);
                            return `
                                <li class="nav-subcategory">
                                    <a href="#${sub.title}" class="nav-subcategory-link" data-category="${sub.id}">
                                        ${sub.title} (${subSiteCount})
                                    </a>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                `;
            }
            
            return `
                <div class="nav-category">
                    <div class="nav-category-title" data-category="${category.id}">
                        <span>${category.title}</span>
                        <span class="nav-category-count">${siteCount}</span>
                    </div>
                    ${subcategoryHtml}
                </div>
            `;
        }).join('');
        
        this.elements.sidebarNav.innerHTML = html;
    }
    
    /**
     * 渲染网站
     */
    renderSites() {
        const categories = this.data.categories.filter(cat => !cat.parentId);
        
        const html = categories.map(category => {
            const subcategories = this.data.categories.filter(cat => cat.parentId === category.id);
            
            if (subcategories.length > 0) {
                // 有子分类
                return subcategories.map(subCategory => {
                    const sites = this.data.sites.filter(site => site.categoryId === subCategory.id);
                    return this.renderCategorySection(subCategory, sites);
                }).join('');
            } else {
                // 直接显示网站
                const sites = this.data.sites.filter(site => site.categoryId === category.id);
                return this.renderCategorySection(category, sites);
            }
        }).join('');
        
        this.elements.sitesContainer.innerHTML = html;
    }
    
    /**
     * 渲染分类部分
     */
    renderCategorySection(category, sites) {
        if (sites.length === 0) return '';
        
        return `
            <div class="category-section" id="${category.title}">
                <div class="category-header">
                    <h2 class="category-title">${category.title}</h2>
                    <span class="category-count">${sites.length}</span>
                </div>
                <div class="sites-grid">
                    ${sites.map(site => this.renderSiteCard(site)).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染网站卡片
     */
    renderSiteCard(site) {
        const domain = this.extractDomain(site.url);
        const iconUrl = site.image || `${this.config.iconService}${domain}`;
        
        return `
            <div class="site-card" data-url="${site.url}" data-site-id="${site.id}">
                <div class="site-header">
                    <img class="site-icon" src="${iconUrl}" alt="${site.title}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="site-icon" style="display: none;">🌐</div>
                    <div class="site-info">
                        <h3 class="site-title">${site.title}</h3>
                    </div>
                </div>
                <p class="site-description">${site.desc || ''}</p>
            </div>
        `;
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        const totalSites = this.data.sites.length;
        const runningDays = Math.floor((Date.now() - new Date(this.config.startDate).getTime()) / (1000 * 60 * 60 * 24));
        
        this.elements.totalSites.textContent = totalSites;
        this.elements.runningDays.textContent = runningDays;
        
        // 访问统计（模拟）
        const views = localStorage.getItem('totalViews') || '0';
        this.elements.totalViews.textContent = views;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索功能
        this.elements.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.elements.searchClear.addEventListener('click', this.clearSearch.bind(this));
        
        // 网站点击
        this.elements.sitesContainer.addEventListener('click', this.handleSiteClick.bind(this));
        
        // 侧边栏导航
        this.elements.sidebarNav.addEventListener('click', this.handleNavClick.bind(this));
        
        // 侧边栏切换
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
        }
        
        // 返回顶部
        this.elements.backToTop.addEventListener('click', this.scrollToTop.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 功能按钮
        document.getElementById('bookmarkBtn').addEventListener('click', () => {
            this.events.dispatchEvent(new CustomEvent('openBookmarkModal'));
        });
        
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.events.dispatchEvent(new CustomEvent('openSyncModal'));
        });
        
        document.getElementById('contactBtn').addEventListener('click', () => {
            this.events.dispatchEvent(new CustomEvent('openContactModal'));
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }
    
    /**
     * 处理搜索
     */
    handleSearch(e) {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            this.clearSearch();
            return;
        }
        
        this.elements.searchClear.style.display = 'block';
        
        // 执行搜索
        if (this.searchEngine) {
            this.searchEngine.search(query);
        }
    }
    
    /**
     * 清除搜索
     */
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.searchClear.style.display = 'none';
        this.elements.searchSuggestions.style.display = 'none';
        
        // 显示所有网站
        this.showAllSites();
    }
    
    /**
     * 显示所有网站
     */
    showAllSites() {
        const siteCards = this.elements.sitesContainer.querySelectorAll('.site-card');
        const categorySections = this.elements.sitesContainer.querySelectorAll('.category-section');
        
        siteCards.forEach(card => {
            card.style.display = 'block';
        });
        
        categorySections.forEach(section => {
            section.style.display = 'block';
        });
    }
    
    /**
     * 处理网站点击
     */
    handleSiteClick(e) {
        const siteCard = e.target.closest('.site-card');
        if (!siteCard) return;
        
        const url = siteCard.dataset.url;
        const siteId = siteCard.dataset.siteId;
        
        if (url) {
            // 记录访问历史
            this.recordVisit(siteId);
            
            // 更新访问统计
            this.updateVisitStats();
            
            // 打开链接
            window.open(url, '_blank');
        }
    }
    
    /**
     * 记录访问
     */
    recordVisit(siteId) {
        const history = JSON.parse(localStorage.getItem('visitHistory') || '[]');
        const site = this.data.sites.find(s => s.id === siteId);
        
        if (site) {
            // 移除已存在的记录
            const existingIndex = history.findIndex(h => h.id === siteId);
            if (existingIndex > -1) {
                history.splice(existingIndex, 1);
            }
            
            // 添加到开头
            history.unshift({
                ...site,
                visitTime: Date.now()
            });
            
            // 保持最近50条记录
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem('visitHistory', JSON.stringify(history));
        }
    }
    
    /**
     * 更新访问统计
     */
    updateVisitStats() {
        let totalViews = parseInt(localStorage.getItem('totalViews') || '0');
        totalViews++;
        localStorage.setItem('totalViews', totalViews.toString());
        this.elements.totalViews.textContent = totalViews;
    }
    
    /**
     * 处理导航点击
     */
    handleNavClick(e) {
        const link = e.target.closest('.nav-subcategory-link');
        if (!link) return;
        
        e.preventDefault();
        
        const categoryId = link.dataset.category;
        const targetElement = document.getElementById(link.getAttribute('href').substring(1));
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 更新活动状态
        document.querySelectorAll('.nav-subcategory-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
    
    /**
     * 切换侧边栏
     */
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('open');
    }
    
    /**
     * 滚动到顶部
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * 处理滚动
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 显示/隐藏返回顶部按钮
        if (scrollTop > 300) {
            this.elements.backToTop.classList.add('visible');
        } else {
            this.elements.backToTop.classList.remove('visible');
        }
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyboard(e) {
        // ESC 关闭模态框
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
        
        // Ctrl/Cmd + K 聚焦搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.elements.searchInput.focus();
        }
        
        // / 聚焦搜索
        if (e.key === '/' && e.target !== this.elements.searchInput) {
            e.preventDefault();
            this.elements.searchInput.focus();
        }
    }
    
    /**
     * 初始化功能模块
     */
    async initModules() {
        // 这些模块会在其他文件中定义
        console.log('📦 等待功能模块加载...');
        
        // 等待其他模块加载完成的简单方法
        await this.waitForModules();
    }
    
    /**
     * 等待模块加载
     */
    async waitForModules() {
        const maxWait = 5000; // 最多等待5秒
        const checkInterval = 100; // 每100ms检查一次
        let waited = 0;
        
        while (waited < maxWait) {
            if (window.SearchEngine && window.BookmarkManager && window.GitHubSync && window.UIManager) {
                // 初始化模块
                this.searchEngine = new window.SearchEngine(this);
                this.bookmarkManager = new window.BookmarkManager(this);
                this.githubSync = new window.GitHubSync(this);
                this.ui = new window.UIManager(this);
                
                console.log('✅ 所有模块加载完成');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        console.warn('⚠️ 部分模块加载超时');
    }
    
    /**
     * 完成加载
     */
    finishLoading() {
        // 隐藏加载动画
        setTimeout(() => {
            this.elements.pageLoading.classList.add('hidden');
            setTimeout(() => {
                this.elements.pageLoading.style.display = 'none';
            }, 250);
        }, 500);
        
        // 性能监控
        this.performanceMetrics.loadComplete = Date.now();
        const loadTime = this.performanceMetrics.loadComplete - this.performanceMetrics.loadStart;
        
        console.log(`📊 加载完成，耗时: ${loadTime}ms`);
        
        // 发送加载完成事件
        this.events.dispatchEvent(new CustomEvent('appLoaded', {
            detail: { loadTime }
        }));
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.showToast(message, 'error');
    }
    
    /**
     * 显示提示信息
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        // 触发显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 250);
        }, 3000);
    }
    
    // ===== 工具方法 =====
    
    /**
     * 生成ID
     */
    generateId(str) {
        return str.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    /**
     * 提取域名
     */
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }
    
    /**
     * 获取分类的网站数量
     */
    getSiteCountForCategory(categoryId) {
        return this.data.sites.filter(site => site.categoryId === categoryId).length;
    }
    
    /**
     * 缓存操作
     */
    setCache(key, value) {
        if (this.config.enableCache) {
            this.cache.set(key, {
                value,
                timestamp: Date.now()
            });
        }
    }
    
    getFromCache(key, maxAge = 300000) { // 5分钟缓存
        if (!this.config.enableCache) return null;
        
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.value;
        }
        
        this.cache.delete(key);
        return null;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NavigationApp();
});

// 性能监控
window.addEventListener('load', () => {
    // 记录性能指标
    if (window.performance && window.performance.getEntriesByType) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('📊 性能指标:', {
            DNS: perfData.domainLookupEnd - perfData.domainLookupStart,
            TCP: perfData.connectEnd - perfData.connectStart,
            Request: perfData.responseStart - perfData.requestStart,
            Response: perfData.responseEnd - perfData.responseStart,
            DOM: perfData.domComplete - perfData.domLoading,
            Load: perfData.loadEventEnd - perfData.loadEventStart
        });
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    if (window.app) {
        window.app.showError('发生了一个错误，请刷新页面重试');
    }
});

// 未处理的Promise错误
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise错误:', e.reason);
    if (window.app) {
        window.app.showError('发生了一个错误，请刷新页面重试');
    }
});

// 导出给其他模块使用
window.NavigationApp = NavigationApp;