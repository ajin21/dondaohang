/**
 * 数据模块 - 兼容性支持
 * 提供向后兼容的数据格式和加载逻辑
 */

// 为了兼容现有的source.js，我们在这里提供数据转换
// 如果navData已经存在，说明source.js已经加载
if (typeof navData === 'undefined') {
    // 如果没有加载source.js，提供默认数据
    window.navData = {
        list: [
            {
                title: "AI工具",
                icon: "robot",
                nav: [
                    {
                        title: "ChatGPT",
                        desc: "OpenAI开发的AI对话助手",
                        url: "https://chat.openai.com",
                        image: "https://icon.horse/icon/chat.openai.com"
                    },
                    {
                        title: "Claude",
                        desc: "Anthropic开发的AI助手",
                        url: "https://claude.ai",
                        image: "https://icon.horse/icon/claude.ai"
                    },
                    {
                        title: "Gemini",
                        desc: "Google的AI对话模型",
                        url: "https://gemini.google.com",
                        image: "https://icon.horse/icon/gemini.google.com"
                    }
                ]
            },
            {
                title: "开发工具",
                icon: "code",
                nav: [
                    {
                        title: "GitHub",
                        desc: "全球最大的代码托管平台",
                        url: "https://github.com",
                        image: "https://icon.horse/icon/github.com"
                    },
                    {
                        title: "GitLab",
                        desc: "DevOps生命周期工具",
                        url: "https://gitlab.com",
                        image: "https://icon.horse/icon/gitlab.com"
                    },
                    {
                        title: "Stack Overflow",
                        desc: "程序员问答社区",
                        url: "https://stackoverflow.com",
                        image: "https://icon.horse/icon/stackoverflow.com"
                    }
                ]
            },
            {
                title: "搜索引擎",
                icon: "search",
                nav: [
                    {
                        title: "Google",
                        desc: "全球最大的搜索引擎",
                        url: "https://google.com",
                        image: "https://icon.horse/icon/google.com"
                    },
                    {
                        title: "百度",
                        desc: "中国最大的搜索引擎",
                        url: "https://baidu.com",
                        image: "https://icon.horse/icon/baidu.com"
                    },
                    {
                        title: "Bing",
                        desc: "微软搜索引擎",
                        url: "https://bing.com",
                        image: "https://icon.horse/icon/bing.com"
                    }
                ]
            },
            {
                title: "社交媒体",
                icon: "users",
                nav: [
                    {
                        title: "Twitter",
                        desc: "全球微博社交平台",
                        url: "https://twitter.com",
                        image: "https://icon.horse/icon/twitter.com"
                    },
                    {
                        title: "微博",
                        desc: "中国微博社交平台",
                        url: "https://weibo.com",
                        image: "https://icon.horse/icon/weibo.com"
                    },
                    {
                        title: "LinkedIn",
                        desc: "职业社交网络",
                        url: "https://linkedin.com",
                        image: "https://icon.horse/icon/linkedin.com"
                    }
                ]
            },
            {
                title: "设计资源",
                icon: "paint-brush",
                nav: [
                    {
                        title: "Figma",
                        desc: "在线界面设计工具",
                        url: "https://figma.com",
                        image: "https://icon.horse/icon/figma.com"
                    },
                    {
                        title: "Dribbble",
                        desc: "设计师作品展示平台",
                        url: "https://dribbble.com",
                        image: "https://icon.horse/icon/dribbble.com"
                    },
                    {
                        title: "Behance",
                        desc: "Adobe创意作品展示平台",
                        url: "https://behance.net",
                        image: "https://icon.horse/icon/behance.net"
                    }
                ]
            },
            {
                title: "在线工具",
                icon: "wrench",
                nav: [
                    {
                        title: "在线PS",
                        desc: "免费在线图片编辑器",
                        url: "https://www.photopea.com",
                        image: "https://icon.horse/icon/photopea.com"
                    },
                    {
                        title: "TinyPNG",
                        desc: "在线图片压缩工具",
                        url: "https://tinypng.com",
                        image: "https://icon.horse/icon/tinypng.com"
                    },
                    {
                        title: "正则表达式测试",
                        desc: "在线正则表达式测试工具",
                        url: "https://regex101.com",
                        image: "https://icon.horse/icon/regex101.com"
                    }
                ]
            },
            {
                title: "学习资源",
                icon: "graduation-cap",
                nav: [
                    {
                        title: "MDN",
                        desc: "Web开发文档和学习资源",
                        url: "https://developer.mozilla.org",
                        image: "https://icon.horse/icon/developer.mozilla.org"
                    },
                    {
                        title: "FreeCodeCamp",
                        desc: "免费编程学习平台",
                        url: "https://freecodecamp.org",
                        image: "https://icon.horse/icon/freecodecamp.org"
                    },
                    {
                        title: "Coursera",
                        desc: "在线课程学习平台",
                        url: "https://coursera.org",
                        image: "https://icon.horse/icon/coursera.org"
                    }
                ]
            },
            {
                title: "娱乐影音",
                icon: "film",
                nav: [
                    {
                        title: "YouTube",
                        desc: "全球最大的视频分享平台",
                        url: "https://youtube.com",
                        image: "https://icon.horse/icon/youtube.com"
                    },
                    {
                        title: "哔哩哔哩",
                        desc: "中国年轻人文化社区",
                        url: "https://bilibili.com",
                        image: "https://icon.horse/icon/bilibili.com"
                    },
                    {
                        title: "Netflix",
                        desc: "在线视频流媒体服务",
                        url: "https://netflix.com",
                        image: "https://icon.horse/icon/netflix.com"
                    }
                ]
            }
        ]
    };
}

