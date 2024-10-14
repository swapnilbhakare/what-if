import { useEffect, useState } from "react";
import "../../src/forcast.css"
import * as React from "react"; 
import { LineOutlined, 
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
import Papa from  "papaparse"
import IDownloadService = powerbi.extensibility.IDownloadService;
import powerbi from "powerbi-visuals-api";



const { RangePicker } = DatePicker;

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
  exportDataCb: any;
  dataView: any;
  formattingSettings: any;
  target: any;
}

const Forcasting: React.FC<ForecastingProps> = ({ host, options1, exportDataCb, dataView, formattingSettings,target }) => {
  const [dataSource, setDataSource] = useState<RevenueData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [forecastTitle, setForecastTitle] = useState<string>("");
  const [forecastRange, setForecastRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [forecastType, setForecastType] = useState<string>("blank");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [addedColumns, setAddedColumns] = useState<any[]>([]);
  
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
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleModalOk = () => {
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

    setIsModalVisible(false);
    if (forecastType == "existing" || forecastType == "existing" ) {
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
    // zzzzresetForm()
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

  const defaultColumns = [
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Company Name
        </div>
      ),
      dataIndex: "CompanyName",
      render: (text: any, record: RevenueData) => (
        <input
          className="inputcolor"
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'CompanyName')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "30%",
    },
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Revenue2022
        </div>
      ),
      dataIndex: "Revenue2022",
      render: (text: any, record: RevenueData) => (
        <input
          className="inputcolor"
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2022')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Revenue2023
        </div>
      ),
      dataIndex: "Revenue2023",
      render: (text: any, record: RevenueData) => (
        <input
          className="inputcolor"
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2023')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Revenue2024
        </div>
      ),
      dataIndex: "Revenue2024",
      render: (text: any, record: RevenueData) => (
        <input
          value={text}
          className="inputcolor"
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2024')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
  ];

  //columns related code

  const [columns, setColumns] = useState(defaultColumns)
const performChanges = () => {
  console.log(dataSource, "data in perform change");
  
  // Existing dynamic columns
  let dynamicColumns = addedColumns.map(column => ({
    title: (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {column}
        <MinusOutlined 
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
    setColumns([...defaultColumns, ...dynamicColumns, ...forecastColumns]);
    console.log(dynamicColumns, "dynamicColumns");
  }
  if (forecastType === "future") {
    setColumns([...defaultColumns, ...forecastColumns]);
    console.log(forecastColumns, "forecastColumns");
  }
  if (forecastType === "blank") {
    setColumns([...defaultColumns, ...forecastColumns]);
    console.log(forecastColumns, "blank");
    console.log(addedColumns, "addedColumns");
  }

  console.log("seeting columns completed");
  setForecastTitle("");
  setForecastRange(null);
  // setSelectedColumn("");
};

  /*
  const performChanges1 = () => {
    console.log(dataSource, "data in perform change");
    
    // Create dynamic columns from addedColumns
    let dynamicColumns = addedColumns.map(column => ({
        title: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {column}
                <DeleteOutlined 
                    onClick={() => handleDeleteColumn(column)} 
                    style={{ color: "red", cursor: "pointer" }} 
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
    
    // For blank and forecast
    let forecastColumns = forecastRange
        ? Array.from({ length: forecastRange[1].year() - forecastRange[0].year() + 1 }, (_, index) => ({
            title: `${forecastTitle} ${forecastRange[0].year() + index}`,
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
        })) 
        : [];
    
    console.log("seeting columns");
    if (forecastType === "existing") {
        setColumns([...defaultColumns, ...dynamicColumns, ...forecastColumns]);
        console.log(dynamicColumns, "dynamicColumns");
    } 
    if (forecastType === "future") {
        setColumns([...defaultColumns, ...forecastColumns]);
        console.log(forecastColumns, "forecastColumns");
    }
    if (forecastType === "blank") {
        setColumns([...defaultColumns, ...forecastColumns]);
        console.log(forecastColumns, "blank");
        console.log(addedColumns, "addedColumns");
    }
    console.log("seeting columns completed");
    setForecastTitle("");
    setForecastRange(null);
  };*/
  useEffect(() => {
    if(forecastType=="existing") performChanges();
  }, [/*dataSource, , */addedColumns, addedColumns]);
  useEffect(() => {
    console.log("columns", columns)
    console.log("data in columns", dataSource)
  }, [columns])
 
  const options = defaultColumns.map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));
  const resetForm = () => {
    // debugger
    setForecastTitle('');
    setForecastRange(null);
    //  debugger
  }
  const exportToCSV = () => {
    
    console.log("exportToCSV",exportToCSV);

    // const json2csvParser = new Parser();
    // const csv = json2csvParser.parse(dataSource);
    // const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // saveAs(blob, "table_data.csv");
  };

  const exportToExcel = () => {
    // const worksheet = XLSX.utils.json_to_sheet(dataSource);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    // XLSX.writeFile(workbook, "table_data.xlsx");
  };
  const convertToCSV = (array) => {
    const keys = Object.keys(array[0]); // Extract keys (headers) from the first object
    const csvRows = [];
  
    // Create the header row
    csvRows.push(keys.join(','));
  
    // Map over each row and create a CSV string for each row
    array.forEach((row) => {
      const values = keys.map(key => {
        const value = row[key];
        return "${value}"; // Wrap each value in quotes to handle commas
      });
      csvRows.push(values.join(','));
    });
  
    return csvRows.join('\n'); // Join all rows by a newline character
  };
  

  const handleDownload = () => {
    console.log("Download initiated");

    // Prepare data to be downloaded
    const dataToDownload = dataSource.map((row) => ({
        ...row,
    }));

    console.log("Data to download:", dataToDownload);

    // Convert data to CSV format
    const fileContent = convertToCSV(dataToDownload);

    // Verify if CSV content is correct
    console.log("File content:", fileContent);

    // Create a Blob from the CSV content
    const blob = new Blob([fileContent], { type: "text/csv;charset=UTF-8" });

    // Create a link element for download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "forcasting_data.csv";

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the link element
    document.body.removeChild(link);
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
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        
        console.log("Workbook:", workbook); // Log the workbook to inspect its structure

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        console.log("Sheet Data:", sheet); // Log the sheet data

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        console.log("Parsed Excel Data:", jsonData); // Log the parsed Excel data

        setDataSource(jsonData as any);
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
  const handleDownload = (dataSource, host, exportDataCb) => {
    console.log("Download initiated");

    // Check if dataSource exists and is not empty
    if (!dataSource || dataSource.length === 0) {
      console.error("Data source is empty. Nothing to download.");
      return;
    }

    // Prepare data to be downloaded
    const dataToDownload = dataSource.map((row) => ({
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
        console.log("binaryStr",binaryStr)
        const workbook = XLSX.read(binaryStr, { type: 'binary' });

        console.log("Workbook:", workbook); // Log the workbook to inspect its structure

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        console.log("Sheet Data:", sheet); // Log the sheet data

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        console.log("Parsed Excel Data:", jsonData); // Log the parsed Excel data

        


        const addIdToData = ( jsonData) => {
          return  jsonData.map((row, index) => ({
            ID: index + 1, // Add an id field starting from 1
            ...row,        // Spread the existing row data
          }));
        };

        const dataWithId = addIdToData(jsonData);  // Call the function to add IDs
        console.log("Data with IDs:", dataWithId);
       // setDataSource(jsonData as any);
       setImportdata(dataWithId as any)
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

  console.log("importdtaa", importdata)
  console.log("dataSource", dataSource)

  return (
    // <div>
    //   <div style={{ display:'flex',justifyContent:'space-between', alignItems:'center'}}>   
    //   <button onClick={() => setIsModalVisible(true)} className='forcast'>
    //     Forecasting
    //   </button>
    //   <button className='forcast'onClick={exportToCSV} >
    //     Export
    //   </button>
    //   {forecastType == "blank" ? (
    //   <button className='forcast' >
    //     Import
    //   </button> ) :( <>  </>) }
    //   </div>
    //   <Modal
    //     title="Select Forecast Options"
    //     visible={isModalVisible}
    //     onOk={handleModalOk}
    //     onCancel={handleModalCancel}
    //   >
    //     <Form layout="vertical">
    //       {forecastType === "existing" ? (
    //         <div>
    //           <label>Select Existing Columns</label>
    //           <Select
    //             value={selectedColumn}
    //             onChange={(value) => setSelectedColumn(value)}
    //             style={{ width: "100%" }}
    //             options={options}
    //           />
    //         </div>
    //       ) : (
    //         <>
    //           <Form.Item label="Forecast Title" required>
    //             <Input
             
    //               value={forecastTitle}
    //               onChange={(e) => setForecastTitle(e.target.value)}
    //               placeholder="Enter forecast title"
    //             />
    //           </Form.Item>
    //           <Form.Item label="Select Date Range" required>
    //             <RangePicker
               
    //               value={forecastRange}
    //               onChange={setForecastRange}
    //               format="YYYY-MM-DD"
    //             />
    //           </Form.Item>
    //         </>
    //       )}
    //       <Form.Item label="Forecast Type" required>
    //         <Radio.Group value={forecastType} onChange={(e) => setForecastType(e.target.value)}>
    //           <Radio value="blank">Blank Forecast</Radio>
    //           <Radio value="future">Future Forecast</Radio>
    //           <Radio value="existing">Existing Forecast</Radio>
    //         </Radio.Group>
    //       </Form.Item>
    //     </Form>
    //   </Modal>
    //   <Table
    //     bordered
    //     className="custom-table"
    //     dataSource={dataSource}
    //     columns={columns}
    //   />
    // </div>
    <div>
      <div style={{ display:'flex',gap:'8px', alignItems:'center', margin:'10px 10px'}}>   
      <Button onClick={() => setIsModalVisible(true)} className='button-style'>
        Forecasting
      </Button>
{/* // onClick={handleDownload} */}
      <Button className='button-style' onClick={handleDownload}  >
        Export
      </Button>
        
      {forecastType == "blank" ? (
         <Upload
         beforeUpload={handleFileUpload} // Handle file upload before submitting
         accept=".csv,.xlsx,.xls" // Accept only CSV and Excel files
         showUploadList={false} // Hide upload list
       >
         <Button className="button-style">Import</Button>
       </Upload>
      // <Button className='button-style' >
      //   Import
      // </Button>
       ) :( <>  </>) }
      </div>
      <Modal
        title="Select Forecast Options"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form layout="vertical">
          {forecastType === "existing" ? (
            <div>
              <label>Select Existing Columns</label>
              <Select
                value={selectedColumn}
                onChange={(value) => setSelectedColumn(value)}
                style={{ width: "100%" }}
                options={options}
              />
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
      dataSource={dataSource}
      columns={columns}
      pagination={{
        pageSize: 20, // Adjust the page size as needed
        total: dataSource.length, // Total number of data items
        position: ["bottomRight"], // Pagination at the bottom right
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`, // Showing range of displayed items
        itemRender: (_, type, originalElement) =>
{
          if (type === "prev") {
            return <LeftOutlined />;  // Custom icon for 'Previous' button
          }
          if (type === "next") {
            return <RightOutlined />; // Custom icon for 'Next' button
          }
          return originalElement; // Default pagination elements
        },
      }}
      scroll={{x: '100%', y: 400 }}  // Enable scroll for the body
    />
    </div>
  );
};
export default Forcasting; 