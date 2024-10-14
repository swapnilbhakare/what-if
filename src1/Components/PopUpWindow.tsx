import React, { useState, useEffect } from "react";
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

export const PopupModal1: React.FC<PopupModalProps> = ({
  availableColumns, 
  onClose,
  onSubmit,
}) => {
  //title  -> Completed
  //insert as visual meausre / column 
  //simulation based on dropdown ---> Done
  //variance formatting style  --> 
  //value range 
  //description


  const [inputValue, setInputValue] = useState<string>("");
  const [minInputValue, setMinInputValue] = useState<string>("");
  const [maxInputValue, setMaxInputValue] = useState<string>("");
  const [incInputValue, setIncInputValue] = useState<string>("");
  const [defaultInputValue, setDefaultInputValue] = useState<string>("");

  const [copyPreviousData, setCopyPreviousData] = useState<boolean>(false);
  const [showSlider, setShowSlider] = useState<boolean>(false); // State for "Show slider" checkbox
  const [selectedColumn, setSelectedColumn] = useState<string>(""); // State for column dropdown
  const [varianceStyle, setVarianceStyle] = useState<string>(""); // State for variance style dropdown

  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [incError, setIncError] = useState<string | null>(null);

  // Options for the dropdown
  const options = availableColumns.map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));

  const varianceOptions = [
    { label: "Positive", value: "Positive" },
    { label: "Negative", value: "Negative" },
    { label: "Neutral", value: "Neutral" },
  ];

  // Validate if the input values are numbers
  const validateInputs = () => {
    let valid = true;
    if (isNaN(Number(minInputValue))) {
      setMinError("Please enter a valid number");
      valid = false;
    } else {
      setMinError(null);
    }

    if (isNaN(Number(maxInputValue))) {
      setMaxError("Please enter a valid number");
      valid = false;
    } else {
      setMaxError(null);
    }

    if (isNaN(Number(incInputValue))) {
      setIncError("Please enter a valid number");
      valid = false;
    } else {
      setIncError(null);
    }

    return valid;
  };

  // Handle form submission
  const handleOk = () => {
    if (!validateInputs()) return; // If validation fails, do not submit
    // setMinInputValue(`${maxInputValue}`)
    // setMaxInputValue(`${maxInputValue}`)
    const newData = {
      name: inputValue,
      sliderMinimumValue: Number(maxInputValue),
      sliderMaximumValue: Number(maxInputValue),
      sliderIncrementByValue: 1, //Number(incInputValue),
      sliderDefaultValue: defaultInputValue,
      copyPreviousData: true,
      selectedColumn, // Pass the selected column
      varianceStyle, // Pass the variance style
      showSlider, // Pass the "Show slider" value
    };

    onSubmit(newData); // Pass the input values to the parent component
    resetForm();
    onClose(); // Close the modal
  };

  // Handle modal cancellation
  const handleCancel = () => {
    resetForm();
    onClose(); // Close the modal
  };

  // Reset form fields
  const resetForm = () => {
    setInputValue("");
    setMinInputValue("");
    setMaxInputValue("");
    setIncInputValue("");
    setDefaultInputValue("");
    setCopyPreviousData(false);
    setShowSlider(false); // Reset the "Show slider" checkbox
    setSelectedColumn(""); // Reset the selected column
    setVarianceStyle(""); // Reset the variance style
    setMinError(null);
    setMaxError(null);
    setIncError(null);
  };

  return (
    <Modal title="Enter Value for Scenario" visible={true} onOk={handleOk} onCancel={handleCancel}>
      {/* Title Input */}
      <span>
        <label>Title</label>
        <Input
          placeholder="Enter name here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </span>

      {/* Simulation based on which column name */}
      <label>Simulation based on</label>
      <Select
        labelRender={({ value }) => value}
        value={selectedColumn}
        onChange={(value) => setSelectedColumn(value)}
        style={{ width: "100%" }}
        options={options}
      />

      {/* Variance formatting style */}
      <label>Variance Formatting Style</label>
      <Select
        labelRender={({ value }) => value}
        value={varianceStyle}
        onChange={(value) => setVarianceStyle(value)}
        style={{ width: "100%" }}
        options={varianceOptions}
      />

      {/* Checkbox for copying previous data */}
      {/*<div style={{ marginTop: "16px" }}>
        <Checkbox
          checked={copyPreviousData}
          onChange={(e) => setCopyPreviousData(e.target.checked)}
        >
          Copy previous data
        </Checkbox>
      </div>*/}

      {/* Show slider checkbox */}
      <div style={{ marginTop: "16px" }}>
        <Checkbox
          checked={showSlider}
          onChange={(e) => setShowSlider(e.target.checked)}
        >
          Show slider
        </Checkbox>
      </div>

      {/* Value range fields */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
        {/*<span>
          <label>Minimum</label>
          <Input
            placeholder="Enter min value here..."
            value={minInputValue}
            onChange={(e) => setMinInputValue(e.target.value)}
          />
          {minError && <div style={{ color: "red" }}>{minError}</div>}
        </span>*/}
        <span>
          <label>Maximum</label>
          <Input
            placeholder="Enter max value here..."
            value={maxInputValue}
            onChange={(e) => setMaxInputValue(e.target.value)}
          />
          {maxError && <div style={{ color: "red" }}>{maxError}</div>}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
        {/*<span>
          <label>Increment</label>
          <Input
            placeholder="Enter increment value here..."
            value={incInputValue}
            onChange={(e) => setIncInputValue(e.target.value)}
          />
          {incError && <div style={{ color: "red" }}>{incError}</div>}
        </span> */}
      </div>
    </Modal>
  );
};



