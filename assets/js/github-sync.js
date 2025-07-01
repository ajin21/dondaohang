/**
 * GitHub同步模块
 * 支持将数据同步到GitHub仓库，实现云端备份和多设备同步
 */

class GitHubSync {
    constructor(app) {
        this.app = app;
        this.modal = document.getElementById('syncModal');
        this.config = null;
        this.isConfigured = false;
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        this.loadConfig();
        this.bindEvents();
        this.updateUI();
    }
    
    /**
     * 加载配置
     */
    loadConfig() {
        const stored = localStorage.getItem('githubConfig');
        if (stored) {
            try {
                this.config = JSON.parse(stored);
                this.isConfigured = true;
            } catch (error) {
                console.error('GitHub配置解析失败:', error);
                localStorage.removeItem('githubConfig');
            }
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听应用事件
        this.app.events.addEventListener('openSyncModal', () => {
            this.openModal();
        });
        
        this.app.events.addEventListener('autoSyncData', () => {
            if (this.isConfigured) {
                this.pushData();
            }
        });
        
        // 模态框控制
        document.getElementById('closeSyncModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 配置功能
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testConnection();
        });
        
        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveConfig();
        });
        
        // 同步功能
        document.getElementById('pullData').addEventListener('click', () => {
            this.pullData();
        });
        
        document.getElementById('pushData').addEventListener('click', () => {
            this.pushData();
        });
        
        document.getElementById('autoSyncToggle').addEventListener('click', () => {
            this.toggleAutoSync();
        });
    }
    
    /**
     * 打开模态框
     */
    openModal() {
        this.modal.classList.add('active');
        this.updateUI();
        
        if (this.config) {
            this.populateForm();
        }
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        this.modal.classList.remove('active');
    }
    
    /**
     * 填充表单
     */
    populateForm() {
        document.getElementById('githubUsername').value = this.config.username || '';
        document.getElementById('githubRepo').value = this.config.repo || '';
        document.getElementById('githubToken').value = this.config.token || '';
        document.getElementById('dataFilePath').value = this.config.filePath || 'data/sites.json';
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        const setupDiv = document.getElementById('syncSetup');
        const actionsDiv = document.getElementById('syncActions');
        
        if (this.isConfigured) {
            setupDiv.style.display = 'none';
            actionsDiv.style.display = 'block';
            this.updateStatus();
        } else {
            setupDiv.style.display = 'block';
            actionsDiv.style.display = 'none';
        }
    }
    
    /**
     * 更新状态显示
     */
    updateStatus() {
        if (!this.config) return;
        
        document.getElementById('currentRepo').textContent = 
            `${this.config.username}/${this.config.repo}`;
        
        const lastSync = localStorage.getItem('lastSyncTime');
        document.getElementById('lastSync').textContent = 
            lastSync ? new Date(parseInt(lastSync)).toLocaleString() : '从未';
        
        document.getElementById('connectionStatus').textContent = 
            this.isConfigured ? '已配置' : '未连接';
    }
    
    /**
     * 测试连接
     */
    async testConnection() {
        const username = document.getElementById('githubUsername').value.trim();
        const repo = document.getElementById('githubRepo').value.trim();
        const token = document.getElementById('githubToken').value.trim();
        
        if (!username || !repo || !token) {
            this.app.showToast('请填写完整的配置信息', 'warning');
            return;
        }
        
        try {
            this.setProcessing(true);
            
            const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                this.app.showToast('连接测试成功！', 'success');
                this.logSync('连接测试成功');
            } else if (response.status === 404) {
                this.app.showToast('仓库不存在或无权限访问', 'error');
            } else if (response.status === 401) {
                this.app.showToast('访问令牌无效', 'error');
            } else {
                this.app.showToast(`连接失败: ${response.status}`, 'error');
            }
            
        } catch (error) {
            console.error('连接测试失败:', error);
            this.app.showToast('网络连接失败', 'error');
        } finally {
            this.setProcessing(false);
        }
    }
    
    /**
     * 保存配置
     */
    saveConfig() {
        const username = document.getElementById('githubUsername').value.trim();
        const repo = document.getElementById('githubRepo').value.trim();
        const token = document.getElementById('githubToken').value.trim();
        const filePath = document.getElementById('dataFilePath').value.trim();
        
        if (!username || !repo || !token || !filePath) {
            this.app.showToast('请填写完整的配置信息', 'warning');
            return;
        }
        
        this.config = {
            username,
            repo,
            token,
            filePath,
            autoSync: false,
            lastSync: null
        };
        
        localStorage.setItem('githubConfig', JSON.stringify(this.config));
        this.isConfigured = true;
        
        this.app.showToast('配置保存成功！', 'success');
        this.updateUI();
        this.logSync('配置已保存');
    }
    
    /**
     * 从GitHub拉取数据
     */
    async pullData() {
        if (!this.isConfigured) {
            this.app.showToast('请先配置GitHub信息', 'warning');
            return;
        }
        
        try {
            this.setProcessing(true);
            this.logSync('开始从GitHub拉取数据...');
            
            const response = await fetch(
                `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.filePath}`, 
                {
                    headers: {
                        'Authorization': `token ${this.config.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content);
                const data = JSON.parse(content);
                
                // 验证数据格式
                if (!data.categories || !data.sites) {
                    throw new Error('GitHub文件格式不正确');
                }
                
                // 确认是否要覆盖本地数据
                if (confirm('确定要用GitHub上的数据覆盖本地数据吗？')) {
                    // 更新应用数据
                    this.app.data = data;
                    
                    // 保存到本地存储
                    localStorage.setItem('navigationData', JSON.stringify(data));
                    
                    // 重新渲染
                    await this.app.renderApp();
                    
                    this.updateLastSyncTime();
                    this.app.showToast('数据拉取成功！', 'success');
                    this.logSync('数据拉取完成');
                }
                
            } else if (response.status === 404) {
                this.app.showToast('GitHub上的数据文件不存在', 'error');
                this.logSync('数据文件不存在');
            } else {
                throw new Error(`请求失败: ${response.status}`);
            }
            
        } catch (error) {
            console.error('拉取数据失败:', error);
            this.app.showToast(`拉取失败: ${error.message}`, 'error');
            this.logSync(`拉取失败: ${error.message}`);
        } finally {
            this.setProcessing(false);
        }
    }
    
    /**
     * 推送数据到GitHub
     */
    async pushData() {
        if (!this.isConfigured) {
            this.app.showToast('请先配置GitHub信息', 'warning');
            return;
        }
        
        if (!this.app.data) {
            this.app.showToast('没有数据可以推送', 'warning');
            return;
        }
        
        try {
            this.setProcessing(true);
            this.logSync('开始推送数据到GitHub...');
            
            // 准备数据
            const dataToSync = {
                ...this.app.data,
                syncTime: new Date().toISOString(),
                version: this.app.config.version
            };
            
            const content = JSON.stringify(dataToSync, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // 先获取文件信息（如果存在）
            let sha = null;
            try {
                const getResponse = await fetch(
                    `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.filePath}`,
                    {
                        headers: {
                            'Authorization': `token ${this.config.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // 文件可能不存在，忽略错误
            }
            
            // 推送数据
            const pushData = {
                message: `更新导航数据 - ${new Date().toLocaleString()}`,
                content: encodedContent,
                ...(sha && { sha })
            };
            
            const pushResponse = await fetch(
                `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.filePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.config.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pushData)
                }
            );
            
            if (pushResponse.ok) {
                this.updateLastSyncTime();
                this.app.showToast('数据推送成功！', 'success');
                this.logSync('数据推送完成');
            } else {
                const errorData = await pushResponse.json();
                throw new Error(errorData.message || `推送失败: ${pushResponse.status}`);
            }
            
        } catch (error) {
            console.error('推送数据失败:', error);
            this.app.showToast(`推送失败: ${error.message}`, 'error');
            this.logSync(`推送失败: ${error.message}`);
        } finally {
            this.setProcessing(false);
        }
    }
    
    /**
     * 切换自动同步
     */
    toggleAutoSync() {
        if (!this.isConfigured) {
            this.app.showToast('请先配置GitHub信息', 'warning');
            return;
        }
        
        this.config.autoSync = !this.config.autoSync;
        localStorage.setItem('githubConfig', JSON.stringify(this.config));
        
        const button = document.getElementById('autoSyncToggle');
        if (this.config.autoSync) {
            button.textContent = '禁用自动同步';
            button.className = 'btn-warning';
            this.app.showToast('自动同步已启用', 'success');
            this.setupAutoSync();
        } else {
            button.textContent = '启用自动同步';
            button.className = 'btn-warning';
            this.app.showToast('自动同步已禁用', 'info');
            this.clearAutoSync();
        }
        
        this.logSync(`自动同步${this.config.autoSync ? '启用' : '禁用'}`);
    }
    
    /**
     * 设置自动同步
     */
    setupAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
        }
        
        // 每30分钟自动推送一次
        this.autoSyncInterval = setInterval(() => {
            if (this.config && this.config.autoSync) {
                this.pushData();
            }
        }, 30 * 60 * 1000);
    }
    
    /**
     * 清除自动同步
     */
    clearAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
    }
    
    /**
     * 更新最后同步时间
     */
    updateLastSyncTime() {
        const now = Date.now();
        localStorage.setItem('lastSyncTime', now.toString());
        
        if (this.config) {
            this.config.lastSync = now;
            localStorage.setItem('githubConfig', JSON.stringify(this.config));
        }
        
        this.updateStatus();
    }
    
    /**
     * 记录同步日志
     */
    logSync(message) {
        const logContainer = document.getElementById('syncLog');
        if (!logContainer) return;
        
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'sync-log-entry';
        logEntry.innerHTML = `<span class="sync-log-time">${time}</span> ${message}`;
        
        logContainer.appendChild(logEntry);
        
        // 保持最新10条日志
        const entries = logContainer.children;
        if (entries.length > 10) {
            logContainer.removeChild(entries[0]);
        }
        
        // 滚动到底部
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    /**
     * 设置处理状态
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
        
        const buttons = this.modal.querySelectorAll('button');
        const inputs = this.modal.querySelectorAll('input');
        
        buttons.forEach(btn => {
            btn.disabled = isProcessing;
        });
        
        inputs.forEach(input => {
            input.disabled = isProcessing;
        });
    }
    
    /**
     * 检查是否有新的数据更新
     */
    async checkForUpdates() {
        if (!this.isConfigured) return;
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.filePath}`,
                {
                    headers: {
                        'Authorization': `token ${this.config.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const fileData = await response.json();
                const lastModified = new Date(fileData.size).getTime(); // 使用文件大小作为简单的变更检测
                const lastSync = localStorage.getItem('lastSyncTime');
                
                if (!lastSync || parseInt(lastSync) < lastModified) {
                    // 有新的更新
                    this.app.showToast('检测到GitHub上有新数据，建议拉取更新', 'info');
                }
            }
        } catch (error) {
            console.warn('检查更新失败:', error);
        }
    }
}

// 注册到全局
window.GitHubSync = GitHubSync;