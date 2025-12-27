// chart.js
function renderChart(summary) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const labels = Object.keys(summary);
  const values = labels.map(k => summary[k]["mean"] || 0);

  // Nice vertical gradient for bars
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(129, 140, 248, 0.9)");  // indigo-400
  gradient.addColorStop(1, "rgba(79, 70, 229, 0.9)");    // indigo-600

  if (window._csvChartInstance) {
    window._csvChartInstance.destroy();
  }

  window._csvChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Mean Values",
        data: values,
        backgroundColor: gradient,
        borderColor: "rgba(49, 46, 129, 1)",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(129, 140, 248, 1)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#111827",
            font: { family: "Poppins", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#e5e7eb",
          bodyColor: "#f9fafb",
          borderColor: "rgba(129, 140, 248, 0.7)",
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#4b5563" },
          grid: { color: "rgba(148, 163, 184, 0.2)" }
        },
        x: {
          ticks: { color: "#4b5563" },
          grid: { display: false }
        }
      }
    }
  });

  return window._csvChartInstance;
}
