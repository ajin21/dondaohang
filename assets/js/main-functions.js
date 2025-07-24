/**
 * 主要功能JavaScript文件
 * 包含回到顶部、联系弹窗等功能
 */

$(document).ready(function() {
    // 回到顶部功能
    var backToTop = $('#back-to-top');
    
    // 初始隐藏回到顶部按钮
    backToTop.hide();
    
    // 监听滚动事件
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            backToTop.fadeIn();
        } else {
            backToTop.fadeOut();
        }
    });
    
    // 点击回到顶部
    backToTop.click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 600);
        return false;
    });
    
    // 联系弹窗功能
    $('#contact-btn').click(function() {
        showContactModal();
    });
});

// 显示联系弹窗
function showContactModal() {
    // 创建弹窗HTML
    var modalHtml = `
        <div class="contact-modal" id="contactModal">
            <div class="contact-modal-content">
                <span class="contact-close" onclick="closeContactModal()">&times;</span>
                <div class="contact-title">与我联系</div>
                <div class="contact-info" id="contactInfo">QQ: 3197237971</div>
                <button class="copy-button" onclick="copyContact()">复制QQ号</button>
                <div class="copy-success" id="copySuccess">✓ 已复制到剪贴板</div>
                <div class="contact-note">有好的网站推荐或问题反馈，欢迎联系我！</div>
            </div>
        </div>
    `;
    
    // 如果弹窗不存在，则创建
    if (!document.getElementById('contactModal')) {
        $('body').append(modalHtml);
    }
    
    // 显示弹窗
    $('#contactModal').css('display', 'flex');
    
    // 点击背景关闭弹窗
    $('#contactModal').click(function(e) {
        if (e.target === this) {
            closeContactModal();
        }
    });
}

// 关闭联系弹窗
function closeContactModal() {
    $('#contactModal').fadeOut();
}

// 复制联系方式
function copyContact() {
    var contactText = "3197237971";
    
    // 创建临时文本区域
    var tempTextArea = document.createElement('textarea');
    tempTextArea.value = contactText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    try {
        document.execCommand('copy');
        $('#copySuccess').show().delay(2000).fadeOut();
    } catch (err) {
        console.error('复制失败:', err);
    }
    
    document.body.removeChild(tempTextArea);
}

// 关闭公告
function closeAnnouncement() {
    const container = document.getElementById('announcementContainer');
    if (container) {
        container.style.animation = 'announcementSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }
}