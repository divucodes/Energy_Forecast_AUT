

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

interface StatisticsResult {
  NOBS: number;
  MAPE: string;
  RMSE: string;
  PEAK_FORECAST: string;
  PEAK_ACTUAL: string;
  AVERAGE_FORECAST: string;
  AVERAGE_ACTUAL: string;
  ENERGY_FORECAST: string;
  ENERGY_ACTUAL: string;
}

const calculateStatistics = (data: ApiResponse, selectedFiles: string[]): StatisticsResult => {
  const filteredData = selectedFiles.flatMap(file => data[file] || []);
  
  if (filteredData.length === 0) {
    return {
      NOBS: 0,
      MAPE: '0.00',
      RMSE: '0.00',
      PEAK_FORECAST: '0.00',
      PEAK_ACTUAL: '0.00',
      AVERAGE_FORECAST: '0.00',
      AVERAGE_ACTUAL: '0.00',
      ENERGY_FORECAST: '0.00',
      ENERGY_ACTUAL: '0.00',
    };
  }

  let NOBS = 0;
  let sumForecast = 0;
  let sumActual = 0;
  let sumAbsPercentError = 0;
  let sumSquaredError = 0;
  let peakForecast = -Infinity;
  let peakActual = -Infinity;

  selectedFiles.forEach(file => {
    const fileData = data[file] || [];
    fileData.forEach(row => {
      NOBS++;
      const forecast = row.priceFcst;
      const actual = row.actualPrice;

      sumForecast += forecast;
      sumActual += actual;
      sumAbsPercentError += Math.abs((forecast - actual) / actual);
      sumSquaredError += (forecast - actual) ** 2;
      peakForecast = Math.max(peakForecast, forecast);
      peakActual = Math.max(peakActual, actual);
    });
  });

  const averageForecast = sumForecast / NOBS;
  const averageActual = sumActual / NOBS;
  const mape = (sumAbsPercentError / NOBS) * 100;
  const rmse = Math.sqrt(sumSquaredError / NOBS);

  return {
    NOBS,
    MAPE: mape.toFixed(2),
    RMSE: rmse.toFixed(2),
    PEAK_FORECAST: peakForecast.toFixed(2),
    PEAK_ACTUAL: peakActual.toFixed(2),
    AVERAGE_FORECAST: averageForecast.toFixed(2),
    AVERAGE_ACTUAL: averageActual.toFixed(2),
    ENERGY_FORECAST: sumForecast.toFixed(2),
    ENERGY_ACTUAL: sumActual.toFixed(2),
  };
};

export default calculateStatistics;