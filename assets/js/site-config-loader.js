/**
 * 统一配置加载器
 * 加载公告和广告配置
 */

class SiteConfigLoader {
    constructor() {
        this.config = null;
        this.configPath = 'assets/config/site-config.json';
    }

    async loadConfig() {
        try {
            const response = await fetch(this.configPath + '?t=' + Date.now());
            this.config = await response.json();
            return this.config;
        } catch (error) {
            return null;
        }
    }

    // 渲染广告
    renderAds() {
        const container = document.getElementById('ad-banner');
        if (!container || !this.config || !this.config.ads) return;

        const enabledAds = this.config.ads.filter(ad => ad.enabled);
        if (enabledAds.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = enabledAds.map(ad => `
            <a href="${ad.url}" target="_blank" style="
                display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
                background: rgba(255,255,255,0.9); border: 1px solid rgba(${ad.color},0.15);
                border-radius: 20px; text-decoration: none; color: #475569;
                font-size: 13px; font-weight: 500; transition: all 0.25s ease; backdrop-filter: blur(8px);
            " onmouseover="this.style.background='rgba(${ad.color},0.08)';this.style.borderColor='rgba(${ad.color},0.3)';this.style.color='rgb(${ad.color})'"
               onmouseout="this.style.background='rgba(255,255,255,0.9)';this.style.borderColor='rgba(${ad.color},0.15)';this.style.color='#475569'">
                <span style="font-size:14px">${ad.icon}</span><span>${ad.text}</span>
            </a>
        `).join('');
    }

    // 渲染公告
    renderAnnouncements() {
        const textElement = document.querySelector('.announcement-text');
        const containerWrapper = document.getElementById('announcementContainer');

        if (!textElement || !containerWrapper || !this.config || !this.config.announcements) return;

        const enabledAnnouncements = this.config.announcements.filter(a => a.enabled);
        if (enabledAnnouncements.length === 0) {
            containerWrapper.style.display = 'none';
            return;
        }

        // 设置过渡效果
        textElement.style.transition = 'opacity 0.2s ease';

        // 显示第一条公告
        let currentIndex = 0;
        const showAnnouncement = (index) => {
            textElement.innerHTML = enabledAnnouncements[index].text;
        };

        showAnnouncement(0);
        containerWrapper.style.display = 'block';

        // 如果有多条公告，循环显示
        if (enabledAnnouncements.length > 1) {
            setInterval(() => {
                currentIndex = (currentIndex + 1) % enabledAnnouncements.length;
                textElement.style.opacity = '0';
                setTimeout(() => {
                    showAnnouncement(currentIndex);
                    requestAnimationFrame(() => {
                        textElement.style.opacity = '1';
                    });
                }, 200);
            }, 8000);
        }
    }

    // 初始化
    async init() {
        await this.loadConfig();
        if (this.config) {
            this.renderAds();
            this.renderAnnouncements();
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.siteConfig = new SiteConfigLoader();
        window.siteConfig.init();
    }, 100);
});
