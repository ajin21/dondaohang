/**
 * UI管理器模块
 * 处理模态框、交互逻辑和用户界面管理
 */

class UIManager {
    constructor(app) {
        this.app = app;
        this.modals = new Map();
        this.activeModal = null;
        
        this.init();
    }
    
    init() {
        this.initModals();
        this.bindEvents();
    }
    
    /**
     * 初始化模态框
     */
    initModals() {
        // 注册所有模态框
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modal => {
            this.modals.set(modal.id, modal);
        });
        
        console.log('📱 UI管理器初始化完成，注册了', this.modals.size, '个模态框');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听应用事件
        this.app.events.addEventListener('openContactModal', () => {
            this.openModal('contactModal');
        });
        
        // 全局模态框关闭事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
        
        // 点击模态框外部关闭
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });
        
        // 联系模态框特殊处理
        this.initContactModal();
        
        // 处理外部点击隐藏搜索建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.app.elements.searchSuggestions.style.display = 'none';
            }
        });
        
        // 处理复制功能
        this.initCopyButtons();
    }
    
    /**
     * 初始化联系模态框
     */
    initContactModal() {
        const closeBtn = document.getElementById('closeContactModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal('contactModal');
            });
        }
    }
    
    /**
     * 初始化复制按钮
     */
    initCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const textToCopy = e.target.dataset.copy;
                this.copyToClipboard(textToCopy);
            }
        });
    }
    
    /**
     * 打开模态框
     */
    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.error('模态框不存在:', modalId);
            return;
        }
        
        // 关闭当前活动的模态框
        if (this.activeModal && this.activeModal !== modal) {
            this.closeModal();
        }
        
        // 打开新模态框
        modal.classList.add('active');
        this.activeModal = modal;
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 聚焦第一个可聚焦元素
        setTimeout(() => {
            const focusable = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
            }
        }, 100);
    }
    
    /**
     * 关闭模态框
     */
    closeModal(modalId = null) {
        let modalToClose;
        
        if (modalId) {
            modalToClose = this.modals.get(modalId);
        } else {
            modalToClose = this.activeModal;
        }
        
        if (modalToClose) {
            modalToClose.classList.remove('active');
            
            if (modalToClose === this.activeModal) {
                this.activeModal = null;
                // 恢复背景滚动
                document.body.style.overflow = '';
            }
        }
    }
    
    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                } catch (err) {
                    throw new Error('复制失败');
                }
                
                document.body.removeChild(textArea);
            }
            
            this.app.showToast('复制成功！', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.app.showToast('复制失败，请手动复制', 'error');
        }
    }
    
    /**
     * 显示确认对话框
     */
    showConfirm(message, title = '确认') {
        return new Promise((resolve) => {
            const confirmed = confirm(`${title}\n\n${message}`);
            resolve(confirmed);
        });
    }
    
    /**
     * 显示输入对话框
     */
    showPrompt(message, defaultValue = '', title = '输入') {
        return new Promise((resolve) => {
            const result = prompt(`${title}\n\n${message}`, defaultValue);
            resolve(result);
        });
    }
    
    /**
     * 创建动态模态框
     */
    createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        
        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" data-close-modal="${id}">
                        <i class="icon-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        const closeBtn = modal.querySelector(`[data-close-modal="${id}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.destroyModal(id);
            });
        }
        
        // 注册模态框
        this.modals.set(id, modal);
        
        return modal;
    }
    
    /**
     * 销毁动态模态框
     */
    destroyModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            this.closeModal(modalId);
            
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                this.modals.delete(modalId);
            }, 300);
        }
    }
    
    /**
     * 显示加载指示器
     */
    showLoading(message = '加载中...', target = null) {
        const loadingId = 'loading-' + Date.now();
        const loadingHtml = `
            <div class="loading-indicator" id="${loadingId}">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        if (target) {
            target.insertAdjacentHTML('beforeend', loadingHtml);
        } else {
            document.body.insertAdjacentHTML('beforeend', loadingHtml);
        }
        
        return loadingId;
    }
    
    /**
     * 隐藏加载指示器
     */
    hideLoading(loadingId) {
        const loading = document.getElementById(loadingId);
        if (loading) {
            loading.remove();
        }
    }
    
    /**
     * 显示进度条
     */
    showProgress(current, total, message = '') {
        let progressBar = document.getElementById('global-progress');
        
        if (!progressBar) {
            const progressHtml = `
                <div id="global-progress" class="progress-overlay">
                    <div class="progress-container">
                        <div class="progress-message">${message}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">0%</div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', progressHtml);
            progressBar = document.getElementById('global-progress');
        }
        
        const percentage = Math.round((current / total) * 100);
        const fill = progressBar.querySelector('.progress-fill');
        const text = progressBar.querySelector('.progress-text');
        const messageEl = progressBar.querySelector('.progress-message');
        
        if (fill) fill.style.width = percentage + '%';
        if (text) text.textContent = percentage + '%';
        if (messageEl && message) messageEl.textContent = message;
        
        progressBar.style.display = 'flex';
        
        if (percentage >= 100) {
            setTimeout(() => {
                this.hideProgress();
            }, 500);
        }
    }
    
    /**
     * 隐藏进度条
     */
    hideProgress() {
        const progressBar = document.getElementById('global-progress');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }
    
    /**
     * 高亮元素
     */
    highlightElement(element, duration = 2000) {
        element.classList.add('highlighted');
        
        setTimeout(() => {
            element.classList.remove('highlighted');
        }, duration);
    }
    
    /**
     * 平滑滚动到元素
     */
    scrollToElement(element, offset = 0) {
        const elementTop = element.offsetTop - offset;
        
        window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
        });
    }
    
    /**
     * 获取视口信息
     */
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollTop: window.pageYOffset || document.documentElement.scrollTop,
            scrollLeft: window.pageXOffset || document.documentElement.scrollLeft
        };
    }
    
    /**
     * 检查元素是否在视口中
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const viewport = this.getViewportInfo();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= viewport.height &&
            rect.right <= viewport.width
        );
    }
    
    /**
     * 节流函数
     */
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * 防抖函数
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
    
    /**
     * 添加CSS样式
     */
    addStyles(styles) {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    /**
     * 获取CSS自定义属性值
     */
    getCSSVariable(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim();
    }
    
    /**
     * 设置CSS自定义属性值
     */
    setCSSVariable(name, value) {
        document.documentElement.style.setProperty(name, value);
    }
    
    /**
     * 检查暗色模式
     */
    isDarkMode() {
        return window.matchMedia && 
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    /**
     * 监听暗色模式变化
     */
    watchDarkMode(callback) {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener(callback);
            return mediaQuery;
        }
        return null;
    }
}

// 注册到全局
window.UIManager = UIManager;