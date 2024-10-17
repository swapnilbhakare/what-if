

//through abhishek bhai
import * as React from "react";
import "../../src/forcast.css"
import { Dayjs } from 'dayjs';
import { useContext, useEffect, useRef, useState, createContext } from "react";
import { SiCodeforces } from "react-icons/si";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import Papa from "papaparse"
import { columns, prepareData } from './../data'
import { EditableCellProps, EditableContext, Item, EditableRow, EditableCell } from './EditableCellForecast'
import {
  MinusOutlined, LeftOutlined, RightOutlined
} from "@ant-design/icons";
import {
  DatePicker,
  TableProps, Button, Table
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
const Forcasting: React.FC<ForecastingProps> = ({
}) => {
  const [columns, setColumns] = useState<any[]>([]);
  const [fetchedDataSource, setFetchedDataSource] = useState<any[]>([]);
  const [modifiedDataSource, setModifiedDataSource] = useState<any[]>([]);
  //popup related
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [clickedColumnName, setClickedColumnName] = useState<string>("");
  const [modalObject, setModalObject] = useState<any>({})
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
      },
      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      showSlider: col.showSlider,
    }),
  }));
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
    const forecasts = Array(years).fill(0);
    const updatedColumns = [...columns];
    Array.from({ length: years }, (_, index) => {
      const columnYear = forecastRange[0].year() + index;
      const columnKey = `${modalObject.inputTitle}(${columnYear})`;
      const columnExists = updatedColumns.some((existingCol) => existingCol.key === columnKey);
      if (!columnExists) {
        const newCol = {
          key: columnKey,
          forecastValue: forecasts[index], // Using forecast value at the current index
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
    setColumns(updatedColumns);
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Recursively update the keys in the data source
        const newRow = updateKeysRecursively1(row, modalObject.inputTitle);
        return newRow;
      })
    );
  };
  const existingForecast = () => {
    // Check if modalObject and dateRange exist and are valid
    if (!modalObject || !modalObject.selectedColumn) {
      return;
    }
    const selectedColumn = modalObject.selectedColumn
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
        dataIndex: selectedColumn,
        editable: true,
        width: '20%',
      };

      // Add the new column to the updated columns array
      updatedColumns.push(newCol);
    }
    setColumns(updatedColumns);
    // Update the modifiedDataSource with new keys (if applicable)
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Recursively update the keys in the data source
        const newRow = updateKeysRecursively1(row, modalObject.inputTitle);
        return newRow;
      })
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
    const revenueKeys = Object.keys(row).filter(key => key.includes('Revenue') && typeof row[key] === 'number');

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
      if (key !== "ID" && key !== "CompanyName") {
        const newKey = `${prefix}(${key})`;

        if (Array.isArray(row[key])) {
          // Recursively update the children
          newRow[key] = row[key].map((child) => updateKeysRecursively(child, prefix, years));
        } else if (typeof row[key] === 'object' && row[key] !== null) {
          // If it's a nested object, recursively update its properties
          newRow[newKey] = updateKeysRecursively(row[key], prefix, years);
        } else {
          // For other fields, update the key with the prefix
          newRow[newKey] = row[key];
        }
      }
    });

    return newRow;
  };

  // Console log to check modified data source
  console.log(modifiedDataSource, "ModifiedDataSource");


  const updateKeysRecursively1 = (row, prefix) => {
    const newRow = { ...row };

    Object.keys(row).forEach((key) => {
      if (key !== "ID" && key !== "CompanyName") {
        const newKey = `${prefix}(${key})`;

        // If the value is an array (children), do not create a new children, just update the existing ones
        if (Array.isArray(row[key])) {
          // Recursively update the children
          newRow[key] = row[key].map((child) => updateKeysRecursively1(child, prefix));
        } else if (typeof row[key] === 'object' && row[key] !== null) {
          // If it's a nested object, recursively update its properties
          newRow[newKey] = updateKeysRecursively1(row[key], prefix);
        } else {
          // For other fields, update the key with the prefix (modalObject.inputTitle)
          newRow[newKey] = ""//row[key];
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
  console.log(modifiedDataSource, "  console.log(modifiedDataSource)")
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          className="button-style"
          style={{ margin: "10px 10px" }}
          onClick={() => setPopUpVisible(true)}>
          Forecaste
        </Button>
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








