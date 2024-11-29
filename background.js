// 存储每个标签页的开始时间和URL
let tabStates = {};
let activeTabId = null;

// 环境变量控制
const IS_DEV = false;

function logDebug(message, data = null) {
    if (!IS_DEV) return; // 在生产环境中不输出日志
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data ? data : '');
}

// 保存时间到存储
function saveTimeToStorage(url, duration) {
    if (!url) return;
    
    try {
        const domain = new URL(url).hostname;
        const data = chrome.storage.local.get('timeStats', function(result) {
            const timeStats = result.timeStats || {};
            
            if (!timeStats[domain]) {
                timeStats[domain] = 0;
            }
            timeStats[domain] += duration;
            
            if (IS_DEV) {
                logDebug(`保存时间统计 - 域名: ${domain}, 时长: ${duration}ms, 总计: ${timeStats[domain]}ms`);
            }
            
            chrome.storage.local.set({ timeStats });
        });
    } catch (error) {
        if (IS_DEV) {
            console.error('保存时间时出错:', error);
        }
    }
}

// 记录结束时间并保存
function recordEndTime(tabId) {
    const state = tabStates[tabId];
    if (state && tabId === activeTabId) {  // 只记录活跃标签页的时间
        const duration = Date.now() - state.startTime;
        if (IS_DEV) {
            logDebug(`记录结束时间 - TabID: ${tabId}, URL: ${state.url}, 持续时间: ${duration}ms`);
        }
        saveTimeToStorage(state.url, duration);
        delete tabStates[tabId];
    } else {
        if (IS_DEV) {
            logDebug(`跳过记录结束时间 - TabID: ${tabId}, 活跃TabID: ${activeTabId}`, state);
        }
    }
}

// 记录开始时间
function recordStartTime(tabId, url) {
    if (!url) return;
    
    tabStates[tabId] = {
        url: url,
        startTime: Date.now()
    };
    if (IS_DEV) {
        logDebug(`记录开始时间 - TabID: ${tabId}, URL: ${url}`);
    }
}

// 初始化：获取当前活跃标签页
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
        const tab = tabs[0];
        activeTabId = tab.id;
        recordStartTime(tab.id, tab.url);
        if (IS_DEV) {
            logDebug(`初始化 - 设置活跃标签页 - TabID: ${tab.id}, URL: ${tab.url}`);
        }
    }
});

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
    const tabId = activeInfo.tabId;
    if (IS_DEV) {
        logDebug(`标签页激活 - 新TabID: ${tabId}, 旧TabID: ${activeTabId}`);
    }
    
    // 记录之前活跃标签页的结束时间
    if (activeTabId !== null) {
        if (IS_DEV) {
            logDebug(`处理前一个标签页 - TabID: ${activeTabId}`);
        }
        recordEndTime(activeTabId);
    }
    
    // 更新活跃标签页ID
    activeTabId = tabId;
    
    // 获取新激活的标签页信息
    chrome.tabs.get(tabId, (tab) => {
        if (tab.url) {
            if (IS_DEV) {
                logDebug(`新标签页信息 - URL: ${tab.url}`);
            }
            recordStartTime(tabId, tab.url);
        }
    });
});

// 监听URL更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 只处理URL变化且是活跃标签页的情况
    if (changeInfo.url && tabId === activeTabId) {
        if (IS_DEV) {
            logDebug(`URL更新 - TabID: ${tabId}, 新URL: ${changeInfo.url}`);
        }
        
        // 记录旧URL的结束时间
        recordEndTime(tabId);
        // 记录新URL的开始时间
        recordStartTime(tabId, changeInfo.url);
    } else if (changeInfo.url) {
        if (IS_DEV) {
            logDebug(`忽略非活跃标签页的URL更新 - TabID: ${tabId}, URL: ${changeInfo.url}`);
        }
    }
});

// 监听标签页关闭
chrome.tabs.onRemoved.addListener((tabId) => {
    if (IS_DEV) {
        logDebug(`标签页关闭 - TabID: ${tabId}, 活跃TabID: ${activeTabId}`);
    }
    if (tabId === activeTabId) {
        recordEndTime(tabId);
        activeTabId = null;
        if (IS_DEV) {
            logDebug('清除活跃标签页ID');
        }
    }
});

// 监听窗口焦点变化
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (IS_DEV) {
        logDebug(`窗口焦点变化 - WindowID: ${windowId}, 活跃TabID: ${activeTabId}`);
    }
    
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // 当窗口失去焦点时，记录活跃标签页的结束时间
        if (activeTabId !== null) {
            if (IS_DEV) {
                logDebug('窗口失去焦点，记录活跃标签页时间');
            }
            recordEndTime(activeTabId);
            activeTabId = null;
        }
    } else {
        // 当窗口获得焦点时，记录当前活跃标签页的开始时间
        chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
            if (tabs.length > 0 && tabs[0].url) {
                activeTabId = tabs[0].id;
                if (IS_DEV) {
                    logDebug(`窗口获得焦点，设置新活跃标签页 - TabID: ${activeTabId}, URL: ${tabs[0].url}`);
                }
                recordStartTime(activeTabId, tabs[0].url);
            }
        });
    }
});