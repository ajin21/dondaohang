// 监听扩展安装或更新事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('书签导出工具已安装/更新');
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getBookmarks') {
    chrome.bookmarks.getTree().then(bookmarks => {
      sendResponse({ success: true, bookmarks });
    });
    return true; // 保持消息通道开启以支持异步响应
  }
});