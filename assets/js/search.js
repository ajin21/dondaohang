/**
 * 搜索引擎模块
 * 支持智能搜索、搜索建议、拼音搜索等功能
 */

class SearchEngine {
    constructor(app) {
        this.app = app;
        this.searchIndex = new Map();
        this.searchHistory = [];
        this.suggestions = [];
        this.isSearching = false;
        
        this.init();
    }
    
    init() {
        this.buildSearchIndex();
        this.loadSearchHistory();
        this.bindEvents();
    }
    
    /**
     * 构建搜索索引
     */
    buildSearchIndex() {
        if (!this.app.data) return;
        
        this.searchIndex.clear();
        
        // 为每个网站建立索引
        this.app.data.sites.forEach(site => {
            const terms = this.extractSearchTerms(site);
            terms.forEach(term => {
                if (!this.searchIndex.has(term)) {
                    this.searchIndex.set(term, []);
                }
                this.searchIndex.get(term).push(site);
            });
        });
        
        console.log('🔍 搜索索引构建完成:', this.searchIndex.size, '个关键词');
    }
    
    /**
     * 提取搜索关键词
     */
    extractSearchTerms(site) {
        const terms = new Set();
        
        // 标题关键词
        if (site.title) {
            terms.add(site.title.toLowerCase());
            // 拆分单词
            this.splitWords(site.title).forEach(word => terms.add(word));
        }
        
        // 描述关键词
        if (site.desc) {
            terms.add(site.desc.toLowerCase());
            this.splitWords(site.desc).forEach(word => terms.add(word));
        }
        
        // URL关键词
        if (site.url) {
            const domain = this.app.extractDomain(site.url);
            terms.add(domain.toLowerCase());
            // 去掉www和顶级域名
            const cleanDomain = domain.replace(/^www\./, '').replace(/\.[^.]+$/, '');
            terms.add(cleanDomain.toLowerCase());
        }
        
        // 分类关键词
        const category = this.app.data.categories.find(cat => cat.id === site.categoryId);
        if (category) {
            terms.add(category.title.toLowerCase());
        }
        
        // 拼音支持（简单实现）
        if (site.title) {
            const pinyin = this.toPinyin(site.title);
            if (pinyin !== site.title) {
                terms.add(pinyin.toLowerCase());
            }
        }
        
        return Array.from(terms).filter(term => term && term.length > 0);
    }
    
    /**
     * 分割单词
     */
    splitWords(text) {
        return text.toLowerCase()
            .split(/[\s\-_.,!?；，。！？、]+/)
            .filter(word => word && word.length > 1);
    }
    
    /**
     * 简单的中文转拼音（仅支持常用字）
     */
    toPinyin(text) {
                 const pinyinMap = {
             '导': 'dao', '航': 'hang', '网': 'wang', '站': 'zhan',
             '搜': 'sou', '索': 'suo', '百': 'bai', '度': 'du',
             '谷': 'gu', '歌': 'ge', '微': 'wei', '信': 'xin',
             '淘': 'tao', '宝': 'bao', '京': 'jing', '东': 'dong',
             '知': 'zhi', '乎': 'hu', '哔': 'bi', '哩': 'li',
             '视': 'shi', '频': 'pin', '音': 'yin', '乐': 'le',
             '图': 'tu', '片': 'pian', '工': 'gong', '具': 'ju',
             '学': 'xue', '习': 'xi', '编': 'bian', '程': 'cheng',
             '设': 'she', '计': 'ji', '开': 'kai', '发': 'fa'
         };
        
        return text.split('').map(char => pinyinMap[char] || char).join('');
    }
    
    /**
     * 加载搜索历史
     */
    loadSearchHistory() {
        const stored = localStorage.getItem('searchHistory');
        if (stored) {
            try {
                this.searchHistory = JSON.parse(stored);
            } catch (error) {
                console.error('搜索历史加载失败:', error);
                this.searchHistory = [];
            }
        }
    }
    
