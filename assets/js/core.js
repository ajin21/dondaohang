/**
 * Elegant Navigator - 核心应用模块
 * 现代化导航站点
 */

class ElegantNavigator {
    constructor() {
        this.data = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isSearchActive = false;
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        
        // 性能监控
        this.startTime = performance.now();
        
        // 缓存系统
        this.cache = new Map();
        
        this.init();
    }
    
    /**
     * 应用初始化
     */
    async init() {
        try {
            console.log('🚀 正在初始化 Elegant Navigator...');
            
            // 1. 获取DOM元素
            this.initElements();
            
            // 2. 加载数据
            await this.loadData();
            
            // 3. 渲染界面
            this.render();
            
            // 4. 绑定事件
            this.bindEvents();
            
            // 5. 初始化主题
            this.initTheme();
            
            // 6. 更新性能指标
            this.updatePerformanceMetrics();
            
            console.log('✅ Elegant Navigator 初始化完成');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showToast('应用初始化失败，请刷新页面重试', 'error');
        }
    }
    
    /**
     * 初始化DOM元素
     */
    initElements() {
        this.elements = {
            // 导航相关
            navTabs: document.querySelector('.nav-tabs'),
            searchToggle: document.getElementById('searchToggle'),
            bookmarkBtn: document.getElementById('bookmarkBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // 搜索相关
            searchSection: document.getElementById('searchSection'),
            searchInput: document.getElementById('searchInput'),
            searchClear: document.getElementById('searchClear'),
            searchSuggestions: document.getElementById('searchSuggestions'),
            
            // 内容相关
            sitesGrid: document.getElementById('sitesGrid'),
            emptyState: document.getElementById('emptyState'),
            
            // 统计相关
            totalSites: document.getElementById('totalSites'),
            totalCategories: document.getElementById('totalCategories'),
            todayVisits: document.getElementById('todayVisits'),
            loadTime: document.getElementById('loadTime'),
            
            // 其他
            backToTop: document.getElementById('backToTop'),
            bookmarkModal: document.getElementById('bookmarkModal'),
            toastContainer: document.getElementById('toastContainer')
        };
        
        // 检查必要元素
        const required = ['navTabs', 'sitesGrid', 'searchInput'];
        for (const key of required) {
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
            const cached = this.getFromCache('navigationData');
            if (cached) {
                this.data = cached;
                return;
            }
            
            // 尝试从现有数据源加载
            if (typeof navData !== 'undefined') {
                this.data = this.transformLegacyData(navData);
            } else {
                this.data = this.getDefaultData();
            }
            
            // 缓存数据
            this.setCache('navigationData', this.data);
            
        } catch (error) {
            console.error('数据加载失败:', error);
            this.data = this.getDefaultData();
        }
    }
    
    /**
     * 转换旧数据格式
     */
    transformLegacyData(legacyData) {
        const transformed = {
            categories: new Map(),
            sites: []
        };
        
        if (legacyData && legacyData.list) {
            legacyData.list.forEach(category => {
                const categoryId = this.generateId(category.title);
                
                // 添加主分类
                transformed.categories.set(categoryId, {
                    id: categoryId,
                    title: category.title,
                    icon: this.getCategoryIcon(category.title),
                    count: 0
                });
                
                // 处理直接在分类下的网站
                if (category.nav && category.nav.length > 0) {
                    category.nav.forEach(site => {
                        const transformedSite = this.transformSite(site, categoryId);
                        transformed.sites.push(transformedSite);
                    });
                    
                    const cat = transformed.categories.get(categoryId);
                    cat.count += category.nav.length;
                }
                
                // 处理子分类
                if (category.child && category.child.length > 0) {
                    category.child.forEach(subCategory => {
                        if (subCategory.nav && subCategory.nav.length > 0) {
                            subCategory.nav.forEach(site => {
                                const transformedSite = this.transformSite(site, categoryId);
                                transformedSite.subcategory = subCategory.title;
                                transformed.sites.push(transformedSite);
                            });
                            
                            const cat = transformed.categories.get(categoryId);
                            cat.count += subCategory.nav.length;
                        }
                    });
                }
            });
        }
        
        return {
            categories: Array.from(transformed.categories.values()),
            sites: transformed.sites
        };
    }
    
    /**
     * 转换网站数据
     */
    transformSite(site, categoryId) {
        const domain = this.extractDomain(site.url);
        return {
            id: this.generateId(site.title + site.url),
            title: site.title,
            description: site.desc || `访问 ${site.title}`,
            url: site.url,
            icon: site.image || `https://icon.horse/icon/${domain}`,
            categoryId: categoryId,
            domain: domain,
            tags: this.generateTags(site.title, site.desc)
        };
    }
    
    /**
     * 生成标签
     */
    generateTags(title, desc) {
        const tags = [];
        const text = (title + ' ' + (desc || '')).toLowerCase();
        
        // 技术相关标签
        const techKeywords = ['api', 'js', 'css', 'html', 'react', 'vue', 'node', 'python', 'github', 'design', 'ui', 'ux'];
        techKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                tags.push(keyword.toUpperCase());
            }
        });
        
        return tags.slice(0, 3); // 最多3个标签
    }
    
    /**
     * 获取分类图标
     */
    getCategoryIcon(title) {
        const iconMap = {
            '常用推荐': '⭐',
            '搜索引擎': '🔍',
            '社交媒体': '💬',
            '开发工具': '🛠',
            '设计资源': '🎨',
            '学习教育': '📚',
            '生活娱乐': '🎮',
            '新闻资讯': '📰',
            '工具软件': '⚙️',
            '云服务': '☁️'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (title.includes(key)) return icon;
        }
        
        return '📁';
    }
    
    /**
     * 获取默认数据
     */
    getDefaultData() {
        return {
            categories: [
                { id: 'tools', title: '实用工具', icon: '🛠', count: 3 },
                { id: 'design', title: '设计资源', icon: '🎨', count: 2 }
            ],
            sites: [
                {
                    id: 'github',
                    title: 'GitHub',
                    description: '全球最大的代码托管平台',
                    url: 'https://github.com',
                    icon: 'https://icon.horse/icon/github.com',
                    categoryId: 'tools',
                    domain: 'github.com',
                    tags: ['CODE', 'GIT']
                },
                {
                    id: 'figma',
                    title: 'Figma',
                    description: '强大的在线设计协作工具',
                    url: 'https://figma.com',
                    icon: 'https://icon.horse/icon/figma.com',
                    categoryId: 'design',
                    domain: 'figma.com',
                    tags: ['DESIGN', 'UI']
                }
            ]
        };
    }
    
    /**
     * 渲染界面
     */
    render() {
        this.renderNavigation();
        this.renderSites();
        this.updateStats();
    }
    
    /**
     * 渲染导航
     */
    renderNavigation() {
        // 添加"全部"标签
        const allTab = document.querySelector('[data-category="all"]');
        if (allTab) {
            const allCount = allTab.querySelector('.nav-tab-count');
            if (allCount) {
                allCount.textContent = this.data.sites.length;
            }
        }
        
        // 动态添加分类标签
        const existingTabs = this.elements.navTabs.querySelectorAll('[data-category]:not([data-category="all"])');
        existingTabs.forEach(tab => tab.remove());
        
        this.data.categories.forEach(category => {
            const tab = document.createElement('button');
            tab.className = 'nav-tab';
            tab.setAttribute('data-category', category.id);
            tab.innerHTML = `
                <span class="nav-tab-icon">${category.icon}</span>
                <span class="nav-tab-text">${category.title}</span>
                <span class="nav-tab-count">${category.count}</span>
            `;
            this.elements.navTabs.appendChild(tab);
        });
    }
    
    /**
     * 渲染网站
     */
    renderSites() {
        const filteredSites = this.getFilteredSites();
        
        if (filteredSites.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        const html = filteredSites.map(site => this.renderSiteCard(site)).join('');
        this.elements.sitesGrid.innerHTML = html;
        
        // 添加动画
        this.animateCards();
    }
    
    /**
     * 渲染网站卡片
     */
    renderSiteCard(site) {
        const tags = site.tags.map(tag => `<span class="site-tag">${tag}</span>`).join('');
        
        return `
            <div class="site-card" data-url="${site.url}" data-site-id="${site.id}">
                <div class="site-header">
                    <div class="site-icon">
                        <img src="${site.icon}" alt="${site.title}" 
                             onerror="this.style.display='none'; this.parentElement.innerHTML='🌐';">
                    </div>
                    <div class="site-info">
                        <div class="site-title">${site.title}</div>
                        <div class="site-description">${site.description}</div>
                    </div>
                </div>
                ${tags ? `<div class="site-tags">${tags}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * 获取过滤后的网站
     */
    getFilteredSites() {
        let sites = this.data.sites;
        
        // 按分类过滤
        if (this.currentCategory !== 'all') {
            sites = sites.filter(site => site.categoryId === this.currentCategory);
        }
        
        // 按搜索查询过滤
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            sites = sites.filter(site => 
                site.title.toLowerCase().includes(query) ||
                site.description.toLowerCase().includes(query) ||
                site.domain.toLowerCase().includes(query) ||
                site.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        return sites;
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        this.elements.totalSites.textContent = this.data.sites.length;
        this.elements.totalCategories.textContent = this.data.categories.length;
        
        // 今日访问（从localStorage获取）
        const today = new Date().toDateString();
        const visits = JSON.parse(localStorage.getItem('dailyVisits') || '{}');
        this.elements.todayVisits.textContent = visits[today] || 0;
        
        // 加载时间
        const loadTime = Math.round(performance.now() - this.startTime);
        this.elements.loadTime.textContent = `${loadTime}ms`;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航标签切换
        this.elements.navTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.nav-tab');
            if (tab) {
                this.switchCategory(tab.dataset.category);
            }
        });
        
        // 搜索切换
        this.elements.searchToggle.addEventListener('click', () => {
            this.toggleSearch();
        });
        
        // 搜索输入
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // 清除搜索
        this.elements.searchClear.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // 网站点击
        this.elements.sitesGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.site-card');
            if (card) {
                this.handleSiteClick(card);
            }
        });
        
        // 书签管理
        this.elements.bookmarkBtn.addEventListener('click', () => {
            this.openBookmarkModal();
        });
        
        // 主题切换
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 返回顶部
        this.elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // 滚动事件
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // 模态框关闭
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-backdrop, .modal-close')) {
                this.closeModal();
            }
        });
    }
    
    /**
     * 切换分类
     */
    switchCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // 更新导航状态
        this.elements.navTabs.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryId);
        });
        
        // 重新渲染网站
        this.renderSites();
    }
    
    /**
     * 切换搜索
     */
    toggleSearch() {
        this.isSearchActive = !this.isSearchActive;
        this.elements.searchSection.classList.toggle('active', this.isSearchActive);
        
        if (this.isSearchActive) {
            setTimeout(() => {
                this.elements.searchInput.focus();
            }, 100);
        } else {
            this.clearSearch();
        }
    }
    
    /**
     * 处理搜索
     */
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.elements.searchClear.style.display = query ? 'block' : 'none';
        this.renderSites();
    }
    
    /**
     * 清除搜索
     */
    clearSearch() {
        this.searchQuery = '';
        this.elements.searchInput.value = '';
        this.elements.searchClear.style.display = 'none';
        this.renderSites();
    }
    
    /**
     * 处理网站点击
     */
    handleSiteClick(card) {
        const url = card.dataset.url;
        const siteId = card.dataset.siteId;
        
        // 记录访问
        this.recordVisit(siteId);
        
        // 打开网站
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // 添加点击效果
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    }
    
    /**
     * 记录访问
     */
    recordVisit(siteId) {
        const today = new Date().toDateString();
        const visits = JSON.parse(localStorage.getItem('dailyVisits') || '{}');
        visits[today] = (visits[today] || 0) + 1;
        localStorage.setItem('dailyVisits', JSON.stringify(visits));
        
        // 更新统计
        this.elements.todayVisits.textContent = visits[today];
    }
    
    /**
     * 初始化主题
     */
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
        const icon = this.elements.themeToggle.querySelector('.action-icon');
        if (icon) {
            icon.textContent = this.darkMode ? '☀️' : '🌙';
        }
    }
    
    /**
     * 切换主题
     */
    toggleTheme() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        this.initTheme();
        
        this.showToast(`已切换到${this.darkMode ? '深色' : '浅色'}模式`, 'success');
    }
    
    /**
     * 处理滚动
     */
    handleScroll() {
        const scrolled = window.scrollY > 300;
        this.elements.backToTop.classList.toggle('visible', scrolled);
    }
    
    /**
     * 处理键盘快捷键
     */
    handleKeyboard(e) {
        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearch();
        }
        
        // ESC 关闭搜索/模态框
        if (e.key === 'Escape') {
            if (this.isSearchActive) {
                this.toggleSearch();
            } else {
                this.closeModal();
            }
        }
    }
    
    /**
     * 显示空状态
     */
    showEmptyState() {
        this.elements.sitesGrid.style.display = 'none';
        this.elements.emptyState.style.display = 'block';
    }
    
    /**
     * 隐藏空状态
     */
    hideEmptyState() {
        this.elements.sitesGrid.style.display = 'grid';
        this.elements.emptyState.style.display = 'none';
    }
    
    /**
     * 卡片动画
     */
    animateCards() {
        const cards = this.elements.sitesGrid.querySelectorAll('.site-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    /**
     * 打开书签模态框
     */
    openBookmarkModal() {
        this.elements.bookmarkModal.classList.add('active');
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        this.elements.bookmarkModal.classList.remove('active');
    }
    
    /**
     * 显示Toast通知
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * 更新性能指标
     */
    updatePerformanceMetrics() {
        const loadTime = Math.round(performance.now() - this.startTime);
        console.log(`⚡ 应用加载完成，耗时: ${loadTime}ms`);
    }
    
    /**
     * 工具方法
     */
    generateId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) + 
               Math.random().toString(36).substring(2, 8);
    }
    
    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
    
    setCache(key, value) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    }
    
    getFromCache(key, maxAge = 5 * 60 * 1000) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.data;
        }
        return null;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ElegantNavigator();
});

// 性能监控
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`📊 页面完全加载耗时: ${Math.round(loadTime)}ms`);
});