/**
 * 数据管理器
 * 处理数据加载、转换和更新
 */
class DataManager {
    constructor() {
        this.data = null;
        this.lastUpdate = null;
        this.version = '2.0.0';
    }
    
    /**
     * 获取数据
     */
    getData() {
        if (!this.data) {
            this.loadData();
        }
        return this.data;
    }
    
    /**
     * 加载数据
     */
    loadData() {
        // 优先从localStorage加载
        const stored = localStorage.getItem('navigationData');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                this.lastUpdate = this.data.lastUpdate;
                return this.data;
            } catch (error) {
                console.warn('本地数据解析失败，使用默认数据:', error);
            }
        }
        
        // 从navData转换
        if (typeof navData !== 'undefined') {
            this.data = this.convertLegacyData(navData);
        } else {
            // 使用默认数据
            this.data = this.getDefaultData();
        }
        
        this.lastUpdate = Date.now();
        this.data.lastUpdate = this.lastUpdate;
        
        // 保存到localStorage
        this.saveData();
        
        return this.data;
    }
    
    /**
     * 转换旧数据格式
     */
    convertLegacyData(legacyData) {
        const converted = {
            categories: [],
            sites: [],
            lastUpdate: Date.now(),
            version: this.version
        };
        
        if (legacyData && legacyData.list) {
            legacyData.list.forEach((category, categoryIndex) => {
                if (category.nav) {
                    // 主分类
                    const categoryId = this.generateId(category.title);
                    converted.categories.push({
                        id: categoryId,
                        title: category.title,
                        icon: category.icon || 'folder',
                        parentId: null,
                        order: categoryIndex
                    });
                    
                    // 添加网站
                    category.nav.forEach((site, siteIndex) => {
                        converted.sites.push({
                            id: this.generateId(site.title + site.url),
                            title: site.title,
                            desc: site.desc || '',
                            url: site.url,
                            image: site.image || `https://icon.horse/icon/${this.extractDomain(site.url)}`,
                            categoryId: categoryId,
                            order: siteIndex
                        });
                    });
                }
                
                // 子分类
                if (category.child) {
                    const parentId = this.generateId(category.title);
                    category.child.forEach((subCategory, subIndex) => {
                        const subCategoryId = this.generateId(subCategory.title);
                        converted.categories.push({
                            id: subCategoryId,
                            title: subCategory.title,
                            icon: subCategory.icon || 'folder',
                            parentId: parentId,
                            order: subIndex
                        });
                        
                        // 添加子分类网站
                        if (subCategory.nav) {
                            subCategory.nav.forEach((site, siteIndex) => {
                                converted.sites.push({
                                    id: this.generateId(site.title + site.url),
                                    title: site.title,
                                    desc: site.desc || '',
                                    url: site.url,
                                    image: site.image || `https://icon.horse/icon/${this.extractDomain(site.url)}`,
                                    categoryId: subCategoryId,
                                    order: siteIndex
                                });
                            });
                        }
                    });
                }
            });
        }
        
        return converted;
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
                    id: 'example',
                    title: '示例网站',
                    desc: '这是一个示例网站',
                    url: 'https://example.com',
                    image: 'https://icon.horse/icon/example.com',
                    categoryId: 'default',
                    order: 0
                }
            ],
            lastUpdate: Date.now(),
            version: this.version
        };
    }
    
    /**
     * 保存数据
     */
    saveData() {
        if (this.data) {
            this.data.lastUpdate = Date.now();
            localStorage.setItem('navigationData', JSON.stringify(this.data));
        }
    }
    
    /**
     * 更新数据
     */
    updateData(newData) {
        this.data = {
            ...newData,
            lastUpdate: Date.now(),
            version: this.version
        };
        this.saveData();
        return this.data;
    }
    
    /**
     * 添加网站
     */
    addSite(siteData) {
        if (!this.data) this.loadData();
        
        const site = {
            id: this.generateId(siteData.title + siteData.url),
            title: siteData.title,
            desc: siteData.desc || '',
            url: siteData.url,
            image: siteData.image || `https://icon.horse/icon/${this.extractDomain(siteData.url)}`,
            categoryId: siteData.categoryId,
            order: this.data.sites.filter(s => s.categoryId === siteData.categoryId).length
        };
        
        this.data.sites.push(site);
        this.saveData();
        
        return site;
    }
    
    /**
     * 删除网站
     */
    removeSite(siteId) {
        if (!this.data) return false;
        
        const index = this.data.sites.findIndex(site => site.id === siteId);
        if (index > -1) {
            this.data.sites.splice(index, 1);
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * 添加分类
     */
    addCategory(categoryData) {
        if (!this.data) this.loadData();
        
        const category = {
            id: this.generateId(categoryData.title),
            title: categoryData.title,
            icon: categoryData.icon || 'folder',
            parentId: categoryData.parentId || null,
            order: this.data.categories.filter(c => c.parentId === categoryData.parentId).length
        };
        
        this.data.categories.push(category);
        this.saveData();
        
        return category;
    }
    
    /**
     * 删除分类
     */
    removeCategory(categoryId) {
        if (!this.data) return false;
        
        // 删除分类下的所有网站
        this.data.sites = this.data.sites.filter(site => site.categoryId !== categoryId);
        
        // 删除子分类
        const childCategories = this.data.categories.filter(cat => cat.parentId === categoryId);
        childCategories.forEach(child => {
            this.removeCategory(child.id);
        });
        
        // 删除分类本身
        const index = this.data.categories.findIndex(cat => cat.id === categoryId);
        if (index > -1) {
            this.data.categories.splice(index, 1);
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * 导出数据
     */
    exportData() {
        return {
            ...this.data,
            exportTime: new Date().toISOString(),
            exportVersion: this.version
        };
    }
    
    /**
     * 导入数据
     */
    importData(importedData) {
        // 验证数据格式
        if (!importedData.categories || !importedData.sites) {
            throw new Error('数据格式不正确');
        }
        
        this.updateData(importedData);
        return this.data;
    }
    
    /**
     * 清空数据
     */
    clearData() {
        this.data = this.getDefaultData();
        this.saveData();
        return this.data;
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        if (!this.data) this.loadData();
        
        return {
            totalCategories: this.data.categories.length,
            totalSites: this.data.sites.length,
            lastUpdate: this.data.lastUpdate,
            version: this.data.version
        };
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
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();

// 兼容性支持：保持原有的全局变量
if (typeof navData !== 'undefined') {
    // 如果原始数据存在，确保新系统可以使用
    console.log('📄 检测到原始数据格式，已转换为新格式');
}