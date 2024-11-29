function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}秒`);

  return parts.join(' ');
}

async function resetStats() {
  if (confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
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
  link.download = `browsing-stats.${format}`;
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
          text: 'Website Time Distribution'
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

document.addEventListener('DOMContentLoaded', () => {
  displayStats();
  document.getElementById('reset-btn').addEventListener('click', resetStats);
  document.getElementById('download-png').addEventListener('click', () => downloadChart('png'));
  document.getElementById('download-jpeg').addEventListener('click', () => downloadChart('jpeg'));
});