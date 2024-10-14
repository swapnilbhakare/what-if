import * as React from "react";
import { useEffect, useState } from "react";
import { Modal, Button, Input, Checkbox, Select, InputNumber, Flex, Radio } from "antd";
import type { SelectProps, InputNumberProps  } from 'antd';
import {PercentageOutlined} from "@ant-design/icons"

interface PopupModalProps {
  availableColumns: any; 
  onClose: () => void;
  onSubmit: (data: WhatIfParameterType | WhatIfSimulationObject | WhatIfBulkEditingObject) => void; // Updated type
}

export const ARRAY_RADIO = ['Edit Direct','Single Col Simulation slider','Simulation slider Impact','bi_direction']

export interface WhatIfParameterType {
  selectedRadio: any;
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
export interface WhatIfSimulationObject {
  selectedRadio: string;
  inputTitle: string;
  availableColumns: any[];
}
export interface WhatIfBulkEditingObject {
  selectedRadio: string;
  availableColumns : any[] 
  sliderMinimumValue: any;
  sliderMaximumValue: any
  inputTitle: any;
}

export const PopupModal: React.FC<PopupModalProps> = ({
  availableColumns,
  onClose,
  onSubmit,
}) => {
  //radio 
  const [selectedRadio, setSelectedRadio] = useState(ARRAY_RADIO[0])

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
  /*
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
  */
  const handleOk = () => {
    if (selectedRadio === ARRAY_RADIO[0]) {
      // Create WhatIfSimulationObject when "edit_direct" is selected
      if (!validateInputs()) return;
      const newData: WhatIfSimulationObject = {
        selectedRadio: selectedRadio, // Assuming 'a1' is populated with inputValue or other data+
        availableColumns: availableColumns,
        inputTitle: inputValue
      };
      onSubmit(newData);
    } else if (selectedRadio === ARRAY_RADIO[1]) {
      // Validate inputs before submitting for "simulation_slider"
      if (!validateInputs()) return;

      const newData: WhatIfParameterType = {
        selectedRadio: selectedRadio,
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
    } else if (selectedRadio == ARRAY_RADIO[2]) {
      const columns = availableColumns//.filter((d: any) => !d.dataIndex.startsWith("Total"));
      const newData: WhatIfBulkEditingObject = {
        selectedRadio: selectedRadio, // Assuming 'a1' is populated with inputValue or other data+
        availableColumns: columns.slice(2),
        sliderMinimumValue: Number(maxInputValue),
        sliderMaximumValue: Number(maxInputValue),
        inputTitle: inputValue
      };
      onSubmit(newData);
    }
    
    // Reset form after submission
    resetForm();
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

  const showPopUpAccording = () => {
    if(selectedRadio==ARRAY_RADIO[0]) {
      return (
        showEditTextDirect()
      )
    } else if (selectedRadio==ARRAY_RADIO[1]) {
      return (
        showSimulationSlider()
      )
    } else if (selectedRadio==ARRAY_RADIO[2]) {
      return (
         showBulkEditing()
      )
    } else if (selectedRadio==ARRAY_RADIO[3]) {
      return (
        <></>
      )
    }
  }

  const showSimulationSlider = () => {
    return (
      <div>
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
      </div>
    )
  }
  const showEditTextDirect = () => {
    return (
      <div>
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
        {/*}
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
              {maxError && <div style={{ color: "red" }}>{maxError}</div>}  
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
        */}
      </div>
    )
  }
  const showBulkEditing = () => {
    return (
      <div> 
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
              {maxError && <div style={{ color: "red" }}>{maxError}</div>}  
            </div>
          )}
        </div> 
      </div>
    )
  }

  return (
    <Modal title="Enter Value for Scenario" visible={true} onOk={handleOk} onCancel={handleCancel} >
      <Radio.Group
        defaultValue={ARRAY_RADIO[0]}
        buttonStyle="solid"
        onChange={(e) => {
          // console.log(e)
          return setSelectedRadio(e.target.value)
        }}
        style={{ display: 'inline-block' }}>
        <Radio.Button value={ARRAY_RADIO[0]}>{ARRAY_RADIO[0]}</Radio.Button>
        <Radio.Button value={ARRAY_RADIO[1]}>{ARRAY_RADIO[1]}</Radio.Button>
        <Radio.Button value={ARRAY_RADIO[2]}>{ARRAY_RADIO[2]}</Radio.Button>
        {/*<Radio.Button value={ARRAY_RADIO[3]}>{ARRAY_RADIO[3]}</Radio.Button>*/}
      </Radio.Group>
      {/*scenrio pop up*/}
      {showPopUpAccording()}
    </Modal>
  );
};