export const PopupModal2: React.FC<PopupModalProps> = ({
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

  // Options for the dropdown
  const withoutScenerio = availableColumns.filter((d: any) => !d.dataIndex.startsWith("Scenario"));
  console.log(withoutScenerio)
  const options = withoutScenerio.slice(2).map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));


  const varianceOptions = [
    { label: "Positive", value: "Positive" },
    { label: "Negative", value: "Negative" },
    { label: "Neutral", value: "Neutral" },
  ];

  const validateInputs = () => {
    let valid = true;
    if (isNaN(Number(maxInputValue))) {
      setMaxError("Please enter a valid number");
      valid = false;
    } else {
      setMaxError(null);
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
    setCopyPreviousData(false)
  };

  return (
    <Modal title="Enter Value for Scenario" visible={true} onOk={handleOk} onCancel={handleCancel}>
      <span>
        <label>Title</label>
        <Input
          placeholder="Enter name here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </span>

      <label>Simulation based on</label>
      <Select
        value={selectedColumn}
        onChange={(value) => setSelectedColumn(value)}
        style={{ width: "100%" }}
        options={options}
      />

      {/*<label>Variance Formatting Style</label>
      <Select
        value={varianceStyle}
        onChange={(value) => setVarianceStyle(value)}
        style={{ width: "100%" }}
        options={varianceOptions}
      />*/}

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

    </Modal>
  );
};

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



// import React, { useState, useEffect } from "react";
// import { Modal, Button, Input, Checkbox } from "antd";

// interface PopupModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: ({
//     name,
//     sliderMinimumValue,
//     sliderMaximumValue,
//     sliderIncrementByValue,
//     sliderDefaultValue,
//     copyPreviousData // Include the checkbox value in onSubmit parameters
//   }: WhatIfParameterType) => void;
// }

// export interface WhatIfParameterType {
//   name: string;
//   sliderMinimumValue: any;
//   sliderMaximumValue: any;
//   sliderIncrementByValue: any;
//   sliderDefaultValue: any;
//   copyPreviousData: boolean; // Add checkbox value
// }


// export const PopupModal: React.FC<PopupModalProps> = ({
//   visible,
//   onClose,
//   onSubmit,
// }) => {
//   const [inputValue, setInputValue] = useState<string>("");
//   const [minInputValue, setMinInputValue] = useState<string>("");
//   const [maxInputValue, setMaxInputValue] = useState<string>("");
//   const [incInputValue, setIncInputValue] = useState<string>("");
//   const [defaultInputValue, setDefaultInputValue] = useState<string>("");

