const stateSelect = document.getElementById("stateSelect");
const totalPopulationElement = document.getElementById("totalPopulation");
const malePopulationElement = document.getElementById("malePopulation");
const femalePopulationElement = document.getElementById("femalePopulation");
const barChartLabelElement = document.getElementById("barChartLabel");
const pieChartLabelElement = document.getElementById("pieChartLabel");

const stateData = {
  california: {
    label: "California",
    total: 39237836,
    male: 19420000,
    female: 19817836
  },
  texas: {
    label: "Texas",
    total: 29527941,
    male: 14680000,
    female: 14847941
  },
  florida: {
    label: "Florida",
    total: 21781128,
    male: 10620000,
    female: 11161128
  },
  "new-york": {
    label: "New York",
    total: 19835913,
    male: 9630000,
    female: 10205913
  },
  pennsylvania: {
    label: "Pennsylvania",
    total: 13002700,
    male: 6450000,
    female: 6552700
  }
};

let barChart;
let pieChart;

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getAllStatesSummary() {
  return Object.values(stateData).reduce(
    (summary, state) => ({
      total: summary.total + state.total,
      male: summary.male + state.male,
      female: summary.female + state.female
    }),
    { total: 0, male: 0, female: 0 }
  );
}

function getSelectedSummary() {
  if (stateSelect.value === "all") {
    return {
      label: "All States",
      ...getAllStatesSummary()
    };
  }

  return stateData[stateSelect.value];
}

function updateStats(summary) {
  totalPopulationElement.textContent = formatNumber(summary.total);
  malePopulationElement.textContent = formatNumber(summary.male);
  femalePopulationElement.textContent = formatNumber(summary.female);
}

function buildBarDataset() {
  if (stateSelect.value === "all") {
    return {
      labels: Object.values(stateData).map((state) => state.label),
      values: Object.values(stateData).map((state) => state.total)
    };
  }

  const selected = stateData[stateSelect.value];
  return {
    labels: ["Male", "Female"],
    values: [selected.male, selected.female]
  };
}

function renderCharts(summary) {
  const barDataset = buildBarDataset();

  if (barChart) {
    barChart.destroy();
  }
  if (pieChart) {
    pieChart.destroy();
  }

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: barDataset.labels,
      datasets: [
        {
          label: stateSelect.value === "all" ? "Total Population" : `${summary.label} Population`,
          data: barDataset.values,
          backgroundColor: ["#0f766e", "#2563eb", "#db2777", "#f59e0b", "#7c3aed"],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            callback: (value) => `${value / 1000000}M`
          }
        }
      }
    }
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [summary.male, summary.female],
          backgroundColor: ["#2563eb", "#db2777"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function updateDashboard() {
  const summary = getSelectedSummary();
  updateStats(summary);
  barChartLabelElement.textContent = stateSelect.value === "all" ? "All tracked states" : summary.label;
  pieChartLabelElement.textContent = summary.label;
  renderCharts(summary);
}

stateSelect.addEventListener("change", updateDashboard);
updateDashboard();
