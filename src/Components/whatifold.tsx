/* eslint-disable max-lines-per-function */
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
  handleSave: (record: Item, i: any) => void;
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

  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const [sliderValue, setSliderValue] = useState<number>(parseFloat(String(record?.[dataIndex] || "0")));
  const [visible, setVisible] = useState(false);

  let calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  let calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  const [inputError, setInputError] = useState<string | null>(null);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>(String(record?.[dataIndex] || "0"));

  useEffect(() => {
    setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
    setTextValue(String(record?.[dataIndex] || "0"));
  }, [record, dataIndex]);
  useEffect(() => {
    console.log(extractedPropertyName)
    if (!copy) {
      setSliderValue(dataValue);
      setTextValue(String(dataValue) || '0');
    }
  }, [copy, calculatedMinSliderValue]);

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
  const handleSliderChange1 = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(value, prevValue);

    setSliderValue(value);
    form.setFieldsValue({ [dataIndex]: `${value}` });

    // Call handleSave with the updated record
    const updatedRecord = {
      ...record,
      [dataIndex]: `${value}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    const updatedParent = updateParentValue(record, value);  // Update parent if necessary

    handleSave(updatedRecord, updatedParent);
  };
  const handleSliderChange2 = (value: number) => {
    // Get the previous value from the parent record
    const prevValue = dataValue; // This should be the current value of the parent before the slider change
    console.log('Previous Value:', prevValue, 'New Slider Value:', value);
    // Calculate the percentage change between the new slider value and the previous value
    const percentage = calculatePercentageChange(value, prevValue);

    // Set the new slider value in the state and update the form
    setSliderValue(value);
    form.setFieldsValue({ [dataIndex]: `${value}` });

    // Create an updated record for the parent with the new value and percentage change
    const updatedRecord = {
      ...record,
      [dataIndex]: `${value}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // If the parent record has children, update them by applying the percentage change
    const updatedChildren = applyPercentageChangeToChildrenThroughSlider(updatedRecord, percentage);

    // Pass the updated record (parent) and updated children to the handleSave function
    handleSave(updatedRecord, updatedChildren);
  };
  // Handle slider change for parent and propagate to all nested children
  const handleSliderChange = (value: number) => {
    // Get the previous value from the parent record
    const prevValue = dataValue; // Current value of the parent before the slider change
    console.log('Previous Value:', prevValue, 'New Slider Value:', value);

    // Calculate the percentage change between the new slider value and the previous value
    const percentage = calculatePercentageChange(value, prevValue);

    // Set the new slider value in the state and update the form
    setSliderValue(value);
    form.setFieldsValue({ [dataIndex]: `${value}` });

    // Create an updated record for the parent with the new value and percentage change
    const updatedRecord = {
      ...record,
      [dataIndex]: `${value}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // Recursively apply the percentage change to all children
    const updatedChildren = applyPercentageChangeRecursively(updatedRecord, percentage);

    // Pass the updated record (parent) and updated children to the handleSave function
    handleSave(updatedRecord, updatedChildren);
  };

  const handleSaveOnBlurOrEnter1 = () => {
    const calculatedValue = calculateValue(textValue);  // Calculate the new value entered
    const percentage = calculatePercentageChange(calculatedValue, dataValue);  // Calculate percentage change for child
    setSliderValue(calculatedValue);
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    // Create an updated record for the child with the new revenue and percentage
    let updatedRecord = {
      ...record,
      [dataIndex]: `${calculatedValue}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // Update the parent's value if there are children
    const updatedParent = updateParentValue(updatedRecord, calculatedValue);
    console.log(updatedParent)
    // Pass both the updated record (child) and parent to handleSave
    handleSave(updatedRecord, null);
    setIsCellEditable(false);
  };
  const handleSaveOnBlurOrEnter2 = () => {
    const calculatedValue = calculateValue(textValue);  // Calculate the new value entered
    const percentage = calculatePercentageChange(calculatedValue, dataValue);  // Calculate percentage change for child
    setSliderValue(calculatedValue);
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    // Create an updated record for the child with the new revenue and percentage
    let updatedRecord = {
      ...record,
      [dataIndex]: `${calculatedValue}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // Check if the record has children and update them by dividing the value
    const updatedChildren = divideValueAmongChildren(updatedRecord, calculatedValue);

    // Pass both the updated record (child) and updated children to handleSave
    handleSave(updatedRecord, updatedChildren);
    setIsCellEditable(false);
  };
  const handleSaveOnBlurOrEnter3 = () => {
    const calculatedValue = calculateValue(textValue);  // Calculate the new value entered
    const percentage = calculatePercentageChange(calculatedValue, dataValue);  // Calculate percentage change for child
    setSliderValue(calculatedValue);
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    // Create an updated record for the child with the new revenue and percentage
    let updatedRecord = {
      ...record,
      [dataIndex]: `${calculatedValue}`,
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // Check if the record has children and update them by applying the percentage change
    const updatedChildren = applyPercentageChangeToChildren(updatedRecord, percentage);

    // Pass both the updated record (child) and updated children to handleSave
    handleSave(updatedRecord, updatedChildren);
    setIsCellEditable(false);
  };
  const handleSaveOnBlurOrEnter = () => {
    const calculatedValue = calculateValue(textValue);  // Calculate the new value entered
    const percentage = calculatePercentageChange(calculatedValue, dataValue);  // Calculate percentage change for parent

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
      [`percentageChange_${dataIndex}`]: `${percentage.toFixed(2)}%`,
    };

    // Check if the record has children and update them by applying the percentage change
    const updatedChildren = applyPercentageChangeRecursively(updatedRecord, percentage);
    console.log("IN EditableCell", updatedRecord, updatedChildren)
    // Pass both the updated record (parent) and updated children to handleSave
    handleSave(updatedRecord, updatedChildren);
    setIsCellEditable(false);
  };

  // Function to apply percentage change to children
  const applyPercentageChangeToChildren = (updatedRecord: any, percentageChange: number): Item[] | null => {
    // Check if the record has children
    if (!updatedRecord.children || updatedRecord.children.length === 0) {
      return null;  // No children, no need to apply percentage change
    }

    // Update each child's value based on the parent's percentage change
    const updatedChildren = updatedRecord.children.map((child: any) => {
      const childBaseValue = parseFloat(String(child[dataIndex] || "0"));
      const newChildValue = childBaseValue * (1 + percentageChange / 100);

      return {
        ...child,
        [dataIndex]: newChildValue.toFixed(2),
        [`percentageChange_${dataIndex}`]: `${percentageChange.toFixed(2)}%`,  // Update percentage change for child
      };
    });

    return updatedChildren;
  };
  const applyPercentageChangeToChildrenThroughSlider = (parentRecord: any, parentPercentageChange: number): Item[] | null => {
    // Check if the parent record has children
    if (!parentRecord.children || parentRecord.children.length === 0) {
      return null;  // No children, so no need to apply percentage change
    }

    // Update each child's value based on the parent's percentage change
    const updatedChildren = parentRecord.children.map((child: any) => {
      // Get the child's base value before any changes
      const childBaseValue = parseFloat(String(child[extractedPropertyName] || "0"));
      // Apply the parent's percentage change to the child's value
      const newChildValue = childBaseValue * (1 + parentPercentageChange / 100);
      console.log("New child Val: ", newChildValue)
      return {
        ...child,
        [dataIndex]: newChildValue.toFixed(2), // Update the child's value
        [`percentageChange_${dataIndex}`]: `${parentPercentageChange.toFixed(2)}%`,  // Update the child's percentage change
      };
    });

    return updatedChildren;
  };
  const applyPercentageChangeRecursively = (parentRecord: any, parentPercentageChange: number): Item[] | null => {
    // Check if the parent record has children
    if (!parentRecord.children || parentRecord.children.length === 0) {
      return null;  // No children, so no need to apply percentage change
    }

    // Update each child and recursively update their children (if any)
    const updatedChildren = parentRecord.children.map((child: any) => {
      // Get the child's base value before any changes
      const childBaseValue = parseFloat(String(child[extractedPropertyName] || "0"));
      // Apply the parent's percentage change to the child's value
      const newChildValue = childBaseValue * (1 + parentPercentageChange / 100);
      console.log("New child Val: ", newChildValue);

      // Create an updated child object
      const updatedChild = {
        ...child,
        [dataIndex]: newChildValue.toFixed(2),  // Update the child's value
        [`percentageChange_${dataIndex}`]: `${parentPercentageChange.toFixed(2)}%`,  // Update the child's percentage change
      };

      // Recursively apply percentage change to this child's children (if any)
      const furtherUpdatedChildren = applyPercentageChangeRecursively(updatedChild, parentPercentageChange);

      // Return the updated child (including updated children if they exist)
      return {
        ...updatedChild,
        children: furtherUpdatedChildren || updatedChild.children,  // Maintain children if updated
      };
    });

    return updatedChildren;
  };

  // Function to apply percentage change to each child
  const applyPercentageChangeToChildren1 = (updatedRecord: any, percentageChange: number): Item[] | null => {
    // Check if the record has children
    if (!updatedRecord.children || updatedRecord.children.length === 0) {
      // No children, no need to apply the percentage change
      return null;
    }

    // Update each child's value based on the percentage change
    const updatedChildren = updatedRecord.children.map((child: any) => {
      // Get the current value of the child
      const childBaseValue = parseFloat(String(child[dataIndex] || "0"));

      // Apply the percentage change to the child's value
      const newChildValue = childBaseValue * (1 + percentageChange / 100);

      // Calculate the percentage change for the child (same as parent's percentage change)
      const childPercentageChange = percentageChange;

      return {
        ...child,
        [dataIndex]: newChildValue.toFixed(2),  // Assign new value to child
        [`percentageChange_${dataIndex}`]: `${childPercentageChange.toFixed(2)}%`,  // Update percentage change
      };
    });

    return updatedChildren;
  };


  // Function to update the parent's value based on its children's values
  const updateParentValue = (updatedRecord: any, newValue: number): Item | null => {
    if (!updatedRecord.children || updatedRecord.children.length === 0) {
      // No children, no parent update needed
      return null;
    }

    // Calculate the parent's revenue as the sum of all children's revenue
    const totalChildRevenue = updatedRecord.children.reduce(
      (total, child) => total + parseFloat(child[dataIndex] || "0"),
      0
    );

    // Update the parent's value
    const updatedParent = {
      ...updatedRecord,
      [dataIndex]: totalChildRevenue.toFixed(2),
    };

    // Recalculate percentage change for the parent
    const parentBaseValue = parseFloat(String(record?.[dataIndex] || "0"));
    const parentPercentageChange = calculatePercentageChange(totalChildRevenue, parentBaseValue);

    // Set the percentage change for the parent
    updatedParent[`percentageChange_${dataIndex}`] = `${parentPercentageChange.toFixed(2)}%`;

    return updatedParent;
  };
  const divideValueAmongChildren1 = (updatedRecord: any, newValue: number): Item[] | null => {
    // Check if the record has children
    if (!updatedRecord.children || updatedRecord.children.length === 0) {
      // No children, no need to divide the value
      return null;
    }

    // Calculate the number of children
    const numChildren = updatedRecord.children.length;

    // Calculate the value to assign to each child
    const valuePerChild = (newValue / numChildren).toFixed(2);

    // Update each child's value
    const updatedChildren = updatedRecord.children.map((child: any) => {
      // Calculate percentage change for the child
      const childBaseValue = parseFloat(String(child[dataIndex] || "0"));
      const percentageChange = calculatePercentageChange(parseFloat(valuePerChild), childBaseValue);

      return {
        ...child,
        [dataIndex]: valuePerChild, // Assign divided value to child
        [`percentageChange_${dataIndex}`]: `${percentageChange.toFixed(2)}%`, // Update percentage change
      };
    });

    return updatedChildren;
  };
  // Function to divide value among children, used as needed
  const divideValueAmongChildren = (updatedRecord: any, newValue: number): Item[] | null => {
    // Check if the record has children
    if (!updatedRecord.children || updatedRecord.children.length === 0) {
      return null;  // No children to divide value
    }

    // Calculate the number of children
    const numChildren = updatedRecord.children.length;

    // Calculate the value to assign to each child
    const valuePerChild = (newValue / numChildren).toFixed(2);

    // Update each child's value
    const updatedChildren = updatedRecord.children.map((child: any) => {
      // Calculate percentage change for each child
      const childBaseValue = parseFloat(String(child[dataIndex] || "0"));
      const percentageChange = calculatePercentageChange(parseFloat(valuePerChild), childBaseValue);

      return {
        ...child,
        [dataIndex]: valuePerChild,  // Assign divided value to child
        [`percentageChange_${dataIndex}`]: `${percentageChange.toFixed(2)}%`,  // Update percentage change for child
      };
    });

    return updatedChildren;
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
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
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
