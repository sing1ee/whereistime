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
  
  // 创建一个临时画布来调整大小
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 640;
  tempCanvas.height = 400;
  
  // 获取临时画布的上下文
  const tempCtx = tempCanvas.getContext('2d');
  
  // 在临时画布上绘制调整大小后的图像
  tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 640, 400);
  
  // 设置正确的MIME类型
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  
  // 从临时画布获取调整大小后的图像数据
  const imageData = tempCanvas.toDataURL(mimeType, 1.0);
  
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

  const domains = sortedEntries.map(([domain]) => domain);
  const durations = sortedEntries.map(([, duration]) => duration);
  const totalTime = durations.reduce((a, b) => a + b, 0);

  // 更新饼图
  const percentages = durations.map(d => ((d / totalTime) * 100).toFixed(1));
  const labels = domains.map((domain, i) => 
    `${domain} (${percentages[i]}%)`
  );

  const ctx = document.getElementById('chart-container').getContext('2d');
  
  // 如果已存在图表实例，先销毁它
  if (myChart) {
    myChart.destroy();
  }
  
  // 创建新的图表实例并保存到全局变量
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: durations,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: chrome.i18n.getMessage("chartTitle")
        }
      }
    }
  });

  // 更新时间列表
  const timeList = document.getElementById('time-list');
  timeList.innerHTML = sortedEntries
    .map(([domain, duration]) => `
      <li>
        <strong>${domain}</strong>: ${formatTime(duration)}
      </li>
    `)
    .join('');
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