//   const [copyPreviousData, setCopyPreviousData] = useState<boolean>(false);
  

//   const [minError, setMinError] = useState<string | null>(null);
//   const [maxError, setMaxError] = useState<string | null>(null);
//   const [incError, setIncError] = useState<string | null>(null);

//   // Validate if the input values are numbers
//   const validateInputs = () => {
//     let valid = true;
//     if (isNaN(Number(minInputValue))) {
//       setMinError("Please enter a valid number");
//       valid = false;
//     } else {
//       setMinError(null);
//     }

//     if (isNaN(Number(maxInputValue))) {
//       setMaxError("Please enter a valid number");
//       valid = false;
//     } else {
//       setMaxError(null);
//     }

//     if (isNaN(Number(incInputValue))) {
//       setIncError("Please enter a valid number");
//       valid = false;
//     } else {
//       setIncError(null);
//     }

//     return valid;
//   };
 
//   // Handle form submission
//   const handleOk = () => {
//     if (!validateInputs()) return; // If validation fails, do not submit

//     const newData = {
//       name: inputValue,
//       sliderMinimumValue: Number(minInputValue),
//       sliderMaximumValue: Number(maxInputValue),
//       sliderIncrementByValue: Number(incInputValue),
//       sliderDefaultValue: defaultInputValue,
//       copyPreviousData: copyPreviousData, // Pass the checkbox value
//     };

//     onSubmit(newData); // Pass the input values to the parent component  
//     resetForm();
//     onClose(); // Close the modal
//   };


//   // Handle modal cancellation
//   const handleCancel = () => {
//     resetForm();
//     onClose(); // Close the modal
//   };

//   // Reset form fields
//   const resetForm = () => {
//     setInputValue("");
//     setMinInputValue("");
//     setMaxInputValue("");
//     setIncInputValue("");
//     setDefaultInputValue("");
//     setCopyPreviousData(false); // Reset the checkbox
//     setMinError(null);
//     setMaxError(null);
//     setIncError(null);
//   };


//   return (
//     <Modal title="Enter Value for Scenario" visible={visible} onOk={handleOk} onCancel={handleCancel}>
//       <span>
//         <label>Name</label>
//         <Input
//           placeholder="Enter name here..."
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//         />
//       </span>

//       {/* Checkbox for copying previous data */}
//       <div style={{ marginTop: "16px" }}>
//         <Checkbox
//           checked={copyPreviousData}
//           onChange={(e) => setCopyPreviousData(e.target.checked)}
//         >
//           Copy previous data
//         </Checkbox>
//       </div>

//       {/* Flexbox for aligning spans in a single row */}
//       <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
//         <span>
//           <label>Minimum</label>
//           <Input
//             placeholder="Enter min value here..."
//             value={minInputValue}
//             onChange={(e) => setMinInputValue(e.target.value)}
//             // disabled={copyPreviousData} // Disable editing if copying
//           />
//           {minError && <div style={{ color: "red" }}>{minError}</div>}
//         </span>
//         <span>
//           <label>Maximum</label>
//           <Input
//             placeholder="Enter max value here..."
//             value={maxInputValue}
//             onChange={(e) => setMaxInputValue(e.target.value)}
//             // disabled={copyPreviousData} // Disable editing if copying
//           />
//           {maxError && <div style={{ color: "red" }}>{maxError}</div>}
//         </span>
//       </div>

//       <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
//         <span>
//           <label>Increment</label>
//           <Input
//             placeholder="Enter increment value here..."
//             value={incInputValue}
//             onChange={(e) => setIncInputValue(e.target.value)}
//             // disabled={copyPreviousData} // Disable editing if copying
//           />
//           {incError && <div style={{ color: "red" }}>{incError}</div>}
//         </span>
//       </div>
//     </Modal>
//   );
// };
