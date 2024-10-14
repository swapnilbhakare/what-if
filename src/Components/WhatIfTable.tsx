/* eslint-disable max-lines-per-function */
import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "./whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { Pagination } from 'antd';
import { PopupModal, WhatIfParameterType, WhatIfSimulationObject, ARRAY_RADIO } from "./PopUpWindow" 
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, EditOutlined, ShrinkOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

// Context for editable cells
const EditableContext = createContext<any | null>(null);
interface Item {
  key: string;
  companyName: string;
  year2022: string;
  year2023: string;
  year2024: string;
  percentageChange?: string;
  minValue: any;
  maxValue: any;
  stepValue: any;
  copy: any;
}
interface EditableRowProps {
  index: number;
}
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}; 
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  minValue: number;
  maxValue: number;
  stepValue: number;
  copy: boolean;
  showSlider: boolean;
  handleSave: (record: Item) => void;
}
const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  showSlider,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState<number>(parseFloat(String(record?.[dataIndex] || "0")));
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>(String(record?.[dataIndex] || "0"));
  const [inputError, setInputError] = useState<string | null>(null);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  const extractedPropertyName =
    typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";
  const dataValue = parseFloat(record?.[extractedPropertyName] || "0");
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;
  let calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  let calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));
 
  useEffect(() => {
    if (!copy) {
      setSliderValue(calculatedMinSliderValue);
    }
  }, [copy, calculatedMinSliderValue]);
  useEffect(() => {
    setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
    setTextValue(String(record?.[dataIndex] || "0"));
  }, [record, dataIndex]);
  const calculatePercentageChange = (newValue: number, baseValue: number): number => {
    return baseValue === 0 ? 0 : ((newValue - baseValue) / baseValue) * 100;
  };
  const calculateValue = (inputText: string): number => {
    const operators: string[] = [];
    const values: number[] = [];
    let i = 0;

    const applyOperator = () => {
      const operator = operators.pop();
      const b = values.pop();
      const a = values.pop();

      if (operator === '+') values.push(a + b);
      else if (operator === '-') values.push(a - b);
      else if (operator === '*') values.push(a * b);
      else if (operator === '/') values.push(a / b);
    };

    const getValueWithSuffix = (numStr: string): number => {
      let value = parseFloat(numStr);
      if (numStr.endsWith('k')) value *= 1_000;
      else if (numStr.endsWith('m')) value *= 1_000_000;
      else if (numStr.endsWith('cr')) value *= 10_000_000;
      else if (numStr.endsWith('%')) value = (value / 100) * (values.length ? values[values.length - 1] : 0);
      return value;
    };

    while (i < inputText.length) {
      if (inputText[i] === ' ') {
        i++;
        continue;
      }

      if (/\d|\./.test(inputText[i])) {
        let numStr = '';
        while (i < inputText.length && (/\d|\./.test(inputText[i]) || /[kKmMcrCR%]/.test(inputText[i]))) {
          numStr += inputText[i++];
        }
        const value = getValueWithSuffix(numStr.toLowerCase());
        values.push(value);
      } else if (/[+\-*/]/.test(inputText[i])) {
        const currentOperator = inputText[i];
        while (
          operators.length > 0 &&
          (currentOperator === '+' || currentOperator === '-') &&
          (operators[operators.length - 1] === '*' || operators[operators.length - 1] === '/')
        ) {
          applyOperator();
        }
        operators.push(currentOperator);
        i++;
      }
    }

    while (operators.length > 0) {
      applyOperator();
    }

    return values.length > 0 ? parseFloat(values[0].toFixed(2)) : 0;
  };
  const handleSliderChange = (value: number) => {
    console.log(calculatedMaxSliderValue,
calculatedMinSliderValue)
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(value, prevValue);

    setSliderValue(value);
    form.setFieldsValue({ [dataIndex]: `${value}` });

    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Updated regular expression to ensure letters are preceded by numbers
    const validInputRegex = /^(?:(?:\d+(?:\.\d+)?)(?:[kKmMcrCR])?|(?:\d+(?:\.\d+)?)(?:[+\-*/])?)+$/;


    // Check if input matches the regex
    if (!validInputRegex.test(newValue)) {
      setInputError('Invalid input: Only numbers followed by k, K, m, M, cr, +, -, *, / are allowed');
      return; // Exit early if input is invalid
    }


    // Update textValue to reflect valid user input
    //setTextValue(newValue);
    setTextValue(newValue);
    try {
      calculateValue(newValue);
      setInputError(null); // No error if valid
    } catch (error) {
      setInputError('Invalid input'); // Set error message if invalid
    }
  };
  const handleSaveOnBlurOrEnter = () => {
    const calculatedValue = calculateValue(textValue);
    const percentage = calculatePercentageChange(calculatedValue, dataValue);
    console.log("DataVal/CalcVal", dataValue, calculatedValue)

    setSliderValue(calculatedValue);

    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    handleSave({
      ...record,
      [dataIndex]: `${calculatedValue}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    });
    console.log(record, "On enter")
    setIsCellEditable(false);
  };
   // New onClick handler to detect ctrlKey press and log cell data
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      console.log(`Cell data (Ctrl+Click):`, record[dataIndex]);
    }
  };

  const popoverContent = (
    <div style={{ width: 150 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Slider
          min={calculatedMinSliderValue}
          max={calculatedMaxSliderValue}
          step={stepValue}
          value={sliderValue}
          onChange={handleSliderChange}
          style={{ width: "100%" }}
        />
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => {
            if (!copy) {
              console.log(dataValue, dataIndex);

              // Reset slider to 0 and update the record accordingly
              setSliderValue(0);
              handleSave({
                ...record,
                percentageChange: "0%", // Reset percentage change
                [`percentageChange_${dataIndex}`]: "0%",
                [dataIndex]: 0, // Set dataIndex value to 0
              });
            } else {
              // Set slider to original dataValue and update the record accordingly
              setSliderValue(dataValue);
              handleSave({
                ...record,
                percentageChange: "0%", // Keep percentage change as 0% or adjust if necessary
                [`percentageChange_${dataIndex}`]: "0%", // Reset percentage change
                [dataIndex]: dataValue,
              });
            }
          }}
          style={{ marginLeft: 8 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "12px", color: "#999" }}>
        <span>{calculatedMinSliderValue}</span>
        <span>{calculatedMaxSliderValue}</span>
      </div>
      <Input
        ref={inputRef}
        style={{ width: 100, marginTop: 8 }}
        onPressEnter={handleSaveOnBlurOrEnter}
        onBlur={handleSaveOnBlurOrEnter}
        type="text"
        value={textValue}
        onChange={handleInputChange}
      />
    </div>
  );
  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>

      {/* Retrieve the specific percentageChange from record */}
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {record && record[`percentageChange_${dataIndex}`] ? (
          parseFloat(record[`percentageChange_${dataIndex}`]) > 0 ? ( // Parse percentageChange as a number
            <span style={{ color: "green" }}>
              <ArrowUpOutlined /> {parseFloat(record[`percentageChange_${dataIndex}`]).toFixed(2)}%
            </span>
          ) : parseFloat(record[`percentageChange_${dataIndex}`]) < 0 ? ( // Parse percentageChange as a number
            <span style={{ color: "red" }}>
              <ArrowDownOutlined /> {parseFloat(record[`percentageChange_${dataIndex}`]).toFixed(2)}%
            </span>
          ) : (
            <span>{parseFloat(record[`percentageChange_${dataIndex}`]).toFixed(2)}%</span>
          )
        ) : (
          <span>0%</span>
        )}
      </span>

      {showSlider && (
        <Button
          type="link"
          icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setVisible((prev) => !prev);
          }}
          style={{ marginLeft: 8 }}
        />
      )}
    </div>
  );
  let childNode = children;
  if (editable) {
    childNode = (
      <div {...restProps} onClick={handleClick} style={{ }} className="insidediv">
        {/*(isCellEditable) ? (
          <input
            type="text"
            value={textValue}
            onChange={handleInputChange}
            onBlur={handleSaveOnBlurOrEnter}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveOnBlurOrEnter();
            }}
            style={{ width: "100%" }}
          />
        ) : (
          <div onDoubleClick={() => {
            if (!showSlider) {
              setIsCellEditable(true)
            }  
          }}>
            {formattedCellContent}
          </div>
        )*/}
        {isCellEditable ? (
          <input
            type="text"
            value={textValue}
            onChange={handleInputChange}
            onBlur={handleSaveOnBlurOrEnter}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveOnBlurOrEnter();
            }}
            style={{ width: "100%" }}
          />
        ) : (
          <div onDoubleClick={() => { if (!showSlider) { setIsCellEditable(true); } }}>
            {formattedCellContent}
          </div>
        )}
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        />
      </div>
    );
  }
  return <td {...restProps} style={{ padding: "4px" }}>{childNode || record[dataIndex]}</td>;
}; 

type ColumnTypes = Exclude<TableProps["columns"], undefined>;
const WhatIfTable1: React.FC = () => {
  // const [count, setCount] = useState(13);
  // const [isChanged, setIsChanged] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  // const [newColumn, setNewColumn] = useState({});
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [fetchedDataSource, setFetchedDataSource] = useState<any[]>([]);
  const [modifiedDataSource, setModifiedDataSource] = useState<any[]>([]);
  // State to hold the column name where the plus button was clicked
  const [clickedColumnName, setClickedColumnName] = useState<string>("");
  const [modalObject, setModalObject] = useState<any>({})
  // Fetch data from API
  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then((response) => response.json())
      .then((data) => {
        setFetchedDataSource(data);
        setModifiedDataSource(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
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
  const onRemoveButtonClicked1 = (key: string) => {
    setColumns((prevColumns) => {
        const filteredColumns = prevColumns.filter((col) => col.key !== key);
        return filteredColumns;
    });
    setModifiedDataSource((prevDataSource) => {
        // Remove the specified column
        const newDataSource = prevDataSource.map((row) => {
            const { [key]: _, ...rest } = row; // Remove the column from the row
            return rest;
        });

        // Recalculate total values for each row
        const newTotalColKey = `${modalObject.inputTitle}(Total)`; // Assuming you have a consistent naming for total columns
        return newDataSource.map((row) => {
            let total = 0;
            // Sum up the remaining relevant values
            Object.keys(row).forEach((colKey) => {
                // Exclude ID, CompanyName, and the total column itself
                if (colKey !== "ID" && colKey !== "CompanyName" && colKey !== newTotalColKey && colKey.includes(modalObject.inputTitle)) {
                    total += parseFloat(row[colKey] || 0);
                }
            });

            // Add or update the total in the row
            return {
                ...row,
                [newTotalColKey]: total.toFixed(2), // Format to 2 decimal places
                [`percentageChange_${newTotalColKey}`]: calculatePercentageChange
            };
        });
    });
  };

  const handleModalSubmit = (obj: any) => {
    console.log("Popup object", obj);
    setModalObject(obj)
    if(obj.selectedColumn) {
      setClickedColumnName(obj.selectedColumn)
    }
  };
  useEffect(() => {
    console.log(clickedColumnName, "Clicked Col in useEffect")
    switch(modalObject.selectedRadio) {
      case ARRAY_RADIO[0]: { 
        editCellDirectly() 
      }
      break;
      case ARRAY_RADIO[1]: { 
        simulationUsingSlider()
      }
      break;
      case ARRAY_RADIO[2]: { 

      }
      break;
      case ARRAY_RADIO[3]: {

      }
      break;
      default: {

      }
    }
    if (clickedColumnName) {
      console.log("Clicked Column Name has been updated:", clickedColumnName);
      const selectedColumn = modalObject.selectedColumn;
      const newColumnKey = `Scenario ${columns.length + 1}`;
      const newColumnDataIndex = `Scenario ${modalObject.name} (${selectedColumn})`;

      const newColumn = {
        key: newColumnKey,
        title: (
          <div style={{display:'flex', gap:'2px', alignItems:'center'}}>
                <div style={{display:'flex', gap:'1px'}}> <span style={{display:'block'}} >{modalObject.name}</span> <span  style={{display:'block'}}>({selectedColumn})</span></div> 
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(newColumnKey)}
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
          return {
            ...row,
            [newColumnDataIndex]: newValue,
          };
        })
      );
    }
  }, [modalObject, clickedColumnName]); 
  const simulationUsingSlider = () => {
    if (clickedColumnName) {
      console.log("Clicked Column Name has been updated:", clickedColumnName);
      const selectedColumn = modalObject.selectedColumn;
      const newColumnKey = `Scenario ${columns.length + 1}`;
      const newColumnDataIndex = `Scenario ${modalObject.name} (${selectedColumn})`;

      const newColumn = {
        key: newColumnKey,
        title: (
          <div style={{display:'flex', gap:'2px', alignItems:'center'}}>
                <div style={{display:'flex', gap:'1px'}}> <span style={{display:'block'}} >{modalObject.name}</span> <span  style={{display:'block'}}>({selectedColumn})</span></div> 
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(newColumnKey)}
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
          return {
            ...row,
            [newColumnDataIndex]: newValue,
          };
        })
      );
    }
  } 
  const editCellDirectly1 = () => { 
    console.log("Clicked Column Name has been updated:", clickedColumnName);
    
    const newColumns = columns.map((col) => {
      // Check if the column already exists to prevent duplicates
      if (col.title === `${col.title}(New)`) return col;
      
      // Create a new column for each existing column in modifiedDataSource
      const newColKey = `${col.dataIndex}(New)`;
      const newCol = {
        key: newColKey,
        title: (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              <span style={{ display: 'block' }}>{`${col.title} (New)`}</span>
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
        editable: true,  // Make sure this new column is editable
        width: '20%',
        minValue: 0,
        maxValue: 100,  // Set your desired range here
        stepValue: 1,
        showSlider: false, // No slider needed for this scenario
      };
      
      return newCol;
    });
    
    // Add all the new "New" columns to the table
    setColumns((prevColumns) => [...prevColumns, ...newColumns]);

    // Update the modifiedDataSource to include the "New" columns
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Add new values for each existing column with "(New)"
        const newRow = { ...row };
        Object.keys(row).forEach((key) => {
          if (key !== "ID" && !newRow[`${key}(New)`]) {
            newRow[`${key}(New)`] = "0"; // Initialize with 0 or copy from previous if needed
          }
        });
        return newRow;
      })
    );
    
    // setModifiedDataSource((prevDataSource) =>
    //   prevDataSource.map((row) => {
    //     // Add new values for each existing column with "(New)"
    //     const newRow = { ...row };
    //     let total = 0;

    //     Object.keys(row).forEach((key) => {
    //       if (key !== "ID" && !newRow[`${key}(New)`]) {
    //         const newValue = row[key] || 0;
    //         newRow[`${key}(New)`] = newValue; // Initialize with value or set to 0
    //         total += parseFloat(newValue);  // Sum the values
    //       }
    //     });

    //     // Add a total property to each row
    //     newRow["Total"] = total.toFixed(2); // Format to 2 decimal places
    //     return newRow;
    //   })
    // );
  };
  const editCellDirectly2 = () => {
    console.log("Clicked Column Name has been updated:", clickedColumnName); 
    const updatedColumns = []; 
    columns.forEach((col) => {
      // Add the original column to the updated columns list
      updatedColumns.push(col); 
      // Exclude certain columns like CompanyName and ID from having new columns
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') {
        return; // Skip these columns
      } 
      // Create a new column for each existing column in modifiedDataSource
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      console.log(col.dataIndex, "Col in loop")
      // Check if the new column already exists to prevent duplicates
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span style={{ display: 'block' }}>{newColKey}</span>
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
          editable: true,  // Ensure the new column is editable
          width: '20%',
          minValue: 0,
          maxValue: 100,  // Set your desired range here
          stepValue: 1,
          showSlider: false, // No slider needed for this scenario
        }; 
        // Add the new column right after its parent column
        updatedColumns.push(newCol);
      }
    }); 
    // Set updated columns
    setColumns(updatedColumns); 
    // Update the modifiedDataSource to include the "New" columns
    /*
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        // Add new values for each existing column with "(New)"
        const newRow = { ...row };
        Object.keys(row).forEach((key) => {
          // Exclude ID and CompanyName from having new columns
          if (key !== "ID" && key !== "CompanyName" && !newRow[`${key}(New)`]) {
            newRow[`${key}(New)`] = "0"; // Initialize with 0 or copy from previous if needed
          }
        });
        return newRow;
      })
    ); */
    // Optionally add "Total" column
    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => {
        const newRow = { ...row };
        let total = 0;

        Object.keys(row).forEach((key) => {
          // Exclude ID and CompanyName from being considered for the total
          if (key !== "ID" && key !== "CompanyName" && !newRow[`${key}(New)`]) {
            const newValue = row[key] || 0;
            newRow[`${key}(New)`] = newValue; // Initialize with value or set to 0
            total += parseFloat(newValue);  // Sum the values
          }
        });

        // Add a total property to each row
        newRow["Total"] = total.toFixed(2); // Format to 2 decimal places

        return newRow;
      })
    );
  }; 
  const editCellDirectly = () => {
    console.log("Clicked Column Name has been updated:", clickedColumnName);
    const updatedColumns = [];
    
    columns.forEach((col) => {
      // Add the original column to the updated columns list
      updatedColumns.push(col);

      // Exclude certain columns like CompanyName and ID from having new columns
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') return;

      // Create a new column for each existing column in modifiedDataSource
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      console.log(col.dataIndex, "Col in loop");

      // Check if the new column already exists to prevent duplicates
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span style={{ display: 'block' }}>{newColKey}</span>
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
          editable: true,  // Ensure the new column is editable
          width: '20%',
          minValue: 0,
          maxValue: 100,  // Set your desired range here
          stepValue: 1,
          showSlider: false, // No slider needed for this scenario
        };

        // Add the new column to the updated columns
        updatedColumns.push(newCol);
      }
    });

    // Add a new column for the new total
    const newTotalColKey = `${modalObject.inputTitle}(Total)`;
    // updatedColumns.push(newTotalColumn); // Add the new total column

    // Set updated columns
    setColumns(updatedColumns);

    // Function to update new total when a cell value is changed
    const updateNewTotal = (updatedRow) => {
      setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
          if (row.ID === updatedRow.ID) {
            // Recalculate the new total based on the newly updated values
            let newTotal = 0;

            // Sum only values from newly added columns (those including modalObject.inputTitle)
            Object.keys(row).forEach((key) => {
              if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
                newTotal += parseFloat(row[key] || 0);
              }
            });
            
            // Update the new total column for the row
            return {
              ...row,
              [newTotalColKey]: newTotal.toFixed(2), // Update the new total
            };
          }
          return row;
        })
      );
    };

    // Update the modifiedDataSource to include the new columns and recalculate totals
    setModifiedDataSource((prevDataSource) => 
      prevDataSource.map((row) => {
        const newRow = { ...row };
        let newTotal = 0;

        // Initialize new values for each existing column with the modal's input title
        Object.keys(row).forEach((key) => {
          if (key !== "ID" && key !== "CompanyName") {
            const newValue = row[key] || 0;
            const newColKey = `${modalObject.inputTitle}(${key})`;

            // Assign the value to the new column
            newRow[newColKey] = newValue;
          }
        });

        // Sum only the values from newly created columns (those containing modalObject.inputTitle)
        Object.keys(newRow).forEach((key) => {
          if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
            console.log(newTotalColKey, newTotal, key)
            newTotal += parseFloat(newRow[key] || 0);
          }
        });

        // Update the new total column for the row
        newRow[newTotalColKey] = newTotal.toFixed(2); // Format the total to 2 decimal places

        return newRow;
      })
    );
  };


  const calculatePercentageChange = (newValue: number, baseValue: number): number => {
    return baseValue === 0 ? 0 : ((newValue - baseValue) / baseValue) * 100;
  };
  /*
  useEffect(() => {
    if (fetchedDataSource.length >= 1) {
      const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
      })[] = Object.keys(fetchedDataSource[0]).map((keyName: string) => ({
        title: (
          <div>
            {keyName}
          </div>
        ),
        dataIndex: keyName,
        width: `${100 / Object.keys(fetchedDataSource[0]).length}%`,
        editable: false,
      }));

      //add aditional total column 
      defaultColumns.push({
        title: (
          <div>
            Total
          </div>
        ),
        dataIndex: "Total",
        width: `${100 / (Object.keys(fetchedDataSource[0]).length+1)}%`,
        editable: false,
      })

      console.log(defaultColumns)//.push()
      setColumns(defaultColumns);
    } else {
      setColumns([]);
    }
  }, [fetchedDataSource]);*/
  useEffect(() => {
    if (fetchedDataSource.length >= 1) {
      const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
      })[] = Object.keys(fetchedDataSource[0]).map((keyName: string) => ({
        title: <div>{keyName}</div>,
        dataIndex: keyName,
        width: `${100 / Object.keys(fetchedDataSource[0]).length}%`,
        editable: false,
      }));

      // Add additional total column
      defaultColumns.push({
        title: <div>Total</div>,
        dataIndex: "Total",
        width: `${100 / (Object.keys(fetchedDataSource[0]).length + 1)}%`,
        editable: false,
      });

      // Calculate the sum of the last 3 properties for each row
      const updatedFetchedDataSource = fetchedDataSource.map(row => {
        let sum = 0
        sum = row["Revenue2022"]+row["Revenue2023"]+row["Revenue2024"] 
        // Get all keys of the object
        // const keys = Object.keys(row);
        
        // // Identify the last 3 keys
        // const lastThreeKeys = keys.slice(-3); // Gets the last 3 properties dynamically
        
        // // Sum the values of the last 3 properties
        // const total = lastThreeKeys.reduce((sum, key) => {
        //   return sum + (parseFloat(row[key]) || 0); // Add each property value, convert to number, handle NaN
        // }, 0);

        return { ...row, Total: Number(sum.toFixed(2)) }; // Add the total as a new property
      });

      // Update state with modified data source including total
      // setFetchedDataSource(updatedFetchedDataSource);
      setModifiedDataSource(updatedFetchedDataSource);
      setColumns(defaultColumns);
    } else {
      setColumns([]);
    }
  }, [fetchedDataSource]); 
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }; 
  const mappedColumns1 = columns.map((col) => ({
    ...col,
    onCell: (record: any) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave: (updatedRecord: any) => {
        console.log("In mapped columns", updatedRecord, record, col);
        const newModifiedDataSource = modifiedDataSource.map((item) =>
          item["ID"] === updatedRecord["ID"] ? updatedRecord : item
        );
        setModifiedDataSource(newModifiedDataSource);
      },
      minValue: col.minValue, // Make sure minValue is passed here
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      copy: col.copy,
      showSlider: col.showSlider
    }),
  }));
  const mappedColumns2 = columns.map((col) => ({
    ...col,
    onCell: (record: any) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave: (updatedRecord: any) => {
        console.log("In mapped columns", updatedRecord, record, col);

        // Recalculate the total for the updated record
        const recalculateTotal = (rowData: any) => {
          let total = 0;
          // Sum the values of the new columns (or whatever columns should contribute to the total)
          Object.keys(rowData).forEach((key) => {
            if (key !== "ID" && key !== "CompanyName" && key.includes(modalObject.inputTitle)) {
              total += parseFloat(rowData[key] || 0);
            }
          });
          return total.toFixed(2);
        };

        const newModifiedDataSource = modifiedDataSource.map((item) => {
          if (item["ID"] === updatedRecord["ID"]) {
            const newTotal = recalculateTotal(updatedRecord);
            return {
              ...updatedRecord,
              Total: newTotal,  // Update the total with the recalculated value
            };
          }
          return item;
        });

        setModifiedDataSource(newModifiedDataSource);
      },
      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      copy: col.copy,
      showSlider: col.showSlider,
    }),
  }));
  const mappedColumns = columns.map((col) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave: (updatedRecord) => {
        console.log("In mapped columns", updatedRecord, record, col);

        // Define the new total column key
        const newTotalColKey = `${modalObject.inputTitle}(Total)`;

        // Recalculate the total for the updated record
        const recalculateTotal = (rowData) => {
          let total = 0;
          // Sum the values of the new columns (those that should contribute to the new total)
          Object.keys(rowData).forEach((key) => {
            // Only sum the values from columns that are related to the modal's input title
            if (key !== "ID" && key !== "CompanyName" && key.includes(modalObject.inputTitle)) {
              if (key === newTotalColKey) return
              total += parseFloat(rowData[key] || 0);
            }
          });
          return total.toFixed(2);
        };

        const newModifiedDataSource = modifiedDataSource.map((item) => {
          if (item["ID"] === updatedRecord["ID"]) {
            // Calculate new total based on updated record
            const newTotal = recalculateTotal(updatedRecord);
            // Parse the previous total
            const previousTotal = parseFloat(item[newTotalColKey] || 0);
            // Calculate percentage change from the previous total
            const percentageChange = calculatePercentageChange(parseFloat(newTotal), previousTotal );

            return {
              ...updatedRecord,
              [newTotalColKey]: newTotal,  // Update the new total column with the recalculated value
              [`percentageChange_${newTotalColKey}`]: `${percentageChange.toFixed(2)}%`, // Update percentage change
            };
          }
          return item;
        });

        setModifiedDataSource(newModifiedDataSource);
      },
      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      copy: col.copy,
      showSlider: col.showSlider,
    }),
  }));

 
  console.log("modifiedDataSource",modifiedDataSource, mappedColumns);
  return (
    <div>
      <button
        className='whatifbutton'
        onClick={() => setPopUpVisible(true)}
      >
        What-If
      </button>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        className="custom-table"
        dataSource={modifiedDataSource}
        columns={mappedColumns as ColumnTypes}
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
  );
}; 
const WhatIfTable: React.FC = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const [fetchedDataSource, setFetchedDataSource] = useState<any[]>([]);
  const [modifiedDataSource, setModifiedDataSource] = useState<any[]>([]); 
  const [clickedColumnName, setClickedColumnName] = useState<string>("");
  const [modalObject, setModalObject] = useState<any>({}) 
  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then((response) => response.json())
      .then((data) => {
        setFetchedDataSource(data);
        setModifiedDataSource(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
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
    recalculateTotals()
  };
  const recalculateTotals = () => {
    const newTotalColKey = `${modalObject.inputTitle}(Total)`; // Assuming the total column naming convention
    setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
            let total = 0;
            // Sum up the remaining relevant values
            Object.keys(row).forEach((colKey) => {
                // Exclude ID, CompanyName, and the total column itself
                if (colKey !== "ID" && colKey !== "CompanyName" && colKey !== newTotalColKey && colKey.includes(modalObject.inputTitle)) {
                    total += parseFloat(row[colKey] || 0);
                }
            });
            const totalFormatted = total.toFixed(2); // Format to 2 decimal places
            const previousTotal = parseFloat(row["Total"]) || 0; // Ensure this is a number
            // Check if newTotalColKey exists before adding or updating the total in the row
            if (row.hasOwnProperty(newTotalColKey)) {
                return {
                    ...row,
                    [newTotalColKey]: totalFormatted,
                    [`percentageChange_${newTotalColKey}`]: calculatePercentageChange(total, previousTotal) // Pass numbers
                };
            }
            // If the key doesn't exist, return the row unchanged
            return row;
        })
    );
  }; 
  const handleModalSubmit = (obj: any) => {
    console.log("Popup object", obj);
    setModalObject(obj)
    if(obj.selectedColumn) {
      setClickedColumnName(obj.selectedColumn)
    }
  };
  useEffect(() => {
    console.log(clickedColumnName, "Clicked Col in useEffect")
    switch(modalObject.selectedRadio) {
      case ARRAY_RADIO[0]: {
        editCellDirectly() 
      }
      break;
      case ARRAY_RADIO[1]: {
        simulationUsingSlider()
      }
      break;
      case ARRAY_RADIO[2]: {
        bulkEditing()
      }
      break;
      case ARRAY_RADIO[3]: {

      }
      break;
      default: {
        simulationUsingSlider()
      }
    } 
  }, [modalObject, clickedColumnName]); 
  const simulationUsingSlider = () => {
    if (clickedColumnName) {
      console.log("Clicked Column Name has been updated:", clickedColumnName);
      const selectedColumn = modalObject.selectedColumn;
      const newColumnKey = `Scenario ${columns.length + 1}`;
      const newColumnDataIndex = `Scenario ${modalObject.name} (${selectedColumn})`;

      const newColumn = {
        key: newColumnKey,
        title: (
          <div style={{display:'flex', gap:'2px', alignItems:'center'}}>
                <div style={{display:'flex', gap:'1px'}}> <span style={{display:'block'}} >{modalObject.name}</span> <span  style={{display:'block'}}>({selectedColumn})</span></div> 
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(newColumnKey)}
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
          return {
            ...row,
            [newColumnDataIndex]: newValue,
          };
        })
      );
    }
  }
  const editCellDirectly = () => {
    console.log("Clicked Column Name has been updated:", clickedColumnName);
    const updatedColumns = []; 
    columns.forEach((col) => {
      // Add the original column to the updated columns list
      updatedColumns.push(col); 
      // Exclude certain columns like CompanyName and ID from having new columns
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') return; 
      // Create a new column for each existing column in modifiedDataSource
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      // console.log(col.dataIndex, "Col in loop"); 
      // Check if the new column already exists to prevent duplicates
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span style={{ display: 'block' }}>{newColKey}</span>
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
          editable: true,  // Ensure the new column is editable
          width: '20%',
          minValue: 0,
          maxValue: 100,  // Set your desired range here
          stepValue: 1,
          showSlider: false, // No slider needed for this scenario
        }; 
        // Add the new column to the updated columns
        updatedColumns.push(newCol);
      }
    });
    // Add a new column for the new total
    const newTotalColKey = `${modalObject.inputTitle}(Total)`;
    // updatedColumns.push(newTotalColumn); // Add the new total column 
    // Set updated columns
    setColumns(updatedColumns); 
    // Function to update new total when a cell value is changed
    const updateNewTotal = (updatedRow) => {
      setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
          if (row.ID === updatedRow.ID) {
            // Recalculate the new total based on the newly updated values
            let newTotal = 0; 
            // Sum only values from newly added columns (those including modalObject.inputTitle)
            Object.keys(row).forEach((key) => {
              if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
                newTotal += parseFloat(row[key] || 0);
              }
            }); 
            // Update the new total column for the row
            return {
              ...row,
              [newTotalColKey]: newTotal.toFixed(2), // Update the new total
            };
          }
          return row;
        })
      );
    }; 
    // Update the modifiedDataSource to include the new columns and recalculate totals
    setModifiedDataSource((prevDataSource) => 
      prevDataSource.map((row) => {
        const newRow = { ...row };
        let newTotal = 0; 
        // Initialize new values for each existing column with the modal's input title
        Object.keys(row).forEach((key) => {
          if (key !== "ID" && key !== "CompanyName") {
            const newValue = row[key] || 0;
            const newColKey = `${modalObject.inputTitle}(${key})`; 
            // Assign the value to the new column
            newRow[newColKey] = newValue;
          }
        }); 
        // Sum only the values from newly created columns (those containing modalObject.inputTitle)
        Object.keys(newRow).forEach((key) => {
          if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
            // console.log(newTotalColKey, newTotal, key)
            newTotal += parseFloat(newRow[key] || 0);
          }
        }); 
        // Update the new total column for the row
        newRow[newTotalColKey] = newTotal.toFixed(2); // Format the total to 2 decimal places

        return newRow;
      })
    );
  };
  const calculatePercentageChange = (newValue: number, baseValue: number): number => {
    return baseValue === 0 ? 0 : ((newValue - baseValue) / baseValue) * 100;
  };
  const bulkEditing = () => {
    /*
    console.log(modalObject);
    const columns = modalObject.availableColumns;

    columns.forEach((obj: any) => {
      const key = `Scenario (${obj.dataIndex})`;
      
      // Create the new column to be inserted next to the parent column
      const newColumn = {
        key: key,
        title: (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              <span style={{ display: 'block' }}>{key}</span>
            </div>
            <Button
              type="link"
              icon={<MinusOutlined />}
              onClick={() => onRemoveButtonClicked(key)}
              style={{ marginLeft: 8 }}
            />
          </div>
        ),
        dataIndex: key,
        width: '20%',
        editable: true,
        minValue: modalObject.sliderMinimumValue,
        maxValue: modalObject.sliderMaximumValue,
        stepValue: 0.1,//modalObject.sliderIncrementByValue,
        copy: true, // modalObject.copyPreviousData,
        showSlider: true//modalObject.showSlider,
      };

      // Step 1: Insert the new column next to its corresponding parent column
      setColumns((prevColumns) => {
        const parentColumnIndex = prevColumns.findIndex(
          (col) => col.dataIndex === obj.dataIndex
        );
        
        if (parentColumnIndex !== -1) {
          // Insert the new column immediately after the parent column
          const updatedColumns = [...prevColumns];
          updatedColumns.splice(parentColumnIndex + 1, 0, newColumn);
          return updatedColumns;
        } else {
          // If parent column is not found, append the column at the end as a fallback
          return [...prevColumns, newColumn];
        }
      });

      // Step 2: Update the data source
      setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
          const newValue = true ? row[obj.dataIndex] : '0';
          return {
            ...row,
            [key]: newValue,
          };
        })
      );
    });
    */

    console.log("Clicked Column Name has been updated:", clickedColumnName);
    const updatedColumns = []; 
    columns.forEach((col) => {
      // Add the original column to the updated columns list
      updatedColumns.push(col); 
      // Exclude certain columns like CompanyName and ID from having new columns
      if (col.dataIndex === 'CompanyName' || col.dataIndex === 'ID') return; 
      // Create a new column for each existing column in modifiedDataSource
      const newColKey = `${modalObject.inputTitle}(${col.dataIndex})`;
      console.log(col.dataIndex, "Col in loop"); 
      // Check if the new column already exists to prevent duplicates
      const columnExists = columns.some((existingCol) => existingCol.key === newColKey);
      if (!columnExists) {
        const newCol = {
          key: newColKey,
          title: (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                <span style={{ display: 'block' }}>{newColKey}</span>
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
          editable: true,  // Ensure the new column is editable
          width: '20%',
          minValue: modalObject.sliderMinimumValue,
          maxValue: modalObject.sliderMaximumValue,  // Set your desired range here
          stepValue: 1,
          showSlider: true, // No slider needed for this scenario
        }; 
        // Add the new column to the updated columns
        updatedColumns.push(newCol);
      }
    });
    // Add a new column for the new total
    const newTotalColKey = `${modalObject.inputTitle}(Total)`;
    // updatedColumns.push(newTotalColumn); // Add the new total column 
    // Set updated columns
    setColumns(updatedColumns); 
    // Function to update new total when a cell value is changed
    const updateNewTotal = (updatedRow) => {
      setModifiedDataSource((prevDataSource) =>
        prevDataSource.map((row) => {
          if (row.ID === updatedRow.ID) {
            // Recalculate the new total based on the newly updated values
            let newTotal = 0; 
            // Sum only values from newly added columns (those including modalObject.inputTitle)
            Object.keys(row).forEach((key) => {
              if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
                newTotal += parseFloat(row[key] || 0);
              }
            }); 
            // Update the new total column for the row
            return {
              ...row,
              [newTotalColKey]: newTotal.toFixed(2), // Update the new total
            };
          }
          return row;
        })
      );
    }; 
    // Update the modifiedDataSource to include the new columns and recalculate totals
    setModifiedDataSource((prevDataSource) => 
      prevDataSource.map((row) => {
        const newRow = { ...row };
        let newTotal = 0; 
        // Initialize new values for each existing column with the modal's input title
        Object.keys(row).forEach((key) => {
          if (key !== "ID" && key !== "CompanyName") {
            const newValue = row[key] || 0;
            const newColKey = `${modalObject.inputTitle}(${key})`; 
            // Assign the value to the new column
            newRow[newColKey] = newValue;
          }
        }); 
        // Sum only the values from newly created columns (those containing modalObject.inputTitle)
        Object.keys(newRow).forEach((key) => {
          if (key.includes(modalObject.inputTitle) && key !== newTotalColKey) {
            console.log(newTotalColKey, newTotal, key)
            newTotal += parseFloat(newRow[key] || 0);
          }
        }); 
        // Update the new total column for the row
        newRow[newTotalColKey] = newTotal.toFixed(2); // Format the total to 2 decimal places

        return newRow;
      })
    );
  };
  //total row page wise 
  // Function to calculate the sum row (21st row)
  const calculateSumRow1 = (data) => {
    const sumRow = { CompanyName: "All" }; // Set the CompanyName for the sum row
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        // Ensure we only sum numerical values
        if (typeof row[key] === 'number' && key !== "ID" && key !== "CompanyName") {
          sumRow[key] = (sumRow[key] || 0) + row[key];
        }
        if (key.includes(modalObject.inputTitle) && typeof row[key] === 'number' && key !== "ID" && key !== "CompanyName") {
          // console.log("in loop", (sumRow[`${modalObject.inputTitle}(Total)`] || 0), row[`${modalObject.inputTitle}(${key})`], modalObject.inputTitle, row, key)
          sumRow[`${modalObject.inputTitle}(Total)`] = (sumRow[`${modalObject.inputTitle}(Total)`] || 0) + row[key]
        }
        if (key.includes(`percentageChange`)) { 
          const extractedPropertyName = key.split("(")[1].replace(")", "")
          console.log(sumRow[`${modalObject.inputTitle}(Total)`], sumRow[extractedPropertyName], key)
          sumRow[`${key}`] = calculatePercentageChange(sumRow[`${modalObject.inputTitle}(${extractedPropertyName})`] as number, sumRow[extractedPropertyName] as number)
        }
      })
    }) 
    // Round the values to 2 decimal places
    Object.keys(sumRow).forEach(key => {
      if (typeof sumRow[key] === 'number') {
        sumRow[key] = parseFloat(sumRow[key].toFixed(2)); // Round to 2 decimal places
      } 
    })
    return sumRow;
  }
const calculateSumRow = (data) => {
  const sumRow = { CompanyName: "All" }; // Set the CompanyName for the sum row 
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      // Sum numeric values that are not ID or CompanyName
      if (typeof row[key] === "number" && key !== "ID" && key !== "CompanyName") {
        sumRow[key] = (sumRow[key] || 0) + row[key];
      }
      // Calculate the total for columns related to the modal input title (e.g., scenario columns)
      if (key.includes(modalObject.inputTitle) && typeof row[key] === "number") {
        // Ensure that the total is always treated as a number
        sumRow[`${modalObject.inputTitle}(Total)`] = (sumRow[`${modalObject.inputTitle}(Total)`] || 0) + (row[key] || 0);
      }
      // Handle percentage change calculations for relevant columns
      /*if (key.includes("percentageChange")) {
        // Extract the related column name for the base value
        const extractedPropertyName = key.split("(")[1].replace(")", "");

        // Get the base value and the new total for comparison
        const baseValue = sumRow[extractedPropertyName];
        const newTotal = sumRow[`${modalObject.inputTitle}(${extractedPropertyName})`];

        // Calculate the percentage change between the new total and the base value
        if (typeof baseValue === 'number' && typeof newTotal === 'number' && baseValue !== 0) {
          sumRow[key] = calculatePercentageChange(newTotal, baseValue);
        } else {
          sumRow[key] = 0; // Set percentage change to 0 if either value is missing or baseValue is zero
        }
      }*/
    });
  });
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.includes("percentageChange")) {
        // Extract the related column name for the base value
        const extractedPropertyName = key.split("(")[1].replace(")", "");
        // Get the base value and the new total for comparison
        const baseValue = sumRow[extractedPropertyName];
        const newTotal = sumRow[`${modalObject.inputTitle}(${extractedPropertyName})`];
        console.log(extractedPropertyName, baseValue, `${modalObject.inputTitle}(${extractedPropertyName})`,newTotal)
        // Calculate the percentage change between the new total and the base value
        if (typeof baseValue === 'number' && typeof newTotal === 'number' && baseValue !== 0) {
          sumRow[key] = calculatePercentageChange(newTotal, baseValue);
        } else {
          sumRow[key] = 0;// Set percentage change to 0 if either value is missing or baseValue is zero
        }
      }
    })
  })
  // Round numeric values in the sum row to 2 decimal places
  Object.keys(sumRow).forEach((key) => {
    if (typeof sumRow[key] === "number") {
      sumRow[key] = parseFloat(sumRow[key].toFixed(2));
    }
  });
  return sumRow;
};
/*
const calculateSumRow = (data) => {
  const sumRow = { CompanyName: "All" }; // Set the CompanyName for the sum row 

  // First pass: Calculate the sums
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      // Sum numeric values that are not ID or CompanyName
      if (typeof row[key] === "number" && key !== "ID" && key !== "CompanyName") {
        sumRow[key] = (sumRow[key] || 0) + row[key];
      }
      // Calculate the total for columns related to the modal input title (e.g., scenario columns)
      if (key.includes(modalObject.inputTitle) && typeof row[key] === "number") {
        // Ensure that the total is always treated as a number
        sumRow[`${modalObject.inputTitle}(Total)`] = (sumRow[`${modalObject.inputTitle}(Total)`] || 0) + (row[key] || 0);
      }
    });
  });

  // Second pass: Calculate the percentage change
  Object.keys(sumRow).forEach((key) => {
    if (key.includes("percentageChange")) {
      // Extract the related column name for the base value
      const extractedPropertyName = key.split("(")[1].replace(")", "");

      // Get the base value and the new total for comparison
      const baseValue = sumRow[extractedPropertyName]; // Base value from the sum row
      const newTotal = sumRow[`${modalObject.inputTitle}(${extractedPropertyName})`]; // The new total to compare

      console.log(extractedPropertyName, baseValue, `${modalObject.inputTitle}(${extractedPropertyName})`, newTotal);

      // Calculate the percentage change between the new total and the base value
      if (typeof baseValue === 'number' && typeof newTotal === 'number' && baseValue !== 0) {
        sumRow[key] = calculatePercentageChange(newTotal, baseValue);
      } else {
        sumRow[key] = 0; // Set percentage change to 0 if either value is missing or baseValue is zero
      }
    }
  });

  // Round numeric values in the sum row to 2 decimal places
  Object.keys(sumRow).forEach((key) => {
    if (typeof sumRow[key] === "number") {
      sumRow[key] = parseFloat(sumRow[key].toFixed(2));
    }
  });

  return sumRow;
};
*/


  const paginatedDataSource = (dataSource, pageSize, currentPage) => {
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;

    // Get the first 20 rows for the current page
    const pageData = dataSource.slice(start, end);

    // Calculate and add the 21st row
    const sumRow = calculateSumRow(pageData);
    
    // Object.keys(sumRow).forEach((rowKey) => {
    //   if(rowKey.includes(modalObject.inputTitle)) {
    //     console.log("in loop")
    //     sumRow[`${modalObject.inputTitle}(Total)`] = calculateSumRow(pageData)
    //   }
    // })
    console.log(sumRow)
    return [...pageData, sumRow]; // Return the paginated data with the sum row
  };
  // Table pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };
  const paginatedData = paginatedDataSource(modifiedDataSource, pageSize, currentPage);
  useEffect(() => {
    if (fetchedDataSource.length >= 1) {
      const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
      })[] = Object.keys(fetchedDataSource[0]).map((keyName: string) => ({
        title: <div>{keyName}</div>,
        dataIndex: keyName,
        width: `${100 / Object.keys(fetchedDataSource[0]).length}%`,
        editable: false,
      })); 
      // Add additional total column
      defaultColumns.push({
        title: <div>Total</div>,
        dataIndex: "Total",
        width: `${100 / (Object.keys(fetchedDataSource[0]).length + 1)}%`,
        editable: false,
      }); 
      // Calculate the sum of the last 3 properties for each row
      const updatedFetchedDataSource = fetchedDataSource.map(row => {
        let sum = 0
        sum = row["Revenue2022"]+row["Revenue2023"]+row["Revenue2024"]  
        return { ...row, Total: Number(sum.toFixed(2)) }; // Add the total as a new property
      });

      // Update state with modified data source including total 
      setModifiedDataSource(updatedFetchedDataSource);
      setColumns(defaultColumns);
    } else {
      setColumns([]);
    }
  }, [fetchedDataSource]);
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
        console.log("In mapped columns", updatedRecord, record, col);
        // Define the new total column key
        const newTotalColKey = `${modalObject.inputTitle}(Total)`;
        // Recalculate the total for the updated record
        const recalculateTotal = (rowData) => {
          let total = 0;
          // Sum the values of the new columns (those that should contribute to the new total)
          Object.keys(rowData).forEach((key) => {
            // Only sum the values from columns that are related to the modal's input title
            if (key !== "ID" && key !== "CompanyName" && key.includes(modalObject.inputTitle)) {
              if (key === newTotalColKey) return
              total += parseFloat(rowData[key] || 0);
            }
          });
          return total.toFixed(2);
        }; 
        const newModifiedDataSource = modifiedDataSource.map((item) => {
          if (item["ID"] === updatedRecord["ID"]) {
            // Calculate new total based on updated record
            const newTotal = recalculateTotal(updatedRecord);
            // Parse the previous total
            const previousTotal = parseFloat(item[newTotalColKey] || 0);
            // Calculate percentage change from the previous total
            const percentageChange = calculatePercentageChange(parseFloat(newTotal), item["Total"] );
            return {
              ...updatedRecord,
              [newTotalColKey]: newTotal,  // Update the new total column with the recalculated value
              [`percentageChange_${newTotalColKey}`]: `${percentageChange.toFixed(2)}%`, // Update percentage change
            };
          }
          return item;
        });

        setModifiedDataSource(newModifiedDataSource);
      },
      minValue: col.minValue,
      maxValue: col.maxValue,
      stepValue: col.stepValue,
      copy: col.copy,
      showSlider: col.showSlider,
    }),
  }));
  console.log("modifiedDataSource",modifiedDataSource, mappedColumns);
  console.log(paginatedData, "page")
  return (
    <div>
      <Button
        className='button-style'
        onClick={() => setPopUpVisible(true)}
        style={{ margin:'10px 10px'}}>
        What-If
      </Button>
      <Table 
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        className="custom-table hide-scrollbar"
        dataSource={paginatedData}
        columns={mappedColumns as ColumnTypes}
        pagination={{
          pageSize: pageSize +1, // Adjust the page size as needed
          total: modifiedDataSource.length+1, // Total number of data items
          position: ["bottomRight"],// Pagination at the bottom right
          current: currentPage,
          onChange: handlePaginationChange,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`, // Showing range of displayed items
          itemRender: (_, type, originalElement) => {
            if (type === "prev") {
              return <LeftOutlined />  // Custom icon for 'Previous' button
            }
            if (type === "next") {
              return <RightOutlined /> // Custom icon for 'Next' button
            }
            return originalElement // Default pagination elements
          }
        }}
        rowKey="ID"
        scroll={{x: '100%', y: 400 }} 
      />  
      {isPopUpVisible ? <PopupModal availableColumns={columns} onClose={() => setPopUpVisible(false)} onSubmit={handleModalSubmit} /> : <></>}
    </div>
  );
};
export default WhatIfTable;


    // <div>
    //   <button
    //     className='whatifbutton'
    //     onClick={() => setPopUpVisible(true)}
    //   >
    //     What-If
    //   </button>
    //   <Table
    //     components={components}
    //     rowClassName={() => "editable-row"}
    //     bordered
    //     className="custom-table"
    //     dataSource={modifiedDataSource}
    //     columns={mappedColumns as ColumnTypes}
    //   />
    //   {
    //     isPopUpVisible ?
    //       <PopupModal
    //         availableColumns={columns}
    //         onClose={() => setPopUpVisible(false)}
    //         onSubmit={handleModalSubmit}
    //       /> : <></>
    //   }
    // </div>



