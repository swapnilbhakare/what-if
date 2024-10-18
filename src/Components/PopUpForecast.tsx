
//pop up through abhishek bhai
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Checkbox,
  Select,
  InputNumber,
  Flex,
  Radio,
  Form,
  Upload,
  DatePicker
} from "antd";
import type { SelectProps, InputNumberProps } from 'antd';
import { PercentageOutlined } from "@ant-design/icons"
import { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface PopupModalProps {
  availableColumns: any;
  onClose: () => void;
  onSubmit: (data: WhatIfParameterType | BlankForecastObject | ExistingForecastObject) => void; // Updated type
}

export const ARRAY_RADIO = [
  'Blank',
  'Future',
  'Existing',
]

export interface WhatIfParameterType {

  selectedRadio: string;
  inputTitle: string;
  availableColumns: any[];
  dateRange: any;

}
export interface BlankForecastObject {
  selectedRadio: string;
  inputTitle: string;
  availableColumns: any[];
  dateRange: any;
}
export interface ExistingForecastObject {
  selectedRadio: string;
  selectedColumn: any
  inputTitle: any;
}

export const PopupModal: React.FC<PopupModalProps> = ({
  availableColumns,
  onClose,
  onSubmit,
}) => {
  const [selectedRadio, setSelectedRadio] = useState(ARRAY_RADIO[0])

  const [inputValue, setInputValue] = useState<string>("");
  const [maxInputValue, setMaxInputValue] = useState<string>("");
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [varianceStyle, setVarianceStyle] = useState<string>("");
  const [maxError, setMaxError] = useState<string | null>(null);

  const [copyPreviousData, setCopyPreviousData] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);


  const [forecastRange, setForecastRange] = useState<[Dayjs, Dayjs] | null>(null);

  // Filter availableColumns to remove columns starting with "Scenario"
  const withoutScenerio = availableColumns.filter((d: any) => !d.dataIndex.startsWith("Scenario"));
  const options = withoutScenerio.slice(2).map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));
  useEffect(() => {
    console.log(inputValue)
  }, [inputValue])
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
    if (selectedRadio === ARRAY_RADIO[0]) {
      // Create WhatIfSimulationObject when "edit_direct" is selected
      if (!validateInputs()) return;
      const newData: BlankForecastObject = {
        selectedRadio: selectedRadio, // Assuming 'a1' is populated with inputValue or other data+
        availableColumns: availableColumns,
        inputTitle: inputValue,
        dateRange: forecastRange
      };
      console.log(newData, "NewData")
      onSubmit(newData);
    } else if (selectedRadio === ARRAY_RADIO[1]) {
      // Validate inputs before submitting for "simulation_slider"
      if (!validateInputs()) return;
      const newData: WhatIfParameterType = {
        selectedRadio: selectedRadio, // Assuming 'a1' is populated with inputValue or other data+
        availableColumns: availableColumns,
        inputTitle: inputValue,
        dateRange: forecastRange
      };
      onSubmit(newData);
    } else if (selectedRadio == ARRAY_RADIO[2]) {
      //for existing
      const columns = availableColumns//.filter((d: any) => !d.dataIndex.startsWith("Total"));
      const newData: ExistingForecastObject = {
        selectedRadio: selectedRadio, // Assuming 'a1' is populated with inputValue or other data+
        selectedColumn: selectedColumn,
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
    if (selectedRadio == ARRAY_RADIO[0]) {
      return (
        showBlankForecast()
      )
    } else if (selectedRadio == ARRAY_RADIO[1]) {
      return (
        showFutureForecast()
      )
    } else if (selectedRadio == ARRAY_RADIO[2]) {
      return (
        showExistingForecast()
      )
    }
  }
  const showBlankForecast = () => {
    return (
      <div>
        <label> Title</label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter forecast title"
          />
    
       <label> Date Range</label>
       <div>
          <RangePicker
            value={forecastRange}
            onChange={setForecastRange}
            format="YYYY-MM-DD"
          />
       </div>
      </div>
    )
  }
  const showExistingForecast = () => {
    return (
      <div>
        <div>
          <div>

          <label>Title</label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter forecast title"
              />
         
            <label>Select Existing Columns</label>
            <Select
              value={selectedColumn}
              onChange={(value) => setSelectedColumn(value)}
              style={{ width: "100%" }}
              options={options}
            />
          </div>

        </div>
      </div>
    )
  }
  const showFutureForecast = () => {
    return (
      <>
        <div>
        <label>Title</label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter forecast title"
            />
          
          <label> Date Range</label>
          <div>
            <RangePicker
              value={forecastRange}
              onChange={setForecastRange}
              format="YYYY-MM-DD"
            />
         </div>
        </div>
      </>
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













