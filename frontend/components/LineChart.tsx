"use client";
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartDataset } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CsvData {
  id: number;
  csvFileId: number;
  date: string;
  time: string;
  priceFcst: number;
  actualPrice: number;
}

interface ApiResponse {
  [key: string]: CsvData[];
}

interface LineChartProps {
  data: ApiResponse;
  selectedFiles: string[];
}

type DatasetType = ChartDataset<'line', number[]> & {
  borderDash?: number[];
};

const LineChart: React.FC<LineChartProps> = ({ data, selectedFiles }) => {
  const chartData = React.useMemo(() => {
    if (selectedFiles.length === 0) {
      return { labels: [], datasets: [] };
    }

    let datePriceMap: { [date: string]: { [source: string]: number[] } } = {};

    Object.entries(data).forEach(([source, entries]) => {
      if (selectedFiles.includes(source)) {
        entries.forEach(entry => {
          const date = dayjs(entry.date, 'YYYYMMDD').format('DD-MM-YY');
          if (!datePriceMap[date]) {
            datePriceMap[date] = {};
          }
          if (!datePriceMap[date][source]) {
            datePriceMap[date][source] = [];
          }
          datePriceMap[date][source].push(entry.priceFcst);
        });
      }
    });

    const labels = Object.keys(datePriceMap).sort((a, b) => dayjs(a, 'DD-MM-YY').unix() - dayjs(b, 'DD-MM-YY').unix());

    const colors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)'
    ];

    const datasets: DatasetType[] = selectedFiles.map((source, index) => {
      const data = labels.map(date => {
        const prices = datePriceMap[date][source];
        const avgPrice = prices ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        return avgPrice;
      });

      return {
        label: source,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        fill: false,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    });

 
    const actualPriceData = labels.map(date => {
      const entries = Object.values(data)[0];
      const entry = entries.find(e => dayjs(e.date, 'YYYYMMDD').format('DD-MM-YY') === date);
      return entry ? entry.actualPrice : null;
    });

    datasets.push({
      label: 'Actual Price',
      data: actualPriceData.map(price => price ?? 0), 
      borderColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      fill: false,
      tension: 0,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      borderDash: [5, 5],
    });

    return {
      labels,
      datasets,
    };
  }, [data, selectedFiles]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Forecast and Actual Price Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold',
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
          font: {
            weight: 'bold',
          },
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (selectedFiles.length === 0) {
    return <div>Please select at least one Model to display data.</div>;
  }

  return <Line data={chartData} options={options} />;
};

export default LineChart;