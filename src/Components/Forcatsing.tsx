
import * as React from "react";
import "../Components/styles/forcast.css"
import { Dayjs } from 'dayjs';
import { useContext, useEffect, useRef, useState, createContext } from "react";
import { SiCodeforces } from "react-icons/si";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import Papa from "papaparse"
import {  prepareData ,KeyMap  , detectKeys ,convertData } from './data'
import { EditableCellProps, EditableContext, Item, EditableRow, EditableCell } from './EditableCellForecast'
import {
  MinusOutlined, LeftOutlined, RightOutlined
} from "@ant-design/icons";
import {
  DatePicker,
  TableProps, Button, Table,
  Upload,
  message
} from "antd";
import { PopupModal, WhatIfParameterType, BlankForecastObject, ARRAY_RADIO } from "./PopUpForecast"
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
type ColumnTypes = Exclude<TableProps["columns"], undefined>;
const Forcasting: React.FC<ForecastingProps> = ({ host, exportDataCb
}) => {
  const [columns, setColumns] = useState<any[]>([]);
  const [fetchedDataSource, setFetchedDataSource] = useState<any[]>([]);
  const [modifiedDataSource, setModifiedDataSource] = useState<any[]>([]);
  //popup related
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [clickedColumnName, setClickedColumnName] = useState<string>("");
  const [modalObject, setModalObject] = useState<any>({})
  const [ tempImportData  ,setTempImportData] = useState<any[]>([]);
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const mappedColumns = columns.map((col) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,

      handleSave: (updatedRecord) => {

        setModifiedDataSource((prevDataSource) => {
          // Function to recursively update the modifiedDataSource
          const updateRecordRecursively = (rows, updatedRecord) => {
            return rows.map((row) => {
              if (row.ID === updatedRecord.ID) {
                // Replace the row with the updatedRecord if IDs match
                return { ...row, ...updatedRecord };
              }
              // If the row has children, recursively update them
              if (row.children && row.children.length > 0) {
                return {
                  ...row,
                  children: updateRecordRecursively(row.children, updatedRecord),
                };
              }
              return row;
            });
          };

          // Update the modifiedDataSource by replacing the updated record
          return updateRecordRecursively(prevDataSource, updatedRecord);
        });
      },

      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      showSlider: col.showSlider,
    }),
  }));


const sumNumericFieldsRecursively = (item) => {
  let summedData = {};

  // Sum numeric properties of the current item
  Object.keys(item).forEach((key) => {
    if (typeof item[key] === "number") {
      summedData[key] = (summedData[key] || 0) + item[key];
    }
  });

  // If there are children, sum their numeric fields recursively
  if (item.children && item.children.length > 0) {
    item.children.forEach((child) => {
      const childSums = sumNumericFieldsRecursively(child);

      // Add the child's sums to the current item's sums
      Object.keys(childSums).forEach((key) => {
        summedData[key] = (summedData[key] || 0) + childSums[key];
      });
    });

    // Explicitly assign the summed numeric fields (like Revenue) to the parent object
    Object.keys(summedData).forEach((key) => {
      if (typeof item[key] !== "number") {
        item[key] = summedData[key]; // Assign summed revenue from children to the parent
      }
    });
  }

  return summedData;
};

useEffect(() => {
  const data = prepareData().map((company) => {
    let summedData = {};

    // If the company has children, sum their numeric fields recursively
    if (company.children && company.children.length > 0) {
      summedData = sumNumericFieldsRecursively(company);

      // Ensure that the summed numeric fields (e.g., Revenue) are applied to the company itself
      return {
        ...company,
        ...summedData,  // Apply summed numeric fields (like Revenue) back to the company
        children: company.children.map(child => ({
          ...child,
        }))
      };
    }

    // If there are no children, return the company as it is
    return company;
  });

  setFetchedDataSource(data);
  setModifiedDataSource(data);
}, []);


