
import * as React from "react";
import { useEffect, useState } from "react";
import { Modal, Button, Input, Checkbox, Select, InputNumber } from "antd";
import type { SelectProps, InputNumberProps  } from 'antd';
import {PercentageOutlined} from "@ant-design/icons"
interface PopupModalProps {
  availableColumns: any; 
  onClose: () => void;
  onSubmit: ({
    name,
    sliderMinimumValue,
    sliderMaximumValue,
    sliderIncrementByValue,
    sliderDefaultValue,
    copyPreviousData,
    selectedColumn, // Selected column from dropdown
    varianceStyle, // Variance style from dropdown
    showSlider, // Show slider checkbox value
  }: WhatIfParameterType) => void;
}
export interface WhatIfParameterType {
  name: string;
  sliderMinimumValue: any;
  sliderMaximumValue: any;
  sliderIncrementByValue: any;
  sliderDefaultValue: any;
  copyPreviousData: boolean;
  selectedColumn: string; // Column selection
  varianceStyle: string; // Variance style
  showSlider: boolean; // Slider display flag
}
export const PopupModal: React.FC<PopupModalProps> = ({
  availableColumns,
  onClose,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [maxInputValue, setMaxInputValue] = useState<string>("");
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [varianceStyle, setVarianceStyle] = useState<string>(""); 
  const [maxError, setMaxError] = useState<string | null>(null);

  const [copyPreviousData, setCopyPreviousData] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Filter availableColumns to remove columns starting with "Scenario"
  const withoutScenerio = availableColumns.filter((d: any) => !d.dataIndex.startsWith("Scenario"));
  const options = withoutScenerio.slice(2).map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));

  const validateInputs = () => {
    let valid = true;

    // Validate if maxInputValue is a number
    if (isNaN(Number(maxInputValue))) {
      setMaxError("Please enter a valid number");
      valid = false;
    } else {
      setMaxError(null);
    }

    // Check if inputValue matches any dataIndex in availableColumns
    const isDuplicateName = availableColumns.some(
      (col: any) => col.dataIndex.toLowerCase() === inputValue.toLowerCase()
    );
    
    if (!inputValue) {
      setInputError("Title is required");
      valid = false;
    } else if (isDuplicateName) {
      setInputError("This title already exists. Please choose a different name.");
      valid = false;
    } else {
      setInputError(null);
    }

    return valid;
  };

  const handleOk = () => {
    if (!validateInputs()) return;

    const newData: WhatIfParameterType = {
      name: inputValue,
      sliderMinimumValue: Number(maxInputValue),
      sliderMaximumValue: Number(maxInputValue),
      sliderIncrementByValue: 1,
      sliderDefaultValue: maxInputValue,
      copyPreviousData: copyPreviousData,
      selectedColumn,
      varianceStyle,
      showSlider: showSlider,
    };

    onSubmit(newData);
    resetForm(); // Reset form after submission
    onClose();
  };

  const handleCancel = () => {
    resetForm(); // Reset form when modal closes
    onClose();
  };

  const resetForm = () => {
    setInputValue("");
    setMaxInputValue("");
    setSelectedColumn("");
    setVarianceStyle("");
    setShowSlider(false);
    setMaxError(null);
    setInputError(null);
    setCopyPreviousData(false);
  };

  return (
    <Modal title="Enter Value for Scenario" visible={true} onOk={handleOk} onCancel={handleCancel}>
      <span>
        <label>Title</label>
        <Input
          placeholder="Enter name here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          status={inputError ? "error" : ""}
        />
        {inputError && <span style={{ color: "red" }}>{inputError}</span>} {/* Display input error */}
      </span>

      <label>Simulation based on</label>
      <Select
        value={selectedColumn}
        onChange={(value) => setSelectedColumn(value)}
        style={{ width: "100%" }}
        options={options}
      />

      <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Checkbox
          checked={showSlider}
          onChange={(e) => setShowSlider(e.target.checked)}
        >
          Show slider
        </Checkbox>
        {showSlider && (
          <div style={{ marginLeft: "16px", flex: 1 }}>
            <label>Range (In Percent)</label>
            <Input
              placeholder="Enter max value here..."
              value={maxInputValue}
              suffix={<PercentageOutlined />}
              onChange={(e) => setMaxInputValue(e.target.value)}
            />
            {maxError && <div style={{ color: "red" }}>{maxError}</div>} {/* Display max value error */}
          </div>
        )}
      </div>
      <div style={{ marginTop: "16px" }}>
        <Checkbox
          checked={copyPreviousData}
          onChange={(e) => setCopyPreviousData(e.target.checked)}
        >
          Copy Data
        </Checkbox>
      </div>
    </Modal>
  );
};


