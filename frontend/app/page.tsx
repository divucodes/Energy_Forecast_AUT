"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DatePicker, Tabs, Select, Table, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import dayjs, { Dayjs } from 'dayjs';
import Spreadsheet from '@/components/Spreadsheet';
import LineChart from '@/components/LineChart';
import calculateStatistics from '@/components/statistics';

const { RangePicker } = DatePicker;
const { Option } = Select;

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

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ApiResponse>({});
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [csvFileNames, setCsvFileNames] = useState<string[]>([]);

  const fetchCSVFileNames = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/csv-files');
      if (!response.ok) throw new Error('Failed to fetch CSV file names');
      const fileNames: string[] = await response.json();
      setCsvFileNames(fileNames);
    } catch (error) {
      console.error('Error fetching CSV file names:', error);
    }
  }, []);

  const fetchData = useCallback(async (files: string[]) => {
    if (files.length === 0) {
      setData({});
      return;
    }
    try {
      const url = `http://localhost:3000/api/csv-data?files=${files.join(',')}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      const jsonData: ApiResponse = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchCSVFileNames();
  }, [fetchCSVFileNames]);

  useEffect(() => {
    fetchData(selectedFiles);
  }, [selectedFiles, fetchData]);

  const handleDateChange = useCallback((
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    if (dates && dates[0] && dates[1]) {
      setStartDate(dates[0].format('YYYYMMDD'));
      setEndDate(dates[1].format('YYYYMMDD'));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, []);

  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;
    const filtered: ApiResponse = {};
    Object.entries(data).forEach(([source, entries]) => {
      filtered[source] = entries.filter(row => row.date >= startDate && row.date <= endDate);
    });
    return filtered;
  }, [data, startDate, endDate]);

  const resetFilters = useCallback(() => {
    setSelectedFiles([]);
    setStartDate(null);
    setEndDate(null);
  }, []);

  const statistics = useMemo(() => {
    return calculateStatistics(filteredData, selectedFiles);
  }, [filteredData, selectedFiles]);

  const handleFileChange = async (info: any) => {
    const { file } = info;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        message.success('File uploaded successfully');
        fetchCSVFileNames();
        fetchData(selectedFiles);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Error uploading file');
    }
  };

  const items = [
    {
      key: '1',
      label: 'Spreadsheet',
      children: (
        <div className="h-[70vh] overflow-hidden">
          <Spreadsheet data={filteredData} selectedFiles={selectedFiles} />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Graph',
      children: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Price Forecast Graph</h1>
          <LineChart data={filteredData} selectedFiles={selectedFiles} />
        </div>
      ),
    },
    {
      key: '3',
      label: 'Statistics',
      children: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Statistics for Selected Models</h1>
          {selectedFiles.length > 0 ? (
            <Table
              dataSource={Object.entries(statistics).map(([parameter, value]) => ({ parameter, value }))}
              columns={[
                { title: 'Parameter', dataIndex: 'parameter', key: 'parameter' },
                { title: 'Value', dataIndex: 'value', key: 'value' },
              ]}
              pagination={false}
              rowKey="parameter"
              bordered
            />
          ) : (
            <p>Please select at least one Model.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow p-6">
        <div className="flex">
          <div className="w-1/4 p-4 bg-white shadow-lg rounded-lg mr-4">
            <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select Model</label>
              <Select
                className="w-full mt-1"
                mode="multiple"
                value={selectedFiles}
                onChange={setSelectedFiles}
                placeholder="Select Model"
              >
                {csvFileNames.map(fileName => (
                  <Option key={fileName} value={fileName}>
                    {fileName.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </div>
            <h2 className="text-lg font-semibold mb-2">Filter by Date Range</h2>
            <RangePicker
              onChange={handleDateChange}
              value={[
                startDate ? dayjs(startDate) : null,
                endDate ? dayjs(endDate) : null,
              ]}
              className="w-full mb-4"
              style={{
                backgroundColor: '',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <Button onClick={resetFilters} type="primary" className="w-full bg-red-500">
              Reset Filters
            </Button>
            <h2 className="text-lg font-semibold mb-4 mt-4">Upload CSV</h2>
            <Upload
              customRequest={({ file }) => handleFileChange({ file })}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
          <div className="w-3/4 p-4 bg-white shadow-lg rounded-lg">
            <Tabs defaultActiveKey="1" items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;