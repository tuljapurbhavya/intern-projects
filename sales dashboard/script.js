const darkModeToggle = document.getElementById("darkModeToggle");
const navItems = document.querySelectorAll(".nav-item");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const salesData = [8200, 9600, 10150, 10800, 12400, 11750, 13500, 14900, 14200, 15650, 16800, 18750];
const revenueData = [11500, 13200, 14800, 15100, 17100, 16600, 18450, 20500, 19800, 21900, 23100, 25500];
const categoryLabels = ["Electronics", "Apparel", "Home", "Beauty", "Sports"];
const categoryValues = [38, 24, 18, 12, 8];

let salesChart;
let pieChart;

function getThemeColors() {
  const styles = getComputedStyle(document.body);
  return {
    text: styles.getPropertyValue("--text").trim(),
    muted: styles.getPropertyValue("--muted").trim(),
    line: styles.getPropertyValue("--line").trim(),
    accent: styles.getPropertyValue("--accent").trim(),
    accentTwo: styles.getPropertyValue("--accent-2").trim(),
    warning: styles.getPropertyValue("--warning").trim(),
    danger: styles.getPropertyValue("--danger").trim()
  };
}

function buildCharts() {
  const colors = getThemeColors();

  if (salesChart) {
    salesChart.destroy();
  }
  if (pieChart) {
    pieChart.destroy();
  }

  salesChart = new Chart(document.getElementById("salesChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Sales",
          data: salesData,
          borderColor: colors.accent,
          backgroundColor: "rgba(15, 118, 110, 0.14)",
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: "Revenue",
          data: revenueData,
          borderColor: colors.accentTwo,
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.muted,
            boxWidth: 12,
            usePointStyle: true
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: colors.muted
          },
          grid: {
            color: colors.line
          }
        },
        y: {
          ticks: {
            color: colors.muted,
            callback: (value) => `$${value / 1000}k`
          },
          grid: {
            color: colors.line
          }
        }
      }
    }
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: [
            colors.accent,
            colors.accentTwo,
            colors.warning,
            colors.danger,
            "#7c3aed"
          ],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: colors.muted,
            boxWidth: 12,
            usePointStyle: true
          }
        }
      }
    }
  });
}

darkModeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  darkModeToggle.setAttribute("aria-pressed", String(isDark));
  buildCharts();
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
  });
});

buildCharts();
