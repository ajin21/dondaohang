/**
 * 简化公告系统
 * Simple Announcement System
 */

class AnnouncementSystem {
    constructor() {
        this.announcements = [];
        this.currentIndex = 0;
        this.timer = null;
        this.container = null;

        this.init();
    }

    async init() {
        try {
            await this.loadAnnouncements();
            this.startAnnouncements();
        } catch (error) {
            console.warn('公告系统初始化失败:', error);
        }
    }

    async loadAnnouncements() {
        // ========================================
        // 🎯 公告内容配置区域 - 可直接修改以下内容
        // ========================================
        this.announcements = [
            '有好的网站推荐？<a href="https://wj.qq.com/s2/17304152/bbfb/" target="_blank">点击提交网站</a> 告诉我们 📝',
            
        ];
        // ========================================
        // 🎯 公告内容配置区域结束
        // ========================================

        console.log('公告数据加载成功:', this.announcements);
    }

    startAnnouncements() {
        this.container = document.getElementById('announcementMessage');
        this.containerWrapper = document.getElementById('announcementContainer');

        console.log('公告容器查找结果:', {
            container: this.container,
            containerWrapper: this.containerWrapper,
            announcementsLength: this.announcements.length
        });

        if (!this.container || !this.containerWrapper || this.announcements.length === 0) {
            console.warn('公告系统启动失败: 缺少必要元素');
            return;
        }

        // 临时清除关闭状态，确保公告能显示（调试用）
        localStorage.removeItem('announcementClosed');

        // 强制显示容器
        this.containerWrapper.style.display = 'block';
        this.containerWrapper.style.visibility = 'visible';
        this.containerWrapper.style.opacity = '1';

        console.log('强制显示公告容器');
        this.showAnnouncement(0);
    }

    showAnnouncement(index) {
        if (!this.container || !this.containerWrapper || !this.announcements[index]) return;

        const message = this.announcements[index];
        const textElement = this.container.querySelector('.announcement-text');

        if (!textElement) return;

        // 更新内容
        textElement.innerHTML = message;

        // 显示公告容器
        this.containerWrapper.style.display = 'block';
        this.container.style.display = 'block';
        this.currentIndex = index;

        // 添加滑入动画类
        this.container.classList.remove('announcement-hiding');
        this.container.style.animation = 'announcementSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        // 设置下一个公告的定时器（10秒）
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.nextAnnouncement();
        }, 10000);

        // 绑定链接点击事件
        this.bindLinkEvents();
    }

    adjustAnnouncementWidth(message) {
        if (!this.container) return;

        // 创建临时元素测量文本宽度
        const tempElement = document.createElement('div');
        tempElement.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 1px;
            padding: 14px 45px 14px 18px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: rgba(54, 111, 255, 0.08);
            border: 1px solid rgba(54, 111, 255, 0.16);
            border-radius: 10px;
        `;
        tempElement.innerHTML = `<i class="fa fa-info-circle" style="margin-right: 8px; color: #366fff; font-size: 14px;"></i>${message}`;
        document.body.appendChild(tempElement);

        const textWidth = tempElement.offsetWidth;
        document.body.removeChild(tempElement);

        // 设置最小和最大宽度，考虑居中显示
        const containerMargin = 40; // 左右各20px
        const minWidth = 250;
        const maxWidth = Math.min(window.innerWidth - containerMargin - 40, 700);
        const finalWidth = Math.max(minWidth, Math.min(textWidth + 20, maxWidth));

        // 应用宽度，确保居中显示
        this.container.style.width = finalWidth + 'px';
        this.container.style.maxWidth = `calc(100% - ${containerMargin}px)`;
        this.container.style.margin = '0 auto';
        this.container.style.display = 'inline-block';

        console.log(`公告宽度调整: ${finalWidth}px (文本宽度: ${textWidth}px) - 居中显示`);
    }

    nextAnnouncement() {
        if (this.announcements.length === 0) return;

        // 循环到下一个公告
        this.currentIndex = (this.currentIndex + 1) % this.announcements.length;
        console.log(`切换到公告 ${this.currentIndex + 1}/${this.announcements.length}: ${this.announcements[this.currentIndex]}`);
        this.showAnnouncement(this.currentIndex);
    }

    bindLinkEvents() {
        const links = this.container.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    closeAnnouncement() {
        if (!this.container || !this.containerWrapper) return;

        // 添加淡出动画
        this.container.style.animation = 'announcementSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        setTimeout(() => {
            this.containerWrapper.style.display = 'none';
            this.containerWrapper.classList.remove('show');
        }, 400);

        localStorage.setItem('announcementClosed', 'true');
        clearTimeout(this.timer);
    }
}

// 全局关闭函数
function closeAnnouncement() {
    if (window.announcementSystem) {
        window.announcementSystem.closeAnnouncement();
    }
}

// 初始化公告系统
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        window.announcementSystem = new AnnouncementSystem();
        console.log('公告系统已初始化');
    }, 500);
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnnouncementSystem;
} else if (typeof window !== 'undefined') {
    window.AnnouncementSystem = AnnouncementSystem;
}