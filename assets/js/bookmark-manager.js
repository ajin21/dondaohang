/**
 * 书签管理模块
 * 支持导入导出书签、数据管理和格式转换
 */

class BookmarkManager {
    constructor(app) {
        this.app = app;
        this.modal = document.getElementById('bookmarkModal');
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听应用事件
        this.app.events.addEventListener('openBookmarkModal', () => {
            this.openModal();
        });
        
        // 模态框控制
        document.getElementById('closeBookmarkModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 标签切换
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 文件上传
        const fileInput = document.getElementById('bookmarkFile');
        const uploadArea = document.getElementById('uploadArea');
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // 导出功能
        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportAsJson();
        });
        
        document.getElementById('exportHtml').addEventListener('click', () => {
            this.exportAsHtml();
        });
        
        document.getElementById('exportBackup').addEventListener('click', () => {
            this.createBackup();
        });
        
        // 数据管理
        document.getElementById('clearCache').addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('resetData').addEventListener('click', () => {
            this.resetData();
        });
    }
    
    /**
     * 打开模态框
     */
    openModal() {
        this.modal.classList.add('active');
        this.updateStats();
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        this.modal.classList.remove('active');
    }
    
    /**
     * 切换标签
     */
    switchTab(tabName) {
        // 更新按钮状态
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}Tab`).style.display = 'block';
    }
    
    /**
     * 处理文件选择
     */
    async handleFileSelect(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        const fileName = file.name.toLowerCase();
        
        try {
            this.setProcessing(true);
            
            let data;
            if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                data = await this.parseHtmlBookmarks(file);
            } else if (fileName.endsWith('.json')) {
                data = await this.parseJsonData(file);
            } else {
                throw new Error('不支持的文件格式。请使用 HTML 或 JSON 文件。');
            }
            
            await this.importData(data);
            this.app.showToast('数据导入成功！', 'success');
            
            // 检查是否需要自动同步
            if (document.getElementById('autoSync').checked) {
                this.app.events.dispatchEvent(new CustomEvent('autoSyncData'));
            }
            
        } catch (error) {
            console.error('文件处理失败:', error);
            this.app.showToast(`导入失败: ${error.message}`, 'error');
        } finally {
            this.setProcessing(false);
        }
    }
    
    /**
     * 解析HTML书签文件
     */
    async parseHtmlBookmarks(file) {
        const text = await this.readFileAsText(file);
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const categories = [];
        const sites = [];
        let categoryOrder = 0;
        
        // 解析书签结构
        const parseFolder = (element, parentId = null) => {
            const dt = element.querySelector('dt');
            if (!dt) return;
            
            const h3 = dt.querySelector('h3');
            if (h3) {
                // 这是一个文件夹
                const categoryId = this.app.generateId(h3.textContent);
                categories.push({
                    id: categoryId,
                    title: h3.textContent.trim(),
                    icon: 'folder',
                    parentId: parentId,
                    order: categoryOrder++
                });
                
                // 查找子项
                const dl = element.querySelector('dl');
                if (dl) {
                    const subItems = dl.querySelectorAll('dt');
                    subItems.forEach(subItem => {
                        const subH3 = subItem.querySelector('h3');
                        const subA = subItem.querySelector('a');
                        
                        if (subH3) {
                            // 子文件夹
                            parseFolder(subItem, categoryId);
                        } else if (subA) {
                            // 书签链接
                            sites.push({
                                id: this.app.generateId(subA.textContent + subA.href),
                                title: subA.textContent.trim(),
                                desc: subA.textContent.trim(),
                                url: subA.href,
                                image: `${this.app.config.iconService}${this.app.extractDomain(subA.href)}`,
                                categoryId: categoryId
                            });
                        }
                    });
                }
            } else {
                // 这是一个书签链接
                const a = dt.querySelector('a');
                if (a && parentId) {
                    sites.push({
                        id: this.app.generateId(a.textContent + a.href),
                        title: a.textContent.trim(),
                        desc: a.textContent.trim(),
                        url: a.href,
                        image: `${this.app.config.iconService}${this.app.extractDomain(a.href)}`,
                        categoryId: parentId
                    });
                }
            }
        };
        
        // 查找所有顶级DT元素
        const topLevelDts = doc.querySelectorAll('dl > dt');
        topLevelDts.forEach(dt => {
            parseFolder(dt);
        });
        
        // 如果没有找到分类，创建默认分类
        if (categories.length === 0) {
            const defaultCategoryId = 'imported-bookmarks';
            categories.push({
                id: defaultCategoryId,
                title: '导入的书签',
                icon: 'folder',
                parentId: null,
                order: 0
            });
            
            // 将所有网站放到默认分类
            sites.forEach(site => {
                site.categoryId = defaultCategoryId;
            });
        }
        
        return {
            categories,
            sites,
            lastUpdate: Date.now(),
            source: 'html_bookmarks'
        };
    }
    
    /**
     * 解析JSON数据文件
     */
    async parseJsonData(file) {
        const text = await this.readFileAsText(file);
        const data = JSON.parse(text);
        
        // 验证数据格式
        if (!data.categories || !Array.isArray(data.categories)) {
            throw new Error('JSON 文件格式不正确：缺少 categories 字段');
        }
        
        if (!data.sites || !Array.isArray(data.sites)) {
            throw new Error('JSON 文件格式不正确：缺少 sites 字段');
        }
        
        return {
            ...data,
            lastUpdate: Date.now(),
            source: 'json_data'
        };
    }
    
    /**
     * 读取文件为文本
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }
    
    /**
     * 导入数据
     */
    async importData(newData) {
        const mergeData = document.getElementById('mergeData').checked;
        
        let finalData;
        if (mergeData && this.app.data) {
            // 合并数据
            finalData = this.mergeData(this.app.data, newData);
        } else {
            // 替换数据
            finalData = newData;
        }
        
        // 更新应用数据
        this.app.data = finalData;
        
        // 保存到本地存储
        localStorage.setItem('navigationData', JSON.stringify(finalData));
        
        // 清除缓存
        this.app.cache.clear();
        
        // 重新渲染
        await this.app.renderApp();
        
        this.updateStats();
    }
    
    /**
     * 合并数据
     */
    mergeData(existingData, newData) {
        const merged = {
            categories: [...existingData.categories],
            sites: [...existingData.sites],
            lastUpdate: Date.now()
        };
        
        // 合并分类（避免重复）
        newData.categories.forEach(newCategory => {
            const exists = merged.categories.find(cat => 
                cat.title === newCategory.title && cat.parentId === newCategory.parentId
            );
            
            if (!exists) {
                merged.categories.push({
                    ...newCategory,
                    id: this.app.generateId(newCategory.title + Date.now()) // 确保ID唯一
                });
            }
        });
        
        // 合并网站（避免重复URL）
        newData.sites.forEach(newSite => {
            const exists = merged.sites.find(site => site.url === newSite.url);
            
            if (!exists) {
                // 找到对应的分类ID
                const category = merged.categories.find(cat => 
                    cat.title === newData.categories.find(c => c.id === newSite.categoryId)?.title
                );
                
                merged.sites.push({
                    ...newSite,
                    id: this.app.generateId(newSite.title + newSite.url + Date.now()),
                    categoryId: category ? category.id : merged.categories[0].id
                });
            }
        });
        
        return merged;
    }
    
    /**
     * 导出为JSON
     */
    exportAsJson() {
        const data = {
            ...this.app.data,
            exportTime: new Date().toISOString(),
            version: this.app.config.version
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        this.downloadFile(blob, `navigation-data-${this.formatDate()}.json`);
        this.app.showToast('JSON 数据导出成功！', 'success');
    }
    
    /**
     * 导出为HTML书签
     */
    exportAsHtml() {
        const html = this.generateBookmarkHtml();
        const blob = new Blob([html], { type: 'text/html' });
        
        this.downloadFile(blob, `bookmarks-${this.formatDate()}.html`);
        this.app.showToast('HTML 书签导出成功！', 'success');
    }
    
    /**
     * 生成书签HTML
     */
    generateBookmarkHtml() {
        const categories = this.app.data.categories.filter(cat => !cat.parentId);
        
        let bookmarksHtml = '';
        
        categories.forEach(category => {
            const subcategories = this.app.data.categories.filter(cat => cat.parentId === category.id);
            const sites = this.app.data.sites.filter(site => site.categoryId === category.id);
            
            if (subcategories.length > 0) {
                // 有子分类
                bookmarksHtml += `<DT><H3>${category.title}</H3>\n<DL><p>\n`;
                
                subcategories.forEach(subCategory => {
                    const subSites = this.app.data.sites.filter(site => site.categoryId === subCategory.id);
                    if (subSites.length > 0) {
                        bookmarksHtml += `<DT><H3>${subCategory.title}</H3>\n<DL><p>\n`;
                        subSites.forEach(site => {
                            bookmarksHtml += `<DT><A HREF="${site.url}">${site.title}</A>\n`;
                        });
                        bookmarksHtml += `</DL><p>\n`;
                    }
                });
                
                bookmarksHtml += `</DL><p>\n`;
            } else if (sites.length > 0) {
                // 直接显示网站
                bookmarksHtml += `<DT><H3>${category.title}</H3>\n<DL><p>\n`;
                sites.forEach(site => {
                    bookmarksHtml += `<DT><A HREF="${site.url}">${site.title}</A>\n`;
                });
                bookmarksHtml += `</DL><p>\n`;
            }
        });
        
        return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${bookmarksHtml}
</DL><p>`;
    }
    
    /**
     * 创建完整备份
     */
    createBackup() {
        const backup = {
            data: this.app.data,
            settings: {
                githubConfig: localStorage.getItem('githubConfig'),
                visitHistory: localStorage.getItem('visitHistory'),
                totalViews: localStorage.getItem('totalViews')
            },
            backupTime: new Date().toISOString(),
            version: this.app.config.version
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
            type: 'application/json'
        });
        
        this.downloadFile(blob, `navigation-backup-${this.formatDate()}.json`);
        this.app.showToast('完整备份创建成功！', 'success');
    }
    
    /**
     * 下载文件
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * 格式化日期
     */
    formatDate() {
        const now = new Date();
        return now.getFullYear() + 
               String(now.getMonth() + 1).padStart(2, '0') + 
               String(now.getDate()).padStart(2, '0') + '-' +
               String(now.getHours()).padStart(2, '0') + 
               String(now.getMinutes()).padStart(2, '0');
    }
    
    /**
     * 清理缓存
     */
    clearCache() {
        if (confirm('确定要清理所有缓存吗？这将清除访问历史和临时数据。')) {
            // 清理应用缓存
            this.app.cache.clear();
            
            // 清理访问历史
            localStorage.removeItem('visitHistory');
            
            // 清理其他缓存
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
            
            this.app.showToast('缓存清理完成！', 'success');
            this.updateStats();
        }
    }
    
    /**
     * 重置数据
     */
    resetData() {
        if (confirm('确定要重置所有数据吗？这将删除所有自定义数据，恢复为默认状态。此操作不可恢复！')) {
            if (confirm('再次确认：这将永久删除所有数据，是否继续？')) {
                // 清除本地数据
                localStorage.removeItem('navigationData');
                localStorage.removeItem('visitHistory');
                localStorage.removeItem('totalViews');
                localStorage.removeItem('githubConfig');
                
                // 重置应用数据
                this.app.data = this.app.getDefaultData();
                this.app.cache.clear();
                
                // 重新渲染
                this.app.renderApp();
                
                this.app.showToast('数据重置完成！', 'success');
                this.updateStats();
                this.closeModal();
            }
        }
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        if (!this.app.data) return;
        
        const totalCategories = this.app.data.categories.length;
        const totalWebsites = this.app.data.sites.length;
        const lastUpdate = this.app.data.lastUpdate ? 
            new Date(this.app.data.lastUpdate).toLocaleString() : '未知';
        
        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('totalWebsites').textContent = totalWebsites;
        document.getElementById('lastUpdate').textContent = lastUpdate;
    }
    
    /**
     * 设置处理状态
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
        
        const uploadArea = document.getElementById('uploadArea');
        const buttons = this.modal.querySelectorAll('button');
        
        if (isProcessing) {
            uploadArea.style.opacity = '0.5';
            uploadArea.style.pointerEvents = 'none';
            buttons.forEach(btn => btn.disabled = true);
        } else {
            uploadArea.style.opacity = '1';
            uploadArea.style.pointerEvents = 'auto';
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

// 注册到全局
window.BookmarkManager = BookmarkManager;