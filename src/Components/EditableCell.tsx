import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "./whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { Pagination } from 'antd';
import { PopupModal, WhatIfParameterType, WhatIfSimulationObject, ARRAY_RADIO } from "./PopUpWindow"
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, EditOutlined, ShrinkOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { data, columns, prepareData } from './../data'


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
const EditableCell: React.FC<any> = ({ a }) => {
  console.log(a)
  return <td style={{ padding: "4px" }}>{a}</td>;
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
  console.log(title, editable, children, dataIndex, record)
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
      <div {...restProps} onClick={handleClick} style={{}} className="insidediv">

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