// 初始化文件夹树
async function initFolderTree() {
  const folderTree = document.getElementById('folderTree');
  const bookmarks = await chrome.bookmarks.getTree();
  const bookmarkBar = bookmarks[0].children[0]; // 只获取书签栏

  function createFolderItem(node, level = 0) {
    const item = document.createElement('div');
    item.className = 'folder-item';
    item.style.paddingLeft = `${level * 20}px`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = node.id;
    checkbox.addEventListener('change', updateExportButton);

    const label = document.createElement('span');
    label.textContent = node.title;

    item.appendChild(checkbox);
    item.appendChild(label);
    folderTree.appendChild(item);

    // 只展开到第二级目录
    if (node.children && level < 2) {
      for (const child of node.children) {
        if (child.children) { // 只显示文件夹
          createFolderItem(child, level + 1);
        }
      }
    }
  }

  createFolderItem(bookmarkBar);
}

// 更新导出按钮状态
function updateExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  const checkedFolders = document.querySelectorAll('#folderTree input[type="checkbox"]:checked');
  exportBtn.disabled = checkedFolders.length === 0;
}

// 导出书签
document.getElementById('exportBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const checkedFolders = document.querySelectorAll('#folderTree input[type="checkbox"]:checked');
  
  statusDiv.textContent = '正在导出书签...';

  try {
    // 转换数据结构
    const navData = {
      list: [
        {
          title: "最近使用",
          icon: "history",
          nav: []
        }
      ]
    };

    // 递归处理书签
    async function processBookmarks(bookmarkNodes, parentCategory) {
      for (const node of bookmarkNodes) {
        if (node.children) {
          // 如果是文件夹
          const category = {
            title: node.title,
            icon: "folder"
          };
          
          if (node.children.some(child => child.children)) {
            // 如果有子文件夹，使用child数组
            category.child = [];
            await processBookmarks(node.children, category);
          } else {
            // 如果只有书签，使用nav数组
            category.nav = [];
            await processBookmarks(node.children, category);
          }
          
          if (parentCategory) {
            if (parentCategory.child) {
              parentCategory.child.push(category);
            } else {
              navData.list.push(category);
            }
          } else {
            navData.list.push(category);
          }
        } else {
          // 如果是书签
          const bookmark = {
            title: node.title,
            desc: node.title,
            url: node.url,
            image: await getFavicon(node.url) || 'bookmark.svg'
          };

          // 确保父分类有nav数组
          if (!parentCategory || !parentCategory.nav) {
            if (parentCategory) {
              parentCategory.nav = [];
            } else {
              console.warn('Warning: parentCategory is undefined');
              continue;
            }
          }
          parentCategory.nav.push(bookmark);

          // 更新进度提示
          statusDiv.textContent = `正在处理: ${node.title}`;
        }
      }
    }

    // 获取网站favicon的辅助函数
    async function getFavicon(url) {
      try {
        const urlObj = new URL(url);
        return `https://favicon.im/${urlObj.hostname}`;
      } catch {
        return null;
      }
    }

    // 处理所有选中的文件夹
    for (const folder of checkedFolders) {
      const folderData = await chrome.bookmarks.getSubTree(folder.value);
      await processBookmarks(folderData[0].children);
    }

    // 导出为文件
    const dataStr = 'var navData = ' + JSON.stringify(navData, null, 2);
    const blob = new Blob([dataStr], {type: 'text/javascript'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'source.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    statusDiv.textContent = '导出完成！';
  } catch (error) {
    console.error('Error:', error);
    statusDiv.textContent = '导出失败：' + error.message;
  }
});

// 初始化
initFolderTree();