/**
 * 新的搜索组件
 * 基于现代化设计的搜索功能实现
 */

class SearchComponent {
    constructor() {
        this.searchInput = null;
        this.searchContainer = null;
        this.searchResults = null;
        this.searchTimeout = null;
        this.isSearchActive = false;
        this.originalData = [];
        this.filteredData = [];
        
        this.init();
    }

    init() {
        this.createSearchUI();
        this.bindEvents();
        this.loadOriginalData();
    }

    createSearchUI() {
        // 创建搜索容器
        const searchHTML = `
            <div class="modern-search-container">
                <div class="search-input-wrapper">
                    <div class="search-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <input type="text" class="modern-search-input" placeholder="搜索网站、工具或服务..." autocomplete="off">
                    <div class="search-clear" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="search-suggestions" style="display: none;">
                    <div class="search-suggestions-header">
                        <span class="suggestions-title">搜索建议</span>
                        <span class="suggestions-count">0 个结果</span>
                    </div>
                    <div class="search-suggestions-list"></div>
                </div>
            </div>
        `;

        // 找到原有搜索框位置并替换
        const oldSearchContainer = document.querySelector('.search');
        if (oldSearchContainer) {
            oldSearchContainer.innerHTML = searchHTML;
            this.searchContainer = oldSearchContainer.querySelector('.modern-search-container');
        } else {
            // 如果没有找到原有搜索框，在统计信息后插入
            const statsContainer = document.querySelector('.stats-container');
            if (statsContainer) {
                const searchDiv = document.createElement('div');
                searchDiv.className = 'search';
                searchDiv.innerHTML = searchHTML;
                statsContainer.insertAdjacentElement('afterend', searchDiv);
                this.searchContainer = searchDiv.querySelector('.modern-search-container');
            }
        }

        this.searchInput = this.searchContainer.querySelector('.modern-search-input');
        this.searchResults = this.searchContainer.querySelector('.search-suggestions');
    }

