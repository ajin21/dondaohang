/**
 * 导航项点击激活效果 - 悬停状态同步
 */

document.addEventListener('DOMContentLoaded', function() {
    let activeElement = null;
    
    // 清除激活状态
    function clearActive() {
        if (activeElement) {
            activeElement.classList.remove('active');
            activeElement = null;
        }
    }
    
    // 设置激活状态
    function setActive(element) {
        clearActive();
        if (element) {
            element.classList.add('active');
            activeElement = element;
        }
    }
    
    // 使用事件委托监听所有.box2元素的点击
    document.addEventListener('click', function(e) {
        const box2Element = e.target.closest('.box2');
        if (box2Element) {
            setActive(box2Element);
        }
    });
    
    // 原有的nav-item功能保持不变
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(navItem) {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});