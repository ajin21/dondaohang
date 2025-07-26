/**
 * 主要功能JavaScript文件
 * 包含回到顶部、联系弹窗等功能
 */

$(document).ready(function() {
    // 回到顶部功能 - 现代化实现
    var backToTop = $('#back-to-top');
    var isScrolling = false;
    
    // 调试：强制显示按钮
    console.log('Back to top button found:', backToTop.length);
    backToTop.addClass('show');
    backToTop.css({
        'opacity': '1',
        'visibility': 'visible',
        'transform': 'translateY(0) scale(1)',
        'z-index': '99999',
        'position': 'fixed',
        'bottom': '20px',
        'right': '20px'
    });
    
    // 初始隐藏回到顶部按钮（暂时注释掉）
    // backToTop.removeClass('show');
    
    // 优化的滚动监听 - 使用节流
    function handleScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                const scrollTop = $(window).scrollTop();
                
                if (scrollTop > 300) {
                    backToTop.addClass('show');
                } else {
                    backToTop.removeClass('show');
                }
                
                isScrolling = false;
            });
            isScrolling = true;
        }
    }
    
    // 监听滚动事件
    $(window).on('scroll', handleScroll);
    
    // 点击回到顶部 - 增强动效
    backToTop.on('click touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Back to top button clicked!');
        
        // 添加点击反馈
        $(this).addClass('clicking');
        setTimeout(() => {
            $(this).removeClass('clicking');
        }, 150);
        
        // 平滑滚动到顶部
        $('html, body').animate({
            scrollTop: 0
        }, {
            duration: 800,
            easing: 'swing', // 使用更兼容的easing
            complete: function() {
                console.log('Scroll to top completed');
                // 滚动完成后的回调（暂时不隐藏按钮）
                // backToTop.removeClass('show');
            }
        });
        
        return false;
    });
    
    // 添加触摸事件处理
    backToTop.on('touchstart', function(e) {
        console.log('Touch start on back to top button');
        $(this).addClass('touching');
    });
    
    backToTop.on('touchend', function(e) {
        console.log('Touch end on back to top button');
        $(this).removeClass('touching');
    });
    
    // 联系弹窗功能
    $('#contact-btn').click(function() {
        showContactModal();
    });
    
    // 顶部联系按钮
    $('#contact-btn-top').click(function() {
        showContactModal();
    });
    
    // 移动端联系按钮
    $('#mobile-contact-btn').click(function() {
        showContactModal();
    });
    
    // 检查增强版按钮是否已加载
    setTimeout(() => {
        if (window.EnhancedBackToTop) {
            console.log('✅ Enhanced Back to Top loaded successfully');
            // 如果增强版已加载，禁用基础版本的滚动监听
            $(window).off('scroll', handleScroll);
        } else {
            console.warn('⚠️ Enhanced Back to Top not loaded, using fallback');
        }
    }, 1000);
    
    // 额外的调试信息
    setTimeout(() => {
        console.log('Button visibility check:', {
            exists: $('#back-to-top').length > 0,
            visible: $('#back-to-top').is(':visible'),
            opacity: $('#back-to-top').css('opacity'),
            zIndex: $('#back-to-top').css('z-index'),
            position: $('#back-to-top').css('position')
        });
    }, 2000);
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