    bindEvents() {
        // 搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // 搜索框聚焦事件
        this.searchInput.addEventListener('focus', () => {
            this.searchContainer.classList.add('search-focused');
            if (this.searchInput.value.trim()) {
                this.showSuggestions();
            }
        });

        // 搜索框失焦事件
        this.searchInput.addEventListener('blur', (e) => {
            // 延迟隐藏，允许点击建议项
            setTimeout(() => {
                this.searchContainer.classList.remove('search-focused');
                this.hideSuggestions();
            }, 200);
        });

        // 清除按钮事件
        const clearBtn = this.searchContainer.querySelector('.search-clear');
        clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // 键盘事件
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // 点击建议项事件
        this.searchResults.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            if (suggestionItem) {
                this.selectSuggestion(suggestionItem);
            }
        });
    }

    handleSearchInput(query) {
        const trimmedQuery = query.trim();
        
        // 显示/隐藏清除按钮
        const clearBtn = this.searchContainer.querySelector('.search-clear');
        clearBtn.style.display = trimmedQuery ? 'flex' : 'none';

        // 清除之前的定时器
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // 防抖搜索
        this.searchTimeout = setTimeout(() => {
            if (trimmedQuery) {
                this.performSearch(trimmedQuery);
                this.showSuggestions();
            } else {
                this.resetSearch();
                this.hideSuggestions();
            }
        }, 200);
    }

    performSearch(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredData = [];

        // 搜索所有网站数据
        this.originalData.forEach(category => {
            if (category.nav) {
                category.nav.forEach(site => {
                    const titleMatch = site.title.toLowerCase().includes(lowerQuery);
                    const descMatch = site.desc.toLowerCase().includes(lowerQuery);
                    const urlMatch = site.url.toLowerCase().includes(lowerQuery);

                    if (titleMatch || descMatch || urlMatch) {
                        this.filteredData.push({
                            ...site,
                            category: category.title,
                            matchType: titleMatch ? 'title' : (descMatch ? 'desc' : 'url')
                        });
                    }
                });
            }

            // 搜索子分类
            if (category.child) {
                category.child.forEach(subCategory => {
                    if (subCategory.nav) {
                        subCategory.nav.forEach(site => {
                            const titleMatch = site.title.toLowerCase().includes(lowerQuery);
                            const descMatch = site.desc.toLowerCase().includes(lowerQuery);
                            const urlMatch = site.url.toLowerCase().includes(lowerQuery);

                            if (titleMatch || descMatch || urlMatch) {
                                this.filteredData.push({
                                    ...site,
                                    category: `${category.title} > ${subCategory.title}`,
                                    matchType: titleMatch ? 'title' : (descMatch ? 'desc' : 'url')
                                });
                            }
                        });
                    }
                });
            }
        });

        // 按匹配类型排序（标题匹配优先）
        this.filteredData.sort((a, b) => {
            const order = { title: 0, desc: 1, url: 2 };
            return order[a.matchType] - order[b.matchType];
        });

        this.updateSuggestions();
        this.filterMainContent(query);
    }

    updateSuggestions() {
        const suggestionsList = this.searchResults.querySelector('.search-suggestions-list');
        const suggestionsCount = this.searchResults.querySelector('.suggestions-count');
        
        suggestionsCount.textContent = `${this.filteredData.length} 个结果`;

        if (this.filteredData.length === 0) {
            suggestionsList.innerHTML = '<div class="no-results">未找到相关结果</div>';
            return;
        }

        // 限制显示前8个结果
        const displayData = this.filteredData.slice(0, 8);
        
        suggestionsList.innerHTML = displayData.map(site => `
            <div class="suggestion-item" data-url="${site.url}" data-title="${site.title}" data-desc="${site.desc}">
                <div class="suggestion-icon">
                    ${site.image ? 
                        `<img src="${site.image}" alt="${site.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <span class="fallback-icon" style="display:none; background: ${this.getRandomColor(site.title)}">${site.title.charAt(0)}</span>` :
                        `<span class="fallback-icon" style="background: ${this.getRandomColor(site.title)}">${site.title.charAt(0)}</span>`
                    }
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${this.highlightMatch(site.title, this.searchInput.value)}</div>
                    <div class="suggestion-desc">${this.highlightMatch(site.desc, this.searchInput.value)}</div>
                    <div class="suggestion-category">${site.category}</div>
                </div>
                <div class="suggestion-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `).join('');
    }

    highlightMatch(text, query) {
        if (!query.trim()) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    getRandomColor(title) {
        const colors = ['#084177','#2b580c','#1eb2a6','#721b65','#f8615a','#a8d3da','#a8e6cf','#4f3961','#f1935c'];
        return colors[title.length % colors.length];
    }

    filterMainContent(query) {
        const elements = document.querySelectorAll(".xe-comment");
        const lowerQuery = query.toLowerCase();
        
        elements.forEach(element => {
            const title = element.querySelector(".title").textContent.toLowerCase();
            const desc = element.querySelector(".desc").textContent.toLowerCase();
            const url = element.closest(".box2").dataset.url.toLowerCase();
            const parent = element.closest(".col-sm-3");
            
            if (title.includes(lowerQuery) || desc.includes(lowerQuery) || url.includes(lowerQuery)) {
                parent.classList.remove("hide");
            } else {
                parent.classList.add("hide");
            }
        });
    }

    resetSearch() {
        // 显示所有内容
        const elements = document.querySelectorAll(".col-sm-3");
        elements.forEach(element => {
            element.classList.remove("hide");
        });
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchContainer.querySelector('.search-clear').style.display = 'none';
        this.resetSearch();
        this.hideSuggestions();
        this.searchInput.focus();
    }

    showSuggestions() {
        this.searchResults.style.display = 'block';
        this.isSearchActive = true;
    }

    hideSuggestions() {
        this.searchResults.style.display = 'none';
        this.isSearchActive = false;
    }

    selectSuggestion(suggestionItem) {
        const url = suggestionItem.dataset.url;
        const title = suggestionItem.dataset.title;
        const desc = suggestionItem.dataset.desc;
        
        // 打开链接
        window.open(url, '_blank');
        
        // 添加到历史记录
        if (window.pushHistory) {
            const image = suggestionItem.querySelector('img')?.src || 
                         `https://favicon.im/${new URL(url).hostname}`;
            
            window.pushHistory({
                title: title,
                url: url,
                desc: desc,
                image: image
            });
            
            if (window.reloadHistory) {
                window.reloadHistory();
            }
        }
        
        this.hideSuggestions();
    }

    handleKeyboardNavigation(e) {
        const suggestions = this.searchResults.querySelectorAll('.suggestion-item');
        const currentActive = this.searchResults.querySelector('.suggestion-item.active');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentActive) {
                    currentActive.classList.remove('active');
                    const next = currentActive.nextElementSibling;
                    if (next) {
                        next.classList.add('active');
                    } else {
                        suggestions[0]?.classList.add('active');
                    }
                } else {
                    suggestions[0]?.classList.add('active');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentActive) {
                    currentActive.classList.remove('active');
                    const prev = currentActive.previousElementSibling;
                    if (prev) {
                        prev.classList.add('active');
                    } else {
                        suggestions[suggestions.length - 1]?.classList.add('active');
                    }
                } else {
                    suggestions[suggestions.length - 1]?.classList.add('active');
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentActive) {
                    this.selectSuggestion(currentActive);
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                this.searchInput.blur();
                break;
        }
    }

    loadOriginalData() {
        // 从全局变量获取数据
        if (window.navData && window.navData.list) {
            this.originalData = window.navData.list;
        }
    }
}

// 导出搜索组件类
window.SearchComponent = SearchComponent;

// 注意：初始化将在数据加载完成后由主页面调用