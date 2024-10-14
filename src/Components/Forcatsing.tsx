import { useEffect, useState } from "react";
import "../../src/forcast.css"
import * as React from "react";
import {
  LineOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  EditOutlined,
  ShrinkOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { Dayjs } from 'dayjs';
import { Button, Form, Modal, Table, DatePicker, Input, Radio, Select, Upload, message } from "antd";
import { SiCodeforces } from "react-icons/si";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import Papa from "papaparse"
const { RangePicker } = DatePicker;
interface RevenueData {
  ID: any;
  key: string;
  CompanyName: string;
  Revenue2022: string;
  Revenue2023: string;
  Revenue2024: string;
  forecasts?: Array<{ key: string; forecastValue: number }>;
}
interface ForecastingProps {
  host: any;
  options1: any;
  dataView: any;
  exportDataCb: any;
  formattingSettings: any;
  target: any;
}
const Forcasting: React.FC<ForecastingProps> = ({ host, options1, exportDataCb, dataView, formattingSettings, target }) => {
  const [dataSource, setDataSource] = useState<RevenueData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [forecastTitle, setForecastTitle] = useState<string>("");
  const [forecastRange, setForecastRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [forecastType, setForecastType] = useState<string>("blank");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [addedColumns, setAddedColumns] = useState<any[]>([]);
  const [newdcolumns, setNewdcolumns] = useState<any[]>([]);
  const [importdata, setImportdata] = useState<RevenueData[]>([]);
  const [tempImportData, setTempImportData] = useState<any>(null);
  const forecastMultipleYears = (year2023: string, year2024: string, years: number): number[] => {
    const forecasts: number[] = [];
    const value2023 = parseFloat(year2023);
    const value2024 = parseFloat(year2024);
    if (isNaN(value2023) || isNaN(value2024) || value2023 === 0) {
      return Array(years).fill(0);
    }
    const growthRate = (value2024 - value2023) / value2023;
    forecasts.push(parseFloat((value2024 * (1 + growthRate)).toFixed(2)));
    for (let i = 1; i < years; i++) {
      const nextForecast = parseFloat((forecasts[i - 1] * (1 + growthRate)).toFixed(2));
      forecasts.push(nextForecast);
    }
    return forecasts;
  };
 
  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: RevenueData[]) => {
        setRevenueData(data);
        setDataSource(data);
        generateDynamicColumns(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);
 
  console.log("dataSourceapi", dataSource);
  const handleModalOk = (e) => {
    e.preventDefault();
    const years = forecastRange ? forecastRange[1].year() - forecastRange[0].year() + 1 : 0;
    const modifyData = revenueData.map((item) => {
      let forecasts;
      if (forecastType === "future") {
        forecasts = forecastMultipleYears(item.Revenue2023, item.Revenue2024, years);
      } else if (forecastType === "existing") {
        forecasts = item.forecasts ? item.forecasts.map(f => f.forecastValue) : Array(years).fill(0);
      } else {
        forecasts = Array(years).fill(0);
      }
      return {
        ...item,
        [`Forcast_${selectedColumn}`]: item[selectedColumn],
        forecasts: forecasts.map((value, i) => ({
          key: `${item[selectedColumn]}-${i}`,
          forecastValue: value,
        })),
      };
    });
    console.log(modifyData, "modifydata")
    if (tempImportData) {
      setImportdata(tempImportData);
      console.log("Imported data set successfully");
    }
    setIsModalVisible(false);
    if (forecastType == "existing" || forecastType == "existing") {
      console.log("Hi in IF")
      setDataSource(pre => {
        const a = pre.map((d) => {
          d[`Forcast_${selectedColumn}`] = d[selectedColumn]
        })
        return pre
      })
      console.log("Data change completed")
      if (selectedColumn) {
        setAddedColumns(prev => [...prev, `Forcast_${selectedColumn}`]);
      }
    } else {
      console.log("else")
      setAddedColumns([])
      setColumns([])
      setDataSource(modifyData)
    }
    //setAddedColumns([])
    console.log("performChanges calling")
    performChanges()
    console.log("performChanges calling completed")
  };
  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      // Log the file type for verification
      console.log("File Type:", fileType);
      if (fileType === 'csv') {
        // Parse CSV using PapaParse
        console.log("Parsing CSV file...");
        Papa.parse(e.target.result, {
          header: true, // Use the first row as column headers
          skipEmptyLines: true,
          complete: (result: any) => {
            console.log("Parsed CSV Data:", result.data); // Log the parsed CSV data
            setDataSource(result.data);
            message.success('CSV file uploaded successfully!');
          },
        });
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        // Parse Excel using xlsx
        console.log("Parsing Excel file...");
        const binaryStr = e.target.result;
        console.log("binaryStr", binaryStr)
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        console.log("Workbook:", workbook); // Log the workbook to inspect its structure
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        console.log("Sheet Data:", sheet); // Log the sheet data
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        console.log("Parsed Excel Data:", jsonData); // Log the parsed Excel data
        const addIdToData = (jsonData) => {
          return jsonData.map((row, index) => ({
            ID: index + 1, // Add an id field starting from 1
            ...row,        // Spread the existing row data
          }));
        };
        const dataWithId = addIdToData(jsonData);  // Call the function to add IDs
        console.log("Data with IDs:", dataWithId);
        setTempImportData(dataWithId) as any;
        message.success('Excel file uploaded successfully!');
      } else {
        message.error('Unsupported file format. Please upload CSV or Excel.');
      }
    };
    if (file.type === 'text/csv') {
      console.log("Reading CSV file as text...");
      fileReader.readAsText(file);
    } else {
      console.log("Reading Excel file as binary...");
      fileReader.readAsBinaryString(file);
    }
    return false; // Prevent auto upload by Ant Design
  };


  const handleModalCancel = () => {
    // resetForm();
    setIsModalVisible(false);
  };


  
  const handleForecastChange = (value: number, recordKey: string, index: number) => {
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.key === recordKey) {
          const newForecasts = item.forecasts?.map((forecast, i) => {
            if (i === index) {
              return { ...forecast, forecastValue: value };
            }
            return forecast;
          });
          return { ...item, forecasts: newForecasts };
        }
        return item;
      })
    );
  };
  const handleDynamicColumnChange = (value: string, recordKey: string) => {
    console.log(value, recordKey)
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.ID == recordKey) {
          console.log(item)
          return { ...item, [`Forcast_${selectedColumn}`]: value };
        }
        return item;
      })
    );
  };
  const handleExistingColumnChange = (value: string, recordKey: string, column: string) => {
    console.log(value)
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.key === recordKey) {
          return { ...item, [column]: value };
        }
        return item;
      })
    );
  };
  const handleDeleteColumn = (columnKey: string) => {
    // Remove from addedColumns
    setAddedColumns(prev => prev.filter(column => column !== columnKey));
    // Remove from columns
    setColumns(prevColumns => prevColumns.filter(column => column.dataIndex !== columnKey));
  };
  const generateDynamicColumns = (data: RevenueData[]) => {
    if (data.length === 0) return;
    const newdynamicColumns = Object.keys(data[0]).map((key) => ({
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {key}
        </div>
      ),
      dataIndex: key,
      render: (text: any, record: RevenueData) => (
        <input
          className="inputcolor"
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.ID, key)}
          style={{ width: "100%", border: "none", padding: "0px" }}
        />
      ),
      width: key === "CompanyName" ? "30%" : "25%",
    }));
    setColumns(newdynamicColumns);
    setNewdcolumns(newdynamicColumns)
  };
 
  //columns related code
  const [columns, setColumns] = useState(newdcolumns)
  const performChanges = () => {
    console.log(dataSource, "data in perform change");
    // Existing dynamic columns
    let dynamicColumns = addedColumns.map(column => ({
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {column}
          <DeleteOutlined
            onClick={() => handleDeleteColumn(column)}
            style={{ color: "white", cursor: "pointer" }}
          />
        </div>
      ),
      dataIndex: column,
      render: (text: any, record: RevenueData) => (
        <input
          className="inputcolor"
          value={record[column] || ''}
          onChange={(e) => {
            console.log(e.target.value, "Existing");
            handleDynamicColumnChange(e.target.value, record.ID);
          }}
          style={{ width: '100%', border: 'none', padding: '0px', color: 'red' }}
        />
      ),
      width: "25%",
    }));
    // Forecast columns
    let forecastColumns = [];
    forecastColumns = forecastRange ?
      Array.from({ length: forecastRange[1].year() - forecastRange[0].year() + 1 }, (_, index) => ({
        title: (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {`${forecastTitle} ${forecastRange[0].year() + index}`}
            <DeleteOutlined
              onClick={() => handleDeleteColumn(`forecast${index}`)}  // Correctly passing column identifier
              style={{ color: "white", cursor: "pointer" }}
            />
          </div>
        ),
        dataIndex: `forecast${index}`,
        width: "25%",
        render: (text: any, record: RevenueData) => {
          record.key = record.ID;
          const forecastValue = record.forecasts?.[index]?.forecastValue ?? "";
          return forecastType === "blank" ? (
            <input
              id={`forecast-${record.key}-${index}`} // Unique ID for each input
              value={forecastValue}
              className="inputcolor"
              onChange={(e) => {
                const newForecastValue = e.target.value ? parseFloat(e.target.value) : 0;
                handleForecastChange(newForecastValue, record.key, index);
              }}
              style={{ width: '100px', border: 'none', padding: '0px' }}
            />
          ) : (
            <span>{forecastValue}</span>
          );
        },
      })) : [];
    console.log("seeting columns");
    if (forecastType === "existing") {
      setColumns([...newdcolumns, ...dynamicColumns, ...forecastColumns]);
      console.log(dynamicColumns, "dynamicColumns");
    }
    if (forecastType === "future") {
      setColumns([...newdcolumns, ...forecastColumns]);
      console.log(forecastColumns, "forecastColumns");
    }
    if (forecastType === "blank") {
      setColumns([...newdcolumns, ...forecastColumns]);
      console.log(forecastColumns, "blank");
      console.log(addedColumns, "addedColumns");
    }
    console.log("seeting columns completed");
    setForecastTitle("");
    setForecastRange(null);
    // setSelectedColumn("");
  };
  useEffect(() => {
    if (forecastType == "existing") performChanges();
  }, [/*dataSource, , */addedColumns, addedColumns]);
  useEffect(() => {
    console.log("columns", columns)
    console.log("data in columns", dataSource)
  }, [columns])
  const options = newdcolumns.map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));
  const resetForm = () => {
    // debugger
    setForecastTitle('');
    setForecastRange(null);
    //  debugger
  }
  const convertToCSV = (array) => {
    if (!array || array.length === 0) return ''; // Handle empty data cases
    const keys = Object.keys(array[0]); // Extract keys (headers) from the first object
    const csvRows = [];
    // Create the header row
    csvRows.push(keys.join(','));
    // Map over each row and create a CSV string for each row
    array.forEach((row) => {
      const values = keys.map((key) => {
        const value = row[key];
        return `"${value}"`; // Wrap each value in quotes to handle commas
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n'); // Join all rows by a newline character
  };
  // Function to handle download process in Power BI custom visual using exportDataCb
  const handleDownload = (updatedData, host, exportDataCb) => {
    console.log("Download initiated");
    // Check if dataSource exists and is not empty
    if (!updatedData || updatedData.length === 0) {
      console.error("Data source is empty. Nothing to download.");
      return;
    }
    // Prepare data to be downloaded
    const dataToDownload = updatedData.map((row) => ({
      ...row,
    }));
    console.log("Data to download:", dataToDownload);
    // Convert data to CSV format
    const fileContent = convertToCSV(dataToDownload);
    // Verify if CSV content is correct
    console.log("File content:", fileContent);
    if (!fileContent) {
      console.error("No content to download.");
      return;
    }
    // Call exportDataCb to handle the CSV content
    exportDataCb(fileContent, "csv file");
    // Create a Blob from the CSV content for download via Power BI
    const blob = new Blob([fileContent], { type: "text/csv;charset=UTF-8" });
    console.log("Blob created:", blob);
    // Power BI's IDownloadService to handle downloads
    console.log("host", host);
    const downloadService = host.downloadService; // Ensure `host` is passed as a prop from Power BI
    console.log("downloadService available:", downloadService && typeof downloadService.downloadBlob === 'function');
    if (downloadService && typeof downloadService.downloadBlob === 'function') {
      // Use the service to download the CSV file
      downloadService.downloadBlob(blob, "forecasting_data.csv");
      console.log("Download triggered successfully");
    } else {
      console.error("Download service is not available.");
    }
  };
  const modifyDataSource = (dataSource) => {
    return dataSource.map(company => {
      const modifiedCompany = { ...company };
      // Initialize the properties that we want to conditionally add
      let hasForecastCondition = false;
      // Check if forecasts exist and is an array
      if (Array.isArray(company.forecasts)) {
        // Remove forecasts from the original object
        delete modifiedCompany.forecasts;
        // Add each forecast as a separate key-value pair
        company.forecasts.forEach((forecast, index) => {
          modifiedCompany[`forecast_${index}`] = forecast.forecastValue;
          // Access the forecastType correctly
          const forecastType = forecast.forecastType;
          // Check forecastType conditions
          if (forecastType === "blank" || forecastType === "future") {
            // Only add Forcast_ and Key if the condition is met
            modifiedCompany.Forcast_ = undefined; // Set to undefined as required
            modifiedCompany.key = company.ID; // You may want to set it based on your logic
            hasForecastCondition = true; // This indicates a condition was met
          }
        });
      }
      // If no condition was met, remove Forcast_ and key properties
      if (!hasForecastCondition) {
        delete modifiedCompany.Forcast_;
        delete modifiedCompany.key; // If key is not required, this line can be omitted
      }
      return modifiedCompany;
    });
  };
  const updatedData = importdata.length > 0
    ? modifyDataSource(importdata)
    : modifyDataSource(dataSource);
  console.log("updatedata", updatedData);
  console.log("columns", columns)
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '10px 10px' }}>
        <Button onClick={() => setIsModalVisible(true)} className='button-style'>
          Forecasting
        </Button>
        {/* // onClick={handleDownload} */}
        <Button className='button-style' onClick={() => handleDownload(updatedData, host, exportDataCb)}  >
          Export
        </Button>
      </div>
      <Modal
        title="Select Forecast Options"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form layout="vertical">
          {forecastType === "existing" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', }}>
              <div>
                <label>Select Existing Columns</label>
                <Select
                  value={selectedColumn}
                  onChange={(value) => setSelectedColumn(value)}
                  style={{ width: "100%" }}
                  options={options}
                />
              </div>
              <div>  (OR) </div>
              <div>
                <Upload
                  beforeUpload={handleFileUpload} // Handle file upload before submitting
                  accept=".csv,.xlsx,.xls" // Accept only CSV and Excel files
                  showUploadList={false} // Hide upload list
                >
                  <Button className="button-style">Import</Button>
                </Upload>
              </div>
            </div>
          ) : (
            <>
              <Form.Item label="Forecast Title" required>
                <Input
 
                  value={forecastTitle}
                  onChange={(e) => setForecastTitle(e.target.value)}
                  placeholder="Enter forecast title"
                />
              </Form.Item>
              <Form.Item label="Select Date Range" required>
                <RangePicker
 
                  value={forecastRange}
                  onChange={setForecastRange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </>
          )}
          <Form.Item label="Forecast Type" required>
            <Radio.Group value={forecastType} onChange={(e) => setForecastType(e.target.value)}>
              <Radio value="blank">Blank Forecast</Radio>
              <Radio value="future">Future Forecast</Radio>
              <Radio value="existing">Existing Forecast</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        bordered
        className="custom-table hide-scrollbar"
        // dataSource={dataSource}
        dataSource={importdata && importdata.length > 0 ? importdata : dataSource}
        columns={columns}
        rowKey="ID"
        pagination={{
          pageSize: 20, // Adjust the page size as needed
          total: dataSource.length, // Total number of data items
          position: ["bottomRight"], // Pagination at the bottom right
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`, // Showing range of displayed items
          itemRender: (_, type, originalElement) => {
            if (type === "prev") {
              return <LeftOutlined />;  // Custom icon for 'Previous' button
            }
            if (type === "next") {
              return <RightOutlined />; // Custom icon for 'Next' button
            }
            return originalElement; // Default pagination elements
          },
        }}
        scroll={{ x: '100%', y: 400 }}  // Enable scroll for the body
      />
    </div>
  );
};
export default Forcasting;