    /**
     * 保存搜索历史
     */
    saveSearchHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听应用数据更新
        this.app.events.addEventListener('dataUpdated', () => {
            this.buildSearchIndex();
        });
    }
    
    /**
     * 执行搜索
     */
    search(query) {
        if (!query || query.trim().length === 0) {
            this.clearSearch();
            return;
        }
        
        const normalizedQuery = query.trim().toLowerCase();
        
        // 记录搜索历史
        this.addToSearchHistory(normalizedQuery);
        
        // 执行搜索
        const results = this.performSearch(normalizedQuery);
        
        // 显示结果
        this.displayResults(results, normalizedQuery);
        
        // 更新搜索建议
        this.updateSuggestions(normalizedQuery);
    }
    
    /**
     * 执行搜索算法
     */
    performSearch(query) {
        const results = new Map();
        const queryTerms = this.splitWords(query);
        
        // 1. 精确匹配
        this.app.data.sites.forEach(site => {
            let score = 0;
            
            // 标题精确匹配
            if (site.title && site.title.toLowerCase().includes(query)) {
                score += 100;
            }
            
            // 描述精确匹配
            if (site.desc && site.desc.toLowerCase().includes(query)) {
                score += 50;
            }
            
            // URL匹配
            if (site.url && site.url.toLowerCase().includes(query)) {
                score += 30;
            }
            
            // 部分匹配
            queryTerms.forEach(term => {
                if (site.title && site.title.toLowerCase().includes(term)) {
                    score += 20;
                }
                if (site.desc && site.desc.toLowerCase().includes(term)) {
                    score += 10;
                }
            });
            
            if (score > 0) {
                results.set(site.id, { site, score });
            }
        });
        
        // 2. 索引搜索
        queryTerms.forEach(term => {
            this.searchIndex.forEach((sites, indexTerm) => {
                if (indexTerm.includes(term)) {
                    sites.forEach(site => {
                        const existing = results.get(site.id);
                        const score = indexTerm === term ? 15 : 5; // 完全匹配更高分
                        
                        if (existing) {
                            existing.score += score;
                        } else {
                            results.set(site.id, { site, score });
                        }
                    });
                }
            });
        });
        
        // 按分数排序并返回
        return Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .map(result => result.site);
    }
    
    /**
     * 显示搜索结果
     */
    displayResults(results, query) {
        // 隐藏所有网站卡片
        const allCards = this.app.elements.sitesContainer.querySelectorAll('.site-card');
        const allSections = this.app.elements.sitesContainer.querySelectorAll('.category-section');
        
        allCards.forEach(card => card.style.display = 'none');
        allSections.forEach(section => section.style.display = 'none');
        
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        // 显示匹配的网站
        results.forEach(site => {
            const card = this.app.elements.sitesContainer.querySelector(`[data-site-id="${site.id}"]`);
            if (card) {
                card.style.display = 'block';
                
                // 显示包含该卡片的分类
                const section = card.closest('.category-section');
                if (section) {
                    section.style.display = 'block';
                }
                
                // 高亮匹配的文本
                this.highlightText(card, query);
            }
        });
        
        console.log(`🔍 搜索 "${query}" 找到 ${results.length} 个结果`);
    }
    
    /**
     * 高亮匹配的文本
     */
    highlightText(card, query) {
        const title = card.querySelector('.site-title');
        const desc = card.querySelector('.site-description');
        
        if (title) {
            title.innerHTML = this.addHighlight(title.textContent, query);
        }
        
        if (desc) {
            desc.innerHTML = this.addHighlight(desc.textContent, query);
        }
    }
    
    /**
     * 添加高亮标记
     */
    addHighlight(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * 转义正则表达式特殊字符
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 显示无结果页面
     */
    showNoResults(query) {
        // 创建无结果提示
        const noResultsHtml = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>未找到相关结果</h3>
                <p>没有找到与 "<strong>${query}</strong>" 相关的网站</p>
                <div class="search-suggestions">
                    <p>建议：</p>
                    <ul>
                        <li>检查拼写是否正确</li>
                        <li>尝试使用更简短的关键词</li>
                        <li>使用网站名称或域名搜索</li>
                    </ul>
                </div>
            </div>
        `;
        
        // 临时显示无结果页面
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = noResultsHtml;
        tempDiv.className = 'temp-no-results';
        
        this.app.elements.sitesContainer.appendChild(tempDiv);
        
        // 3秒后自动清除
        setTimeout(() => {
            if (tempDiv.parentNode) {
                tempDiv.parentNode.removeChild(tempDiv);
            }
            this.clearSearch();
        }, 3000);
    }
    
    /**
     * 更新搜索建议
     */
    updateSuggestions(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = this.generateSuggestions(query);
        this.displaySuggestions(suggestions);
    }
    
    /**
     * 生成搜索建议
     */
    generateSuggestions(query) {
        const suggestions = new Set();
        
        // 从搜索历史中找建议
        this.searchHistory.forEach(historyItem => {
            if (historyItem.includes(query) && historyItem !== query) {
                suggestions.add(historyItem);
            }
        });
        
        // 从网站标题中找建议
        this.app.data.sites.forEach(site => {
            if (site.title && site.title.toLowerCase().includes(query)) {
                suggestions.add(site.title);
            }
        });
        
        // 从分类中找建议
        this.app.data.categories.forEach(category => {
            if (category.title && category.title.toLowerCase().includes(query)) {
                suggestions.add(category.title);
            }
        });
        
        // 限制建议数量
        return Array.from(suggestions).slice(0, 8);
    }
    
    /**
     * 显示搜索建议
     */
    displaySuggestions(suggestions) {
        const container = this.app.elements.searchSuggestions;
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        const html = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</div>`
        ).join('');
        
        container.innerHTML = html;
        container.style.display = 'block';
        
        // 绑定点击事件
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                this.app.elements.searchInput.value = suggestion;
                this.search(suggestion);
                this.hideSuggestions();
            });
        });
    }
    
    /**
     * 隐藏搜索建议
     */
    hideSuggestions() {
        this.app.elements.searchSuggestions.style.display = 'none';
    }
    
    /**
     * 清除搜索
     */
    clearSearch() {
        this.hideSuggestions();
        
        // 显示所有网站
        const allCards = this.app.elements.sitesContainer.querySelectorAll('.site-card');
        const allSections = this.app.elements.sitesContainer.querySelectorAll('.category-section');
        
        allCards.forEach(card => {
            card.style.display = 'block';
            
            // 清除高亮
            const title = card.querySelector('.site-title');
            const desc = card.querySelector('.site-description');
            
            if (title) {
                title.innerHTML = title.textContent;
            }
            if (desc) {
                desc.innerHTML = desc.textContent;
            }
        });
        
        allSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // 清除临时无结果页面
        const tempResults = this.app.elements.sitesContainer.querySelectorAll('.temp-no-results');
        tempResults.forEach(temp => {
            if (temp.parentNode) {
                temp.parentNode.removeChild(temp);
            }
        });
    }
    
    /**
     * 添加到搜索历史
     */
    addToSearchHistory(query) {
        // 移除已存在的相同查询
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // 添加到开头
        this.searchHistory.unshift(query);
        
        // 保持最近20条记录
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(0, 20);
        }
        
        this.saveSearchHistory();
    }
    
    /**
     * 获取热门搜索词
     */
    getPopularSearches() {
        const searchCounts = new Map();
        
        // 统计搜索频率（简单实现）
        this.searchHistory.forEach(query => {
            searchCounts.set(query, (searchCounts.get(query) || 0) + 1);
        });
        
        return Array.from(searchCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);
    }
    
    /**
     * 清除搜索历史
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
}

// 注册到全局
window.SearchEngine = SearchEngine;