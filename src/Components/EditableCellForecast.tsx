import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "../Components/styles/whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { Pagination } from 'antd';
import { PopupModal, WhatIfParameterType, WhatIfSimulationObject, ARRAY_RADIO } from "./PopUpWindow"
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, EditOutlined, ShrinkOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

export const EditableContext = createContext<any | null>(null);
export interface Item {
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
export interface EditableRowProps {
  index: number;
}
export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}
export interface EditableCellProps {
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


export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
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

  const extractedPropertyName =
    typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || "0");
  const [sliderValue, setSliderValue] = useState<number>(parseFloat(String(record?.[dataIndex] || "0")));
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  const [inputError, setInputError] = useState<string | null>(null);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>(String(record?.[dataIndex] || "0"));

  useEffect(() => {
    setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
    setTextValue(String(record?.[dataIndex] || "0"));
  }, [record, dataIndex]);
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
  const handleSaveOnBlurOrEnter = () => {
    const calculatedValue = calculateValue(textValue);  // Calculate the new value entered
    // const percentage = calculatePercentageChange(calculatedValue, dataValue);  // Calculate percentage change for parent

    // Prevent recalculation and updating if the value hasn't changed
    if (calculatedValue === parseFloat(String(record[dataIndex]))) {
      // No changes in the value, so no need to update the children
      setIsCellEditable(false);
      return;
    }

    // If value has changed, proceed with updating
    setSliderValue(calculatedValue);
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    // Create an updated record for the parent with the new revenue and percentage
    let updatedRecord = {
      ...record,
      [dataIndex]: `${calculatedValue}`,

    };
    handleSave(updatedRecord);
    setIsCellEditable(false);
  };
  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
    </div>
  );
  let childNode = children;
  if (editable) {
    childNode = (
      <div {...restProps}>
        {isCellEditable ? (
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleSaveOnBlurOrEnter}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveOnBlurOrEnter();
            }}
            style={{ width: "100%" }}
          />
        ) : (
          <div onDoubleClick={() => setIsCellEditable(true)}>
            {formattedCellContent}
          </div>
        )}

      </div>
    );
  }
  return <td {...restProps} style={{ padding: "4px" }}>{childNode || record[dataIndex]}</td>;
};