const sumAccordingly = (data) => {
  const myData = data.map((company) => {
    let summedData = {};

    // If the company has children, sum their numeric fields recursively
    if (company.children && company.children.length > 0) {
      summedData = sumNumericFieldsRecursively(company);

      // Ensure that the summed numeric fields (e.g., Revenue) are applied to the company itself
      return {
        ...company,
        ...summedData,  // Apply summed numeric fields (like Revenue) back to the company
        children: company.children.map(child => ({
          ...child,
        }))
      };
    }

    // If there are no children, return the company as it is
    return company;
  });
  setModifiedDataSource(myData)
} 


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
           // setModifiedDataSource(result.data);
           sumAccordingly( convertData(result.data))
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

  console.log("tempImportData",tempImportData);


  useEffect(() => {
    if (fetchedDataSource.length >= 1) {
      const firstRecord = fetchedDataSource[0];
      const dynamicColumns = Object.keys(firstRecord)
        .filter((key) => key !== "children") // Exclude 'children' as it's nested data
        .map((key) => ({
          title: key.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to space-separated words
          dataIndex: key,
          key,
          render: (value: any) => {
            if (typeof value === "number") {
              // Format numbers, and default undefined values to $0.00
              return value !== undefined ? `${value.toFixed(2)}` : `$0.00`;
            }
            if (typeof value === "string") {
              return value;
            }
            return value !== undefined ? String(value) : 'N/A'; // Handle any other data type
          },
        }));
      setColumns(dynamicColumns);
    }
  }, [fetchedDataSource]);
  useEffect(() => {
    switch (modalObject.selectedRadio) {
      case ARRAY_RADIO[0]: {
        blankForecast()
      }
        break;
      case ARRAY_RADIO[1]: {
        // futureForecast()
        futureforacstbyvicky()
      }
        break;
      case ARRAY_RADIO[2]: {
        existingForecast()
      }
        break;
      case ARRAY_RADIO[3]: { }
        break;
      default: { }
    }
  }, [modalObject, clickedColumnName]);
  const handleModalSubmit = (obj: any) => {
    setModalObject(obj)
    if (obj.selectedColumn) {
      setClickedColumnName(obj.selectedColumn)
    }
  };
  const onRemoveButtonClicked = (key: string) => {
    setColumns((prevColumns) => {
      const filteredColumns = prevColumns.filter((col) => col.key !== key);
      return filteredColumns;
    });
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        const { [key]: _, ...rest } = row;
        return rest;
      })
    );
  };
  const blankForecast = () => {
    // Check if modalObject and dateRange exist and are valid
    if (!modalObject || !modalObject.dateRange) {
      return;
    }
  
    const forecastRange = modalObject.dateRange;
    const years = forecastRange[1].year() - forecastRange[0].year() + 1;
    const forecasts = Array(years).fill(0); // Create an array of 0 forecasts
    const updatedColumns = [...columns];
  
    Array.from({ length: years }, (_, index) => {
      const columnYear = forecastRange[0].year() + index; // Get the year for each column
      const columnKey = `${modalObject.inputTitle}(${columnYear})`; // Create the unique column key
  
      const columnExists = updatedColumns.some((existingCol) => existingCol.key === columnKey);
      if (!columnExists) {
        // If column does not exist, add it
        const newCol = {
          key: columnKey,
          forecastValue: forecasts[index], // Use forecast value at the current index
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span>{columnKey}</span>
              </div>
              <Button
                type="link"
                icon={<MinusOutlined />}
                onClick={() => onRemoveButtonClicked(columnKey)}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
          dataIndex: columnKey,
          editable: true,
          width: '20%',
        };
        updatedColumns.push(newCol);
      }
    });
  
    setColumns(updatedColumns); // Update the columns state
  
    // Update the dataSource by adding the new forecast fields for each row
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        const newRow = { ...row };
  
        Array.from({ length: years }, (_, index) => {
          const columnYear = forecastRange[0].year() + index; // Get the year for the column
          const columnKey = `${modalObject.inputTitle}(${columnYear})`; // Column key
          newRow[columnKey] = forecasts[index]; // Set forecast value to 0 (from the forecasts array)
        });
  
        return newRow; // Return the updated row
      })
    );
  };
  

  const existingForecast = () => {
    // Check if modalObject and selectedColumn exist and are valid
    if (!modalObject || !modalObject.selectedColumn) {
      return;
    }

    const selectedColumn = modalObject.selectedColumn;
    const updatedColumns = [...columns];
    const columnKey = `${modalObject.inputTitle}(${selectedColumn})`;

    // Check if the column already exists
    const columnExists = updatedColumns.some((existingCol) => existingCol.key === columnKey);

    // If the column does not exist, add a new one
    if (!columnExists) {
      const newCol = {
        key: columnKey,
        title: (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              <span>{columnKey}</span>
            </div>
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(columnKey)}
              style={{ marginLeft: 8 }}
            />
          </div>
        ),
        dataIndex: columnKey,
        editable: true,
        width: '20%',
      };

      // Add the new column to the updated columns array
      updatedColumns.push(newCol);
    }
    setColumns(updatedColumns);

    // Recursive function to copy selectedColumn's value to the new columnKey
    const updateRowWithNewColumn = (row, selectedColumn, columnKey) => {
      // Copy the selected column's value to the new column key
      row[columnKey] = row[selectedColumn];

      // If the row has children, recursively update them as well
      if (row.children && row.children.length > 0) {
        row.children = row.children.map((child) => updateRowWithNewColumn(child, selectedColumn, columnKey));
      }

      return row;
    };

    // Update the modifiedDataSource with new keys recursively
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => updateRowWithNewColumn(row, selectedColumn, columnKey))
    );
  }
 
  const forecastMultipleYears = (year2023: string, year2022: string, years: number): number[] => {
    const forecasts: number[] = [];
    const value2023 = parseFloat(year2023);
    const value2022 = parseFloat(year2022);

    if (isNaN(value2023) || isNaN(value2022) || value2023 === 0) {
      return Array(years).fill(0); // Return an array filled with zero if data is invalid
    }

    const growthRate = (value2023 - value2022) / value2022; // Calculate growth rate
    forecasts.push(parseFloat((value2023 * (1 + growthRate)).toFixed(2))); // First forecast year

    // Calculate subsequent forecasts
    for (let i = 1; i < years; i++) {
      const nextForecast = parseFloat((forecasts[i - 1] * (1 + growthRate)).toFixed(2));
      forecasts.push(nextForecast); // Push next forecast to array
    }

    return forecasts; // Return the forecast array
  };
  const futureforacstbyvicky = () => {
    // Check if modalObject and dateRange exist and are valid
    if (!modalObject || !modalObject.dateRange) {
      return;
    }

    const forecastRange = modalObject.dateRange;
    const years = forecastRange[1].year() - forecastRange[0].year() + 1; // Number of years to forecast
    const updatedColumns = [...columns];

    // Create forecast columns
    Array.from({ length: years }, (_, index) => {
      const columnYear = forecastRange[0].year() + index; // Get year for each forecast
      const columnKey = `${modalObject.inputTitle}(${columnYear})`; // Create the dynamic column name

      // Check if column exists already
      const columnExists = updatedColumns.some((existingCol) => existingCol.key === columnKey);

      if (!columnExists) {
        const newCol = {
          key: columnKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <span>{columnKey}</span>
              <Button
                type="link"
                icon={<MinusOutlined />}
                onClick={() => onRemoveButtonClicked(columnKey)}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
          dataIndex: columnKey,
          editable: true,
          width: '20%',
        };
        updatedColumns.push(newCol);
      }
    });

    setColumns(updatedColumns); // Set updated columns

    // Update data source by forecasting values and adding new properties for each year
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => updateKeysRecursively(row, modalObject.inputTitle, years))
    );
  };
  const updateKeysRecursively = (row, prefix, years) => {
    const newRow = { ...row };

    // Find last two numerical revenue values
    const revenueKeys = Object.keys(row).filter(key => ( key.includes('Revenue') && typeof row[key] === 'string' )   ||  ( key.includes('Revenue') && typeof row[key] === 'number' )   ) ;

    if (revenueKeys.length >= 2) {
      const lastRevenue = row[revenueKeys[0]]; // Latest revenue
      const secondLastRevenue = row[revenueKeys[1]]; // Previous revenue

      // Forecast values based on the last two revenue entries
      const forecastValues = forecastMultipleYears(secondLastRevenue.toString(), lastRevenue.toString(), years);

      // Add forecast values to the new row based on the column keys (years)
      forecastValues.forEach((forecast, index) => {
        const columnKey = `${prefix}(${modalObject.dateRange[0].year() + index})`;
        newRow[columnKey] = forecast; // Assign the forecast value to the columnKey
      });
    }

    // Recursively update keys for children
    Object.keys(row).forEach((key) => {
      if (key !== "ID" && key !== "CompanyName" || "ParentCompany" ) {
        const newKey = `${prefix}(${key})`;

        if (Array.isArray(row[key])) {
          // Recursively update the children
          newRow[key] = row[key].map((child) => updateKeysRecursively(child, prefix, years));
        } else if (typeof row[key] === 'object' && row[key] !== null) {
          // If it's a nested object, recursively update its properties
          newRow[newKey] = updateKeysRecursively(row[key], prefix, years);
        } else {
          // For other fields, update the key with the prefix
          // newRow[newKey] = row[key];
        }
      }
    });

    return newRow;
  };
  const flattenHierarchy = (row, parentId = '', result = []) => {
    // Create a copy of the row to avoid mutating the original object
    const currentRow = { ...row };
    delete currentRow.children; // Remove the children property for the current row

    // Define the important fields to check for values
    const importantFields = ['Revenue', 'Revenue2022'];

    // Check if important fields have values, skip if all are empty
    const hasImportantValues = importantFields.some(field => row[field] !== undefined && row[field] !== '');

    if (!hasImportantValues) {
      // Skip this row if none of the important fields are populated
      return result;
    }

    if (parentId) {
      currentRow.ID = `${parentId}.${currentRow.ID}`; // Append parent ID to create hierarchical structure
    }

    result.push(currentRow); // Add the current row to the result array

    // If there are children, recursively process each child
    if (row.children && Array.isArray(row.children)) {
      row.children.forEach((child) => {
        flattenHierarchy(child, currentRow.ID, result); // Recursively flatten child rows
      });
    }

    return result;
  };
  const convertToCSV = (data) => {
    // Helper function to flatten the JSON structure
    function flattenData(data) {
      const result = [];

      const flatten = (item) => {
        // Create a flat item excluding 'children'
        const { children, ...flatItem } = item; // Destructure to remove 'children'
        result.push(flatItem); // Push the flat item to the result

        // Recursively flatten children if they exist
        if (children) {
          children.forEach(child => flatten(child)); // No need for ParentID
        }
      };

      data.forEach(item => flatten(item));
      return result;
    }

    // Convert to CSV format
    function arrayToCsv(data) {
      const csvRows = [];
      const headers = Array.from(new Set(data.flatMap(Object.keys))); // Dynamically get all unique headers
      csvRows.push(headers.join(',')); // Add header row

      data.forEach(row => {
        const values = headers.map((header: any) => {
          const escapedValue = ('' + (row[header] !== undefined ? row[header] : '')).replace(/"/g, '""'); // Escape double quotes
          return `"${escapedValue}"`; // Enclose in quotes
        });
        csvRows.push(values.join(','));
      });
      return csvRows.join('\n');
    }

    const flattenedData = flattenData(data);
    const csv = arrayToCsv(flattenedData);
    return csv; // Return the CSV string
  };
  const handleDownload = (modifiedDataSource, host, exportDataCb) => {

    // Check if dataSource exists and is not empty
    if (!modifiedDataSource || modifiedDataSource.length === 0) {
      console.error("Data source is empty. Nothing to download.");
      return;
    }
    // Prepare data to be downloaded
    const dataToDownload = modifiedDataSource.map((row) => ({
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


    const downloadService = host.downloadService; // Ensure `host` is passed as a prop from Power BI


    if (downloadService && typeof downloadService.downloadBlob === 'function') {
      // Use the service to download the CSV file
      downloadService.downloadBlob(blob, "forecasting_data.csv");
      console.log("Download triggered successfully");
    } else {
      console.error("Download service is not available.");
    }
  };
  console.log(modifiedDataSource, "  console.log(modifiedDataSource)")
  return (
    <div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center', margin:'10px 10px'}}>
      <Button
        className="button-style"
     
        onClick={() => setPopUpVisible(true)}>
        Forecast
      </Button>
      <Button className='button-style' onClick={() => handleDownload(modifiedDataSource, host, exportDataCb)}  >
        Download
      </Button>

              <Upload
                  beforeUpload={handleFileUpload} // Handle file upload before submitting
                  accept=".csv,.xlsx,.xls" // Accept only CSV and Excel files
                  showUploadList={false} // Hide upload list
                >
                  <Button className="button-style">Import</Button>
                </Upload>
            
</div>
      <Table
        bordered
        
        components={components}
        className="custom-table hide-scrollbar"
        dataSource={modifiedDataSource}
        columns={mappedColumns as ColumnTypes}
        pagination={{
          total: modifiedDataSource.length,
          position: ["bottomRight"],
          showSizeChanger: false,
          itemRender: (_, type, originalElement) => {
            if (type === "prev") {
              return <LeftOutlined />;
            }
            if (type === "next") {
              return <RightOutlined />;
            }
            return originalElement;
          },
        }}
        rowKey="ID"
        scroll={{ x: "max-content", y: 400 }}
      />
      {
        isPopUpVisible ?
          <PopupModal
            availableColumns={columns}
            onClose={() => setPopUpVisible(false)}
            onSubmit={handleModalSubmit}
          /> : <></>
      }
    </div>
  )
}

export default Forcasting








