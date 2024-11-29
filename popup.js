function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}${chrome.i18n.getMessage("hours")}`);
  if (minutes > 0) parts.push(`${minutes}${chrome.i18n.getMessage("minutes")}`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}${chrome.i18n.getMessage("seconds")}`);

  return parts.join(' ');
}

async function resetStats() {
  if (confirm(chrome.i18n.getMessage("resetConfirm"))) {
    await chrome.storage.local.set({ timeStats: {} });
    displayStats();
  }
}

let myChart; // 声明全局变量存储图表实例

function downloadChart(format) {
  const canvas = document.getElementById('chart-container');
  const link = document.createElement('a');
  
  // 设置正确的MIME类型
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  
  // 获取图像数据
  const imageData = canvas.toDataURL(mimeType);
  
  // 设置下载链接
  link.download = `${chrome.i18n.getMessage("downloadFileName")}.${format}`;
  link.href = imageData;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function displayStats() {
  const data = await chrome.storage.local.get('timeStats');
  const timeStats = data.timeStats || {};

  // 准备数据并排序
  const sortedEntries = Object.entries(timeStats)
    .sort(([, a], [, b]) => b - a);

  // 分离前10个网站和其他网站
  const top10Entries = sortedEntries.slice(0, 10);
  const otherEntries = sortedEntries.slice(10);

  // 计算"其他"类别的总时间
  const otherTotalTime = otherEntries.reduce((sum, [, duration]) => sum + duration, 0);

  // 准备最终的数据数组
  let finalDomains = top10Entries.map(([domain]) => domain);
  let finalDurations = top10Entries.map(([, duration]) => duration);

  // 如果有其他网站，添加"其他"类别
  if (otherTotalTime > 0) {
    finalDomains.push(chrome.i18n.getMessage("others") || "Others");
    finalDurations.push(otherTotalTime);
  }

  const totalTime = finalDurations.reduce((a, b) => a + b, 0);

  // 计算百分比并创建标签
  const percentages = finalDurations.map(d => ((d / totalTime) * 100).toFixed(1));
  const labels = finalDomains.map((domain, i) => 
    `${domain} (${percentages[i]}%)`
  );

  const ctx = document.getElementById('chart-container').getContext('2d');
  
  // 如果已存在图表实例，先销毁它
  if (myChart) {
    myChart.destroy();
  }

  // 创建颜色数组
  const colors = [
    '#FF6384', // 红色
    '#36A2EB', // 蓝色
    '#FFCE56', // 黄色
    '#4BC0C0', // 青色
    '#9966FF', // 紫色
    '#FF9F40', // 橙色
    '#7FD2FF', // 浅蓝
    '#FFB6C1', // 浅粉
    '#98FB98', // 浅绿
    '#DDA0DD', // 浅紫
    '#808080'  // 灰色（用于"其他"类别）
  ];
  
  // 创建新的图表实例并保存到全局变量
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: finalDurations,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            // 限制标签文本长度
            formatter: function(value, context) {
              let label = context.label || '';
              if (label.length > 30) {
                label = label.substring(0, 27) + '...';
              }
              return label;
            }
          }
        },
        title: {
          display: true,
          text: chrome.i18n.getMessage("chartTitle")
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const domain = finalDomains[context.dataIndex];
              const duration = finalDurations[context.dataIndex];
              return `${domain}: ${formatTime(duration)}`;
            }
          }
        }
      }
    }
  });

  // 更新时间列表
  const timeList = document.getElementById('time-list');
  timeList.innerHTML = '';
  
  // 只显示前10个网站的详细列表
  top10Entries.forEach(([domain, duration]) => {
    const li = document.createElement('li');
    li.textContent = `${domain}: ${formatTime(duration)}`;
    timeList.appendChild(li);
  });

  // 如果有其他网站，添加一个"其他"条目
  if (otherTotalTime > 0) {
    const li = document.createElement('li');
    li.textContent = `${chrome.i18n.getMessage("others") || "Others"}: ${formatTime(otherTotalTime)}`;
    timeList.appendChild(li);
  }
}

// 初始化国际化文本
function initializeI18n() {
  // 替换标题
  document.title = chrome.i18n.getMessage("extName");
  
  // 替换按钮文本
  document.getElementById('download-png').textContent = chrome.i18n.getMessage("saveAsPNG");
  document.getElementById('download-jpeg').textContent = chrome.i18n.getMessage("saveAsJPEG");
  document.getElementById('reset-btn').textContent = chrome.i18n.getMessage("resetButton");
  
  // 替换其他文本元素
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const messageName = element.getAttribute('data-i18n');
    element.textContent = chrome.i18n.getMessage(messageName);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 初始化国际化文本
  initializeI18n();
  
  displayStats();
  document.getElementById('reset-btn').addEventListener('click', resetStats);
  document.getElementById('download-png').addEventListener('click', () => downloadChart('png'));
  document.getElementById('download-jpeg').addEventListener('click', () => downloadChart('jpeg'));
});