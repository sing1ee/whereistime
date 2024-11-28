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
  new Chart(ctx, {
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
});