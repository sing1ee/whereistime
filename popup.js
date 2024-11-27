async function displayStats() {
  const data = await chrome.storage.local.get('timeStats');
  const timeStats = data.timeStats || {};

  const domains = Object.keys(timeStats);
  const durations = Object.values(timeStats);
  const totalTime = durations.reduce((a, b) => a + b, 0);

  // Convert milliseconds to minutes and calculate percentages
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
}

document.addEventListener('DOMContentLoaded', displayStats);