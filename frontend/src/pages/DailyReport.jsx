import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Table, Statistic, Row, Col, Upload, message, Button, Spin, Switch } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { fetchDataA } from '../services/api';
import './DailyReport.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const { RangePicker } = DatePicker;

const DailyReport = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [tempDateRange, setTempDateRange] = useState([null, null]);
  const [previousMetrics, setPreviousMetrics] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' },
    { value: 'claims', label: 'Claims' },
    { value: 'payments', label: 'Payments' },
    { value: 'eligibility', label: 'Eligibility' },
    { value: 'non_eligibility', label: 'Non-Eligibility' }
  ]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [headerMapping, setHeaderMapping] = useState({
    date: ['date', 'datetime', 'time', 'day'],
    category: ['category', 'type', 'categories', 'group'],
    status: ['status', 'state', 'condition', 'result'],
    responseTime: ['responsetime', 'response', 'response_time', 'responseduration', 'duration', 'time']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postgresData, setPostgresData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState(null);

  const createColumnsFromHeaders = (headers) => {
    return headers.map((header) => {
      const column = {
        title: header,
        dataIndex: header.toLowerCase().replace(/\s+/g, '_'),
        key: header.toLowerCase().replace(/\s+/g, '_'),
        width: 150,
      };

      if (header.toLowerCase().includes('time') || header.toLowerCase().includes('number')) {
        column.sorter = (a, b) => {
          const aVal = parseFloat(a[column.dataIndex]) || 0;
          const bVal = parseFloat(b[column.dataIndex]) || 0;
          return aVal - bVal;
        };
      }

      if (header.toLowerCase().includes('date')) {
        column.sorter = (a, b) => {
          const aDate = a[column.dataIndex] ? new Date(a[column.dataIndex]) : new Date(0);
          const bDate = b[column.dataIndex] ? new Date(b[column.dataIndex]) : new Date(0);
          return aDate - bDate;
        };
      }

      if (header.toLowerCase().includes('category') || header.toLowerCase().includes('type')) {
        column.filters = categories.slice(1).map(cat => ({ text: cat.label, value: cat.value }));
        column.onFilter = (value, record) => record[column.dataIndex]?.toLowerCase() === value;
      }

      return column;
    });
  };

  const calculateMetrics = (dataSet) => {
    if (!Array.isArray(dataSet) || dataSet.length === 0) return {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      failedRequests: 0,
    };

    const totalRequests = dataSet.length;
    const successfulRequests = dataSet.filter(item => item.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = dataSet.reduce((acc, item) => acc + (parseFloat(item.responseTime) || 0), 0) / totalRequests || 0;

    return {
      totalRequests,
      successRate,
      avgResponseTime,
      failedRequests,
    };
  };

  const calculateComparison = (current, previous) => {
    if (!previous) return null;
    
    return {
      totalRequests: ((current.totalRequests - previous.totalRequests) / previous.totalRequests * 100) || 0,
      successRate: current.successRate - previous.successRate,
      avgResponseTime: ((current.avgResponseTime - previous.avgResponseTime) / previous.avgResponseTime * 100) || 0,
      failedRequests: ((current.failedRequests - previous.failedRequests) / previous.failedRequests * 100) || 0,
    };
  };

  const handleApplyFilters = () => {
    if (!tempDateRange || !tempDateRange[0] || !tempDateRange[1]) {
      message.warning('Please select both start and end dates');
      return;
    }

    const [startDate, endDate] = tempDateRange;
    
    // Validate dates
    if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
      message.error('Invalid date selection');
      return;
    }

    // Validate data array
    if (!Array.isArray(data) || data.length === 0) {
      message.warning('No data available to filter');
      return;
    }

    try {
      let filtered = [...data];
      
      // Apply date filtering with proper date parsing and validation
      filtered = filtered.filter(item => {
        if (!item || !item.date) return false;
        
        let itemDate;
        try {
          itemDate = dayjs(item.date);
          if (!itemDate.isValid()) return false;
        } catch (err) {
          console.warn('Invalid date format:', item.date);
          return false;
        }

        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).endOf('day');

        if (!start.isValid() || !end.isValid()) return false;

        const itemTimestamp = itemDate.startOf('day').unix();
        const startTimestamp = start.unix();
        const endTimestamp = end.unix();

        return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
      });

      // Apply category filtering if needed
      if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(item => {
          if (!item || !item.category) return false;
          return item.category.toLowerCase() === selectedCategory.toLowerCase();
        });
      }

      if (!Array.isArray(filtered)) {
        throw new Error('Filtering operation returned invalid results');
      }

      setDateRange(tempDateRange);
      setFilteredData(filtered);
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        current: 1,
        pageSize: 10
      }));

      // Calculate previous period metrics
      if (filtered.length > 0) {
        const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day');
        const previousStartDate = dayjs(startDate).subtract(daysDiff + 1, 'day');
        const previousEndDate = dayjs(startDate).subtract(1, 'day');

        const previousPeriodData = data.filter(item => {
          if (!item || !item.date) return false;
          
          const itemDate = dayjs(item.date);
          if (!itemDate.isValid()) return false;
          
          return itemDate.unix() >= previousStartDate.unix() && 
                 itemDate.unix() <= previousEndDate.unix();
        });

        setPreviousMetrics(calculateMetrics(previousPeriodData));
      }

      if (filtered.length === 0) {
        message.info(`No records found between ${dayjs(startDate).format('YYYY-MM-DD')} and ${dayjs(endDate).format('YYYY-MM-DD')}`);
      } else {
        message.success(`Found ${filtered.length} records between ${dayjs(startDate).format('YYYY-MM-DD')} and ${dayjs(endDate).format('YYYY-MM-DD')}`);
      }

    } catch (error) {
      console.error('Filtering error:', error);
      message.error('An error occurred while filtering data');
    }
  };

  const findMatchingHeader = (headers, mappings) => {
    return headers.find(header => 
      mappings.some(mapping => header.toLowerCase().replace(/[^a-z0-9]/g, '') === mapping.toLowerCase())
    );
  };

  const validateAndFormatCategory = (category) => {
    if (!category) return null;
    
    const formattedCategory = category.toString().toLowerCase().trim();
    const validBaseCategories = ['claims', 'payments', 'eligibility', 'non_eligibility'];
    
    if (validBaseCategories.includes(formattedCategory)) {
      return formattedCategory;
    }

    // Try to normalize the category name
    const normalizedCategory = formattedCategory
      .replace(/[^a-z0-9_]/g, '_')  // Replace any non-alphanumeric chars with underscore
      .replace(/^non[\s_-]*eligibility$/, 'non_eligibility'); // Normalize variations of non-eligibility
    
    if (validBaseCategories.includes(normalizedCategory)) {
      return normalizedCategory;
    }
    
    return null;
  };

  const updateCategoriesList = (newData) => {
    const uniqueCategories = new Set();
    
    // Add existing categories
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        uniqueCategories.add(cat.value);
      }
    });

    // Add new categories from data
    newData.forEach(row => {
      if (row.category) {
        uniqueCategories.add(row.category.toLowerCase());
      }
    });

    // Convert to categories array format
    const updatedCategories = [
      { value: 'all', label: 'All Categories' },
      ...Array.from(uniqueCategories).map(cat => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    ];

    setCategories(updatedCategories);
  };

  const handleFileUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      message.error('You can only upload Excel files (.xlsx or .xls)');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!Array.isArray(rawData) || rawData.length < 2) {
          message.error('No data found in the Excel file. Please ensure the file has headers and data.');
          return;
        }

        // Get headers from first row and clean them
        const headers = rawData[0].map(header => 
          header ? header.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
        );

        // Find matching headers for required fields
        const dateHeader = findMatchingHeader(headers, headerMapping.date);
        const categoryHeader = findMatchingHeader(headers, headerMapping.category);
        const statusHeader = findMatchingHeader(headers, headerMapping.status);
        const responseTimeHeader = findMatchingHeader(headers, headerMapping.responseTime);

        // Map the original headers to our expected format
        const headerIndexMap = {
          date: headers.indexOf(dateHeader),
          category: headers.indexOf(categoryHeader),
          status: headers.indexOf(statusHeader),
          responseTime: headers.indexOf(responseTimeHeader)
        };

        // Check if all required fields are found
        const missingFields = [];
        Object.entries(headerIndexMap).forEach(([field, index]) => {
          if (index === -1) missingFields.push(field);
        });

        if (missingFields.length > 0) {
          message.error(
            `Could not find columns for: ${missingFields.join(', ')}.\n` +
            'Acceptable header names include:\n' +
            `Date: ${headerMapping.date.join(', ')}\n` +
            `Category: ${headerMapping.category.join(', ')}\n` +
            `Status: ${headerMapping.status.join(', ')}\n` +
            `Response Time: ${headerMapping.responseTime.join(', ')}`
          );
          return;
        }

        // Transform data using the mapped headers
        const transformedData = [];
        const invalidRows = [];

        rawData.slice(1).forEach((row, index) => {
          const date = row[headerIndexMap.date];
          const category = row[headerIndexMap.category];
          const status = row[headerIndexMap.status];
          const responseTime = row[headerIndexMap.responseTime];

          // Validate date
          const parsedDate = dayjs(date);
          if (!parsedDate.isValid()) {
            invalidRows.push(`Row ${index + 2}: Invalid date format`);
            return;
          }

          // Validate category
          const validCategory = validateAndFormatCategory(category);
          if (!validCategory) {
            invalidRows.push(`Row ${index + 2}: Invalid category "${category}"`);
            return;
          }

          // Validate status
          const validStatuses = ['success', 'failed'];
          const formattedStatus = status?.toString().toLowerCase();
          if (!formattedStatus || !validStatuses.includes(formattedStatus)) {
            invalidRows.push(`Row ${index + 2}: Invalid status "${status}"`);
            return;
          }

          // Add valid row to transformed data
          transformedData.push({
            key: index,
            date: parsedDate.format('YYYY-MM-DD'),
            category: validCategory,
            status: formattedStatus,
            responseTime: parseFloat(responseTime) || 0
          });
        });

        // Update categories list with new valid categories
        updateCategoriesList(transformedData);

        // Set the transformed data
        setData(transformedData);
        setFilteredData(transformedData);
        setIsFileUploaded(true);
        setUploadedFileName(file.name);

        // Show success message with warnings if any
        if (invalidRows.length > 0) {
          message.warning(
            `File uploaded with ${invalidRows.length} invalid rows:\n${invalidRows.join('\n')}\n\n` +
            `Successfully processed ${transformedData.length} valid records.`
          );
        } else {
          message.success(`Successfully uploaded ${transformedData.length} records from ${file.name}`);
        }

      } catch (error) {
        console.error('File processing error:', error);
        message.error(
          'Error processing file: ' + error.message + '\n\n' +
          'Your Excel file should contain columns for:\n' +
          '- Date (any date format)\n' +
          '- Category (claims, payments, or eligibility)\n' +
          '- Status (success or failed)\n' +
          '- Response Time (number in milliseconds)\n\n' +
          'The column names can be flexible, but the data must match these formats.'
        );
      }
    };

    reader.onerror = () => {
      message.error('Error reading file. Please try again or use a different file.');
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRemoveFile = () => {
    setData([]);
    setFilteredData([]);
    setIsFileUploaded(false);
    setUploadedFileName('');
    setDateRange([null, null]);
    setTempDateRange([null, null]);
    setPreviousMetrics(null);
    message.success('File removed successfully');
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  };

  const currentMetrics = calculateMetrics(filteredData);
  const comparison = calculateComparison(currentMetrics, previousMetrics);

  const renderComparisonValue = (value, inverse = false) => {
    if (!value && value !== 0) return null;
    const isPositive = inverse ? value <= 0 : value >= 0;
    const color = isPositive ? '#3f8600' : '#cf1322';
    const prefix = value >= 0 ? '+' : '';
    
    return (
      <div style={{ 
        position: 'absolute',
        bottom: '8px',
        right: '24px',
        fontSize: '14px',
        color: color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {prefix}{Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  const handleFetchDataA = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDataA();
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from server');
      }

      const formattedData = response.data.map(item => ({
        ...item,
        key: item.id,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }));
      
      setPostgresData(formattedData);
      message.success('Data fetched successfully');
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(`Failed to fetch data: ${err.message}`);
      message.error(`Failed to fetch data: ${err.message}`);
      setPostgresData([]); // Clear any previous data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Update the auto-refresh effect with error handling
  useEffect(() => {
    let intervalId;
    if (autoRefresh && selectedDataType === 'data-a') {
      intervalId = setInterval(() => {
        handleFetchDataA().catch(err => {
          console.error('Auto-refresh error:', err);
          setAutoRefresh(false); // Disable auto-refresh on error
          message.error('Auto-refresh disabled due to error');
        });
      }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, selectedDataType]);

  const postgresColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'active' ? '#52c41a' : 
                 status === 'inactive' ? '#f5222d' : '#faad14'
        }}>
          {status}
        </span>
      ),
    },
  ];

  // Modify the Select onChange handler
  const handleDataTypeChange = (value) => {
    setSelectedDataType(value);
    if (value === 'data-a') {
      handleFetchDataA();
    }
  };

  return (
    <div className="daily-report-container">
      <Card title="Daily Report" className="daily-report-card">
        <div className="controls-section">
          <div className="upload-section">
            <Upload
              beforeUpload={handleFileUpload}
              accept=".xlsx,.xls"
              showUploadList={false}
              maxCount={1}
            >
              <Button
                icon={isFileUploaded ? <CheckCircleOutlined /> : <UploadOutlined />}
                style={{
                  background: isFileUploaded ? 'linear-gradient(to right, #52c41a, #ffffff)' : 'linear-gradient(to right, #808080, #ffffff)',
                  color: isFileUploaded ? '#135200' : '#333333',
                  minWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isFileUploaded ? 'File Uploaded' : 'Upload Excel File'}
              </Button>
            </Upload>
            {isFileUploaded && (
              <Button 
                icon={<DeleteOutlined />} 
                onClick={handleRemoveFile}
                style={{
                  background: 'linear-gradient(to right, #ff4d4f, #ffffff)',
                  color: '#a8071a',
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Remove File
              </Button>
            )}
          </div>
          <div className="filters-section">
            <Select
              className="select-bold"
              style={{ 
                width: '280px',
                background: 'linear-gradient(to right, #d0d0d0, #ffffff)'
              }}
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                handleApplyFilters();
              }}
              options={categories}
              placeholder="Select Category"
            />
            <RangePicker
              className="date-picker-bold"
              value={tempDateRange}
              onChange={(dates) => {
                setTempDateRange(dates);
              }}
              format="YYYY-MM-DD"
              style={{ 
                width: '340px',
                background: 'linear-gradient(to right, #d0d0d0, #ffffff)'
              }}
            />
            <Button
              type="primary"
              onClick={handleApplyFilters}
              style={{
                background: 'linear-gradient(to right, #d0d0d0, #ffffff)',
                color: '#000000',
                minWidth: '120px',
                border: '1px solid #d9d9d9'
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #b0b0b0, #ffffff)' }}>
              <Statistic
                title="Total Requests"
                value={currentMetrics.totalRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.totalRequests)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #b0b0b0, #ffffff)' }}>
              <Statistic
                title="Success Rate"
                value={currentMetrics.successRate}
                precision={2}
                suffix="%"
              />
              {comparison && renderComparisonValue(comparison.successRate)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #b0b0b0, #ffffff)' }}>
              <Statistic
                title="Avg Response Time"
                value={currentMetrics.avgResponseTime}
                precision={2}
                suffix="ms"
              />
              {comparison && renderComparisonValue(comparison.avgResponseTime, true)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #b0b0b0, #ffffff)' }}>
              <Statistic
                title="Failed Requests"
                value={currentMetrics.failedRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.failedRequests, true)}
            </Card>
          </Col>
        </Row>

        <div className="table-container">
          <Table
            columns={[
              {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                sorter: (a, b) => new Date(a.date) - new Date(b.date),
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                filters: categories.slice(1).map(cat => ({ text: cat.label, value: cat.value })),
                onFilter: (value, record) => record.category === value,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                filters: [
                  { text: 'Success', value: 'success' },
                  { text: 'Failed', value: 'failed' },
                ],
                onFilter: (value, record) => record.status === value,
              },
              {
                title: 'Response Time (ms)',
                dataIndex: 'responseTime',
                key: 'responseTime',
                sorter: (a, b) => a.responseTime - b.responseTime,
              }
            ]}
            dataSource={filteredData}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </div>
      </Card>

      <Card className="data-section">
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#1a1a1a'
        }}>
          Fetch Records
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '16px',
          height: '32px'  // Match the height of controls
        }}>
          <Select
            style={{ width: 200 }}
            placeholder="Pick Category"
            value={selectedDataType}
            onChange={handleDataTypeChange}
          >
            <Select.Option value="data-a">Fetching_sample</Select.Option>
          </Select>
          <Button 
            onClick={handleFetchDataA}
            loading={isLoading}
            style={{ height: '32px' }}  // Match height with Select
          >
            Refresh Data
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={autoRefresh}
              onChange={(checked) => setAutoRefresh(checked)}
              disabled={selectedDataType !== 'data-a'}
            />
            <span>Auto-refresh</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          postgresData.length > 0 && (
            <Table
              columns={postgresColumns}
              dataSource={postgresData}
              rowKey="id"
              pagination={false}
            />
          )
        )}
      </Card>
    </div>
  );
};

export default DailyReport; 