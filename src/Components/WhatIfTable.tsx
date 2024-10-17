/* eslint-disable max-lines-per-function */
import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "./whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { message, Pagination, Upload } from 'antd';
import { PopupModal, WhatIfParameterType, WhatIfSimulationObject, ARRAY_RADIO } from "./PopUpWindow"
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, EditOutlined, ShrinkOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { columns, prepareData } from './../data'
import { EditableCellProps, EditableContext, Item, EditableRow, EditableCell } from './whatifold'
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import Papa from "papaparse"
//row selection 
const EditableContext1 = React.createContext(null);

// EditableRow component
const EditableRow1: React.FC<any> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface whatifProps {
  host: any;
  options1: any;
  dataView: any;
  exportDataCb: any;
  formattingSettings: any;
  target: any;
}




const WhatIfTable: React.FC<whatifProps> = ({host,exportDataCb}) => {
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
      handleSave: (updatedRecord, updatedChildren) => {
        console.log(updatedRecord, updatedChildren);
        // Function to update the modifiedDataSource with the new value
        const updateDataSourceWithParent = (dataSource, updatedRec) => {
          return dataSource.map((item) => {
            if (item["ID"] === updatedRec["ID"]) {
              console.log("IF")
              // If the record is found, update it directly with new children
              return {
                ...updatedRec,
                children: updatedChildren,
              };
            } else if (item.children && item.children.length > 0) {
              console.log("else if")
              // Recursively update child records
              const updatedChildren = updateDataSourceWithParent(item.children, updatedRec);
              // Store the parent's original revenue for correct percentage calculation
              const extractedPropertyName =
                typeof col.dataIndex === "string" && col.dataIndex.includes("(")
                  ? col.dataIndex.split("(")[1].replace(")", "")
                  : "";
              const originalParentRevenue = parseFloat(item[extractedPropertyName]) || 0;

              // Recalculate parent's total revenue as the sum of all children revenues
              const totalChildRevenue = updatedChildren.reduce(
                (sum, child) => sum + parseFloat(child[col.dataIndex] || "0"),
                0
              );
              console.log(item)
              // Calculate percentage change for the parent based on the original revenue
              const parentPercentageChange = calculatePercentageChange(totalChildRevenue, originalParentRevenue);
              console.log(parentPercentageChange, item[col.dataIndex], col)
              // Return updated parent with recalculated total revenue and updated children
              return {
                ...item,
                [col.dataIndex]: totalChildRevenue.toFixed(2),  // Update parent's revenue
                [`percentageChange_${col.dataIndex}`]: `${parentPercentageChange.toFixed(2)}%`, // Update parent's percentage change
                children: updatedChildren,  // Updated children
              };
            }
            return item;  // Return unchanged item
          });
        };
        const updateDataSourceWithParticularParent = (dataSource, updatedRec) => {
          const newDataSource = [...dataSource]; // Shallow copy of the data source

          // Find the record that matches the updated record's ID
          const recordIndex = newDataSource.findIndex((item) => item["ID"] === updatedRec["ID"]);
          if (recordIndex !== -1) {
            newDataSource[recordIndex] = {
              ...newDataSource[recordIndex],
              ...updatedRec, // Update only the fields from updatedRec
              children: updatedChildren, // Update children for this particular record
            };
          }
          return newDataSource; // Return the updated data source
        };
        // Recursively update the data source with the new record and adjusted hierarchy
        let newModifiedDataSource
        if (modalObject.selectedRadio == ARRAY_RADIO[1]) {
          newModifiedDataSource = updateDataSourceWithParent(modifiedDataSource, updatedRecord)
        } else {
          newModifiedDataSource = updateDataSourceWithParent(modifiedDataSource, updatedRecord)
        }
        // Update the state with the new data source
        setModifiedDataSource(newModifiedDataSource);
      },
      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      showSlider: col.showSlider,
    }),
  }));


  // Function to calculate the percentage change
  const calculatePercentageChange = (newValue: number, baseValue: number): number => {
    return baseValue === 0 ? 0 : ((newValue - baseValue) / baseValue) * 100;
  };



  useEffect(() => {
    const data = prepareData().map((company) => {
      // Check if any property in 'company' is an array (dynamic detection of children-like properties)
      const nestedArrayKey = Object.keys(company).find(
        (key) => Array.isArray(company[key])
      );
      let summedData = {};
      // Ensure that the array exists and is not empty before trying to reduce
      if (nestedArrayKey && company[nestedArrayKey].length > 0) {
        summedData = company[nestedArrayKey].reduce((acc: any, item: any) => {
          Object.keys(item).forEach((key) => {
            // Sum only numeric fields dynamically, defaulting to 0 if undefined
            if (typeof item[key] === "number") {
              acc[key] = (acc[key] || 0) + (item[key] || 0);
            }
          });
          return acc;
        }, {});
      }
      // Return company data with dynamically calculated sums, ensuring undefined values are handled
      return {
        ...company,
        ...Object.keys(summedData).reduce((acc, key) => {
          acc[key] = summedData[key] !== undefined ? summedData[key] : 0; // Ensure no undefined values
          return acc;
        }, {}),
      };
    });

    setFetchedDataSource(data);
    setModifiedDataSource(data);
  }, []);

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
            setModifiedDataSource(result.data);
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
    console.log(clickedColumnName, "Clicked Col in useEffect")
    switch (modalObject.selectedRadio) {
      case ARRAY_RADIO[0]: {
        editCellDirectly()
      }
        break;
      case ARRAY_RADIO[1]: {
        singleColumnSlider()
      }
        break;
      case ARRAY_RADIO[2]: {
        multiColumnSlider()
      }
        break;
      case ARRAY_RADIO[3]: { }
        break;
      default: { }
    }
  }, [modalObject, clickedColumnName]);

  const updateKeysRecursively = (row, prefix) => {
    console.log(row, prefix, "1291")
    const newRow = { ...row };
    Object.keys(row).forEach((key) => {
      if (key !== "ID" && key !== "CompanyName") {
        const newKey = `${prefix}(${key})`;

        // If the value is an array (children), do not create a new children, just update the existing ones
        if (Array.isArray(row[key])) {
          // Recursively update the children
          newRow[key] = row[key].map((child) => updateKeysRecursively(child, prefix));
        } else if (typeof row[key] === 'object' && row[key] !== null) {
          // If it's a nested object, recursively update its properties
          newRow[newKey] = updateKeysRecursively(row[key], prefix);
        } else {
          // For other fields, update the key with the prefix (modalObject.inputTitle)
          newRow[newKey] = row[key];
        }
      }
    });

    return newRow;
  };

  const handleModalSubmit = (obj: any) => {
    console.log("Popup object", obj);
    setModalObject(obj)
    if (obj.selectedColumn) {
      setClickedColumnName(obj.selectedColumn)
    }
  };

  const onRemoveButtonClicked = (key: string) => {
    // Remove the column from the columns state
    setColumns((prevColumns) => {
      const filteredColumns = prevColumns.filter((col) => col.key !== key);
      return filteredColumns;
    });

    // Recursively update the data source to remove both the revenue and the percentage columns
    const removeColumnFromDataSource = (dataSource: any[]) => {
      return dataSource.map((row) => {
        const { [key]: _, [`percentageChange_${key}`]: __, ...rest } = row;

        // If the row has children, recursively remove the column from the children as well
        if (row.children && row.children.length > 0) {
          return {
            ...rest,
            children: removeColumnFromDataSource(row.children),
          };
        }

        // Return the updated row without the column and percentage change
        return rest;
      });
    };

    // Update the modifiedDataSource to remove the column data
    setModifiedDataSource((prevDataSource) => removeColumnFromDataSource(prevDataSource));
  };

  const editCellDirectly = () => {
    const updatedColumns = [];
    columns.forEach((col) => {
      updatedColumns.push(col);
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') return;
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span>{newColKey}</span>
              </div>
              <Button
                type="link"
                icon={<MinusOutlined />}
                onClick={() => onRemoveButtonClicked(newColKey)}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
          dataIndex: newColKey,
          editable: true,
          width: '20%',
        };
        updatedColumns.push(newCol);
      }
    });
    // Update columns state with the newly added columns
    setColumns(updatedColumns);
    // Update the modifiedDataSource after adding the new column
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Recursively update row keys with the modal input title for both parents and children
        const newRow = updateKeysRecursively(row, modalObject.inputTitle);
        return newRow;
      })
    );
  };
  const multiColumnSlider = () => {
    const updatedColumns = [];
    columns.forEach((col) => {
      updatedColumns.push(col);
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') return;
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span style={{ display: 'block' }} >{newColKey}</span>
              </div>
              <Button
                type="link"
                icon={<MinusOutlined />}
                onClick={() => onRemoveButtonClicked(newColKey)}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
          dataIndex: newColKey,
          width: '20%',
          editable: true,
          minValue: modalObject.sliderMinimumValue,
          maxValue: modalObject.sliderMaximumValue,
          stepValue: modalObject.sliderIncrementByValue,
          copy: modalObject.copyPreviousData,
          showSlider: true//modalObject.showSlider
        };
        updatedColumns.push(newCol);
      }
    });
    // Update columns state with the newly added columns
    setColumns(updatedColumns);
    // Update the modifiedDataSource after adding the new column
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Recursively update row keys with the modal input title for both parents and children
        const newRow = updateKeysRecursively(row, modalObject.inputTitle);
        return newRow;
      })
    );
  };
  const singleColumnSlider = () => {
    if (clickedColumnName) {
      console.log("Clicked Column Name has been updated:", clickedColumnName, modalObject);
      const selectedColumn = modalObject.selectedColumn;
      const newColumnKey = `Scenario ${columns.length + 1}`;
      const newColumnDataIndex = `${modalObject.inputTitle}(${selectedColumn})`;

      const newColumn = {
        key: newColumnDataIndex,
        title: (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              <span style={{ display: 'block' }} >{newColumnDataIndex}</span>
            </div>
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(newColumnDataIndex)}
              style={{ marginLeft: 8 }}
            />
          </div>
        ),
        dataIndex: newColumnDataIndex,
        width: '20%',
        editable: true,
        minValue: modalObject.sliderMinimumValue,
        maxValue: modalObject.sliderMaximumValue,
        stepValue: modalObject.sliderIncrementByValue,
        copy: modalObject.copyPreviousData,
        showSlider: modalObject.showSlider
      };
      setColumns((prevColumns) => [...prevColumns, newColumn]);
      setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
          const newValue = modalObject.copyPreviousData ? row[selectedColumn] : '0';
          console.log("New value: ", modalObject.copyPreviousData, selectedColumn, row[selectedColumn], newValue)
          const newRow = updateKeysRecursively(row, modalObject.inputTitle);
          return newRow;
          // return {
          //   ...row,
          //   [newColumnDataIndex]: newValue,
          // };
        })
      );
    }
  }

 


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
            const values = headers.map((header :any) => {
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
    console.log("Download initiated");
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


  console.log("modifieddta in whatif", modifiedDataSource);

  return (
    <div>
      <Button
        className="button-style"
        style={{ margin: "10px 10px" }}
        onClick={() => setPopUpVisible(true)}>
        What-If
      </Button>
      <Button className='button-style' onClick={() => handleDownload(modifiedDataSource, host, exportDataCb)}  >
          Export
        </Button>
        {/* <Upload
                  beforeUpload={handleFileUpload} 
                  accept=".csv,.xlsx,.xls" 
                  showUploadList={false} 
                >
                  <Button className="button-style">Import</Button>
                </Upload> */}
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


type ColumnTypes = Exclude<TableProps["columns"], undefined>;

export default WhatIfTable;

