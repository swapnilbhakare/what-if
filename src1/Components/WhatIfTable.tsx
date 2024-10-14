/* eslint-disable max-lines-per-function */
import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "./whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { Pagination } from 'antd';
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, EditOutlined, ShrinkOutlined } from "@ant-design/icons";
import {PopupModal, WhatIfParameterType} from "./PopUpWindow"

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

// const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
//   title,
//   editable,
//   children,
//   dataIndex,
//   record,
//   minValue,
//   maxValue,
//   stepValue,
//   copy,
//   handleSave,
//   ...restProps
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
//   const [percentageChange, setPercentageChange] = useState<number>(0);
//   const [visible, setVisible] = useState(false);

// // Check if dataIndex is a valid string and contains a '(' before splitting
// let extractedPropertyName1 = '';

// if (typeof dataIndex === 'string' && dataIndex.includes('(')) {
//   extractedPropertyName1 = dataIndex.split('(')[1].replace(')', '');
// } else {
//   console.error('Invalid dataIndex:', dataIndex);
//   // Provide a fallback or handle the error
//   extractedPropertyName1 = ''; // Set a default or throw an error based on your requirement
// }

// // Safeguard for record and extracted property name
// const dataValue = parseFloat(record?.[extractedPropertyName1] || 0);

// // Ensure that maxValue and minValue are valid numbers
// const safeMaxValue = typeof maxValue === 'number' ? maxValue : 0;
// const safeMinValue = typeof minValue === 'number' ? minValue : 0;

// // Calculate max slider value
// const calclatedMaxSliderValue = parseFloat(
//   (dataValue + (dataValue * safeMaxValue) / 100).toFixed(2)
// );

// // Calculate min slider value
// const calclatedMinSliderValue = parseFloat(
//    (dataValue - ((dataValue * safeMinValue) / 100)).toFixed(2)
// ); 
//   const inputRef = useRef<InputRef>(null);
//   const form = useContext(EditableContext)!;

//   // Initialize slider value when entering edit mode or when props change
//   useEffect(() => {
//     if (editing) {
//       setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
//     }
//   }, [editing, record, dataIndex]);

//   // Handle "copy" logic: if `copy` is true, sync the value when the column is copied
//   useEffect(() => {
//     if (copy && record[dataIndex]) {
//       setSliderValue(parseFloat(String(record[dataIndex] || "0")));
//     }
//   }, [copy, dataIndex, record]);

//   const toggleEdit = () => {
//     setEditing(!editing);
//     setVisible((prevVisible) => !prevVisible);
//     form.setFieldsValue({ [dataIndex]: record[dataIndex] || "0" });
//   };

//   const save = async () => {
//     try {
//       const values = await form.validateFields();
//       toggleEdit();
//       handleSave({ ...record, ...values });
//     } catch (errInfo) {
//       console.log("Save failed:", errInfo);
//     }
//   };

//   // Handle slider value and percentage change calculations
//   const handleSliderChange = (value: number) => {
//     const extractedPropertyName = dataIndex.split('(')[1].replace(')', '');
//     const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
//     const percentage = ((value - prevValue) / prevValue) * 100;

//     setSliderValue(value);
//     setPercentageChange(percentage);

//     const newValue = `${value}`;
//     form.setFieldsValue({ [dataIndex]: newValue });
//     handleSave({
//       ...record,
//       [dataIndex]: newValue,
//       percentageChange: `${percentage.toFixed(2)}%`,
//       minValue: calclatedMinSliderValue,
//       maxValue: calclatedMaxSliderValue,
//       stepValue,
//       copy,
//     });
//   }; 



// const popoverContent = (
//   <div>
//     <div style={{ width: 150, position: "relative" }}>
//       {/* Flex container for the slider and delete button */}
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <Slider
//           min={calclatedMinSliderValue}
//           max={calclatedMaxSliderValue}
//           step={stepValue}
//           value={sliderValue}
//           onChange={handleSliderChange}
//           style={{ width: "100%" }}
//         />
//         {/* Delete button on the right-hand side */}
//         <Button
//           type="link"
//           icon={<DeleteOutlined />}
//           onClick={() => {
//             setSliderValue(dataValue)
//             setPercentageChange(0)
//           }}
//           style={{ marginLeft: 8 }}
//         />
//       </div>
      
//       {/* This section is moved below the slider */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginTop: "4px",
//           fontSize: "12px",
//           width: "100%",
//           color: "#999",
//         }}
//       >
//         <span>{calclatedMinSliderValue}</span>
//         <span>{calclatedMaxSliderValue}</span>
//       </div>
//     </div>

//     {/* Input field below the slider */}
//     <Input
//       ref={inputRef}
//       style={{ width: 100, marginTop: 8 }}
//       onPressEnter={save}
//       onBlur={save}
//       type="number"
//       value={sliderValue}
//       onChange={(e) => {
//         const value = parseFloat(e.target.value) || 0;
//         setSliderValue(value);
//         handleSliderChange(value);
//       }}
//     />
//   </div>
// );


//   // Ensure proper Popover visibility control
//   const handleVisibleChange = (newVisible: boolean) => {
//     setVisible(newVisible);
//     if (!newVisible) {
//       setEditing(false); // Exit edit mode when Popover is closed
//     }
//   };

//   let childNode = children;

//   // Formatting cell content with value and percentage change
//   const formattedCellContent = (
//     <div>
//       <span>{sliderValue}</span>
//       <span style={{ fontSize: "0.8em", marginLeft: 8 }}>
//         {percentageChange > 0 ? (
//           <span style={{ color: "green" }}>
//             <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : percentageChange < 0 ? (
//           <span style={{ color: "red" }}>
//             <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : (
//           <span>{percentageChange.toFixed(2)}%</span>
//         )}
//       </span>
//     </div>
//   );

//   if (editable) {
//     childNode = editing ? (
//       <Popover
//         content={popoverContent}
//         title=""
//         trigger="hover"
//         visible={visible}
//         onVisibleChange={handleVisibleChange}
//       >
//         <div>
//           <span onHover={() => setEditing(true)}>{formattedCellContent}</span>
//         </div>
//       </Popover>
//     ) : (
//       <div
//         className="editable-cell-value-wrap"
//         style={{ paddingInlineEnd: 24 }}
//         onClick={toggleEdit}
//       >
//         {formattedCellContent}
//       </div>
//     );
//   }

//   return <td {...restProps}>{childNode || record[dataIndex]}</td>;
// };
// const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
//   title,
//   editable,
//   children,
//   dataIndex,
//   record,
//   minValue,
//   maxValue,
//   stepValue,
//   copy,
//   handleSave,
//   ...restProps
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
//   const [percentageChange, setPercentageChange] = useState<number>(0);
//   const [visible, setVisible] = useState(false);

//   // Calculate max and min slider values
//   const extractedPropertyName = typeof dataIndex === 'string' && dataIndex.includes('(')
//     ? dataIndex.split('(')[1].replace(')', '')
//     : '';

//   const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
//   const safeMaxValue = typeof maxValue === 'number' ? maxValue : 0;
//   const safeMinValue = typeof minValue === 'number' ? minValue : 0;

//   const calclatedMaxSliderValue = parseFloat(
//     (dataValue + (dataValue * safeMaxValue) / 100).toFixed(2)
//   );

//   const calclatedMinSliderValue = parseFloat(
//     (dataValue - ((dataValue * safeMinValue) / 100)).toFixed(2)
//   );

//   const inputRef = useRef<InputRef>(null);
//   const form = useContext(EditableContext)!;

//   const toggleEdit = () => {
//     setEditing(!editing);
//     setVisible((prevVisible) => !prevVisible);
//     form.setFieldsValue({ [dataIndex]: record[dataIndex] || "0" });
//   };

//   const save = async () => {
//     try {
//       const values = await form.validateFields();
//       toggleEdit();
//       handleSave({ ...record, ...values });
//     } catch (errInfo) {
//       console.log("Save failed:", errInfo);
//     }
//   };

//   const handleSliderChange = (value: number) => {
//     const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
//     const percentage = ((value - prevValue) / prevValue) * 100;

//     setSliderValue(value);
//     setPercentageChange(percentage);

//     const newValue = `${value}`;
//     form.setFieldsValue({ [dataIndex]: newValue });
//     handleSave({
//       ...record,
//       [dataIndex]: newValue,
//       percentageChange: `${percentage.toFixed(2)}%`,
//       minValue: calclatedMinSliderValue,
//       maxValue: calclatedMaxSliderValue,
//       stepValue,
//       copy,
//     });
//   };

//   const popoverContent = (
//     <div>
//       <div style={{ width: 150, position: "relative" }}>
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <Slider
//             min={calclatedMinSliderValue}
//             max={calclatedMaxSliderValue}
//             step={stepValue}
//             value={sliderValue}
//             onChange={handleSliderChange}
//             style={{ width: "100%" }}
//           />
//           <Button
//             type="link"
//             icon={<DeleteOutlined />}
//             onClick={() => {
//               setSliderValue(dataValue);
//               setPercentageChange(0);
//             }}
//             style={{ marginLeft: 8 }}
//           />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "12px", width: "100%", color: "#999" }}>
//           <span>{calclatedMinSliderValue}</span>
//           <span>{calclatedMaxSliderValue}</span>
//         </div>
//       </div>
//       <Input
//         ref={inputRef}
//         style={{ width: 100, marginTop: 8 }}
//         onPressEnter={save}
//         onBlur={save}
//         type="number"
//         value={sliderValue}
//         onChange={(e) => {
//           const value = parseFloat(e.target.value) || 0;
//           setSliderValue(value);
//           handleSliderChange(value);
//         }}
//       />
//     </div>
//   );

//   // Handle visibility on hover
//   const handleVisibleChange = (newVisible: boolean) => {
//     setVisible(newVisible);
//     if (!newVisible) {
//       setEditing(false); // Exit edit mode when Popover is closed
//     }
//   };

//   const formattedCellContent = (
//     <div>
//       <span>{sliderValue}</span>
//       <span style={{ fontSize: "0.8em", marginLeft: 8 }}>
//         {percentageChange > 0 ? (
//           <span style={{ color: "green" }}>
//             <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : percentageChange < 0 ? (
//           <span style={{ color: "red" }}>
//             <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : (
//           <span>{percentageChange.toFixed(2)}%</span>
//         )}
//       </span>
//     </div>
//   );

//   if (editable) {
//     return (
//       <Popover
//         content={popoverContent}
//         title=""
//         trigger="hover"
//         visible={visible}
//         onVisibleChange={handleVisibleChange}
//       >
//         <div
//           className="editable-cell-value-wrap"
//           style={{ paddingInlineEnd: 24 }}
//           onMouseEnter={() => setVisible(true)}
//           onMouseLeave={() => setVisible(false)}
//         >
//           {formattedCellContent}
//         </div>
//       </Popover>
//     );
//   }

//   return <td {...restProps}>{children}</td>;
// };  
const EditableCell1: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);

  // Calculate max and min slider values
  const extractedPropertyName = typeof dataIndex === 'string' && dataIndex.includes('(')
    ? dataIndex.split('(')[1].replace(')', '')
    : '';

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === 'number' ? maxValue : 0;
  const safeMinValue = typeof minValue === 'number' ? minValue : 0;

  const calclatedMaxSliderValue = parseFloat(
    (dataValue + (dataValue * safeMaxValue) / 100).toFixed(2)
  );

  const calclatedMinSliderValue = parseFloat(
    (dataValue - ((dataValue * safeMinValue) / 100)).toFixed(2)
  );

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const handleSliderChange = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = ((value - prevValue) / prevValue) * 100;

    setSliderValue(value);
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${value}` });
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const popoverContent = (
    <div style={{ width: 150 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Slider
          min={calclatedMinSliderValue}
          max={calclatedMaxSliderValue}
          step={stepValue}
          value={sliderValue}
          onChange={handleSliderChange}
          style={{ width: "100%" }}
        />
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => {
            setSliderValue(dataValue);
            setPercentageChange(0);
          }}
          style={{ marginLeft: 8 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "12px", color: "#999" }}>
        <span>{calclatedMinSliderValue}</span>
        <span>{calclatedMaxSliderValue}</span>
      </div>
      <Input
        ref={inputRef}
        style={{ width: 100, marginTop: 8 }}
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          setSliderValue(value);
          handleSliderChange(value);
        }}
      />
    </div>
  );

const formattedCellContent = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ marginRight: 8 }}>{sliderValue}</span>
    <span style={{ fontSize: "0.7em", marginLeft: 8 }}> {/* Decreased font size to 0.7em */}
      {percentageChange > 0 ? (
        <span style={{ color: "green" }}>
          <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
        </span>
      ) : percentageChange < 0 ? (
        <span style={{ color: "red" }}>
          <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
        </span>
      ) : (
        <span>{percentageChange.toFixed(2)}%</span>
      )}
    </span>
    <Button
      type="link"
      icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
      onClick={(e) => {
        e.stopPropagation(); // Prevent click from bubbling to parent div
        setVisible(prev => !prev); // Toggle visibility on button click
      }}
      style={{ marginLeft: 8, padding: 0, height: 0 }}
    />
  </div>
);

  if (editable) {
    return (
      <>
        <div
          className="editable-cell-value-wrap"
          style={{ paddingInlineEnd: 24, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center' }}
        >
          {formattedCellContent}
        </div>
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        >
          <div></div> {/* Empty div to maintain layout */}
        </Popover>
      </>
    );
  }

  return <td {...restProps}>{children}</td>;
};
const EditableCell2: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false)

  const extractedPropertyName =
    typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat(
    (dataValue + (dataValue * safeMaxValue) / 100).toFixed(2)
  );
  const calculatedMinSliderValue = parseFloat(
    (dataValue - (dataValue * safeMinValue) / 100).toFixed(2)
  );

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const handleSliderChange = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = ((value - prevValue) / prevValue) * 100;

    setSliderValue(value);
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${value}` });
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
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
            setSliderValue(dataValue);
            setPercentageChange(0);
          }}
          style={{ marginLeft: 8 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "12px",
          color: "#999",
        }}
      >
        <span>{calculatedMinSliderValue}</span>
        <span>{calculatedMaxSliderValue}</span>
      </div>
      <Input
        ref={inputRef}
        style={{ width: 100, marginTop: 8 }}
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          setSliderValue(value);
          handleSliderChange(value);
        }}
      />
    </div>
  );

  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      <Button
        type="link"
        icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        style={{ marginLeft: 8 }}
      />
    </div>
  );

  if (editable) {
    return (
      <td {...restProps}>
        <div
          onDoubleClick={() => setIsCellEditable(true)}
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
           {isCellEditable ? (
              <input
                type="text"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                onBlur={save} // Optional: Save on blur
                style={{ width: "100%" }} // Optional: Make the input take full width
              />
            ) : (
              formattedCellContent // No curly braces needed here
            )}
        </div>
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        > 
        </Popover>
      </td>
    );
  }
  console.log("Cell Editable?", isCellEditable)
  return <td {...restProps} onClick={() => setIsCellEditable(false)}>{children}</td>;
}; 
const EditableCell3: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!; 

  const extractedPropertyName = typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  const handleSliderChange = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = ((value - prevValue) / prevValue) * 100;

    setSliderValue(value);
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${value}` });
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
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
            setSliderValue(dataValue);
            setPercentageChange(0);
          }}
          style={{ marginLeft: 8 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "12px",
          color: "#999",
        }}
      >
        <span>{calculatedMinSliderValue}</span>
        <span>{calculatedMaxSliderValue}</span>
      </div>
      <Input
        ref={inputRef}
        style={{ width: 100, marginTop: 8 }}
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          setSliderValue(value);
          handleSliderChange(value);
        }}
      />
    </div>
  );

  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      <Button
        type="link"
        icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        style={{ marginLeft: 8 }}
      />
    </div>
  );

const [textValue, setIsTextValue] = useState<any>(String(record?.[dataIndex] || "0")) 

if (editable) {
  return (
    <td {...restProps} onClick={() => {
      console.log("False");
      setIsCellEditable(false);
    }}>
      <div
        onDoubleClick={() => {
          console.log("True");
          setIsCellEditable(true);
        }}
        className="editable-cell-value-wrap"
        style={{
          paddingInlineEnd: 24,
          cursor: "pointer",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isCellEditable ? (
          <input
            type="text"
            value={textValue}
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click from bubbling up to the <td>
              console.log("True in Input");
              setIsCellEditable(true);
            }}
            onChange={(e) => {
              //setSliderValue(parseFloat(e.target.value))
              setIsTextValue(e.target.value)
              console.log(e.target.value)
            }}
            style={{ width: "100%" }} // Optional: Make the input take full width
          />
        ) : (
          formattedCellContent
        )}
      </div>
      <Popover
        content={popoverContent}
        title=""
        trigger="click"
        visible={visible}
        onVisibleChange={setVisible}
        placement="right"
      />
    </td>
  );
}


  return <td {...restProps} onClick={() => {}}>{children}</td>;
};
const EditableCellLastCommit: React.FC<React.PropsWithChildren<EditableCellProps>> = ({ 
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<any>(String(record?.[dataIndex] || "0")); 

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!; 

  const extractedPropertyName = typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  const handleSliderChange = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = ((value - prevValue) / prevValue) * 100;

    setSliderValue(value);
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${value}` });
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };
  const calculateValue = (inputText: string): number => {
      const operators: string[] = []; // Stack to store operators
      const values: number[] = []; // Stack to store values
      
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
          if (numStr.endsWith('k')) {
              value *= 1_000;
          } else if (numStr.endsWith('m')) {
              value *= 1_000_000;
          } else if (numStr.endsWith('cr')) {
              value *= 10_000_000;
          } else if (numStr.endsWith('%')) {
              value = (value / 100) * (values.length ? values[values.length - 1] : 0);
          }
          return value;
      };

      while (i < inputText.length) {
          // Ignore whitespace
          if (inputText[i] === ' ') {
              i++;
              continue;
          }

          // If the current character is a digit or a decimal point, extract the full number (with potential suffix)
          if (/\d|\./.test(inputText[i])) {
              let numStr = '';
              while (i < inputText.length && (/\d|\./.test(inputText[i]) || /[kKmMcrCR%]/.test(inputText[i]))) {
                  numStr += inputText[i++];
              }
              const value = getValueWithSuffix(numStr.toLowerCase());
              values.push(value);
          } 
          // If the current character is an operator
          else if (/[+\-*/]/.test(inputText[i])) {
              const currentOperator = inputText[i];

              // Handle precedence of * and /
              while (operators.length > 0 && (currentOperator === '+' || currentOperator === '-') && (operators[operators.length - 1] === '*' || operators[operators.length - 1] === '/')) {
                  applyOperator();
              }

              operators.push(currentOperator);
              i++;
          }
      }

      // Apply remaining operators
      while (operators.length > 0) {
          applyOperator();
      }

      // Return final result
      return values.length > 0 ? values[0] : 0;
  };

  // Testing the function
  console.log("200 + 10:", calculateValue("200 + 10")); // Output: 110
  console.log("100 - 10:", calculateValue("100 - 10")); // Output: 90
  console.log("600 * 2:", calculateValue("600 * 2")); // Output: 200
  console.log("100 / 2:", calculateValue("100 / 2")); // Output: 50
  console.log("100 + 10%:", calculateValue("100 + 10%")); // Output: 110
  console.log("100 + 5m:", calculateValue("100 + 5m")); // Output: 10000100



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);

    // Try to calculate based on new value
    const calculatedValue = calculateValue(newValue);
    console.log('Calculated Value:', calculatedValue); // Check the calculated value
    setSliderValue(calculatedValue); // Update sliderValue with calculated value
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
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
            setSliderValue(dataValue);
            setPercentageChange(0);
          }}
          style={{ marginLeft: 8 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "12px",
          color: "#999",
        }}
      >
        <span>{calculatedMinSliderValue}</span>
        <span>{calculatedMaxSliderValue}</span>
      </div>
      <Input
        ref={inputRef}
        style={{ width: 100, marginTop: 8 }}
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          setSliderValue(value);
          handleSliderChange(value);
        }}
      />
    </div>
  );

  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      <Button
        type="link"
        icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        style={{ marginLeft: 8 }}
      />
    </div>
  );

  if (editable) {
    return (
      <td {...restProps} onClick={() => {
        console.log("False");
        setIsCellEditable(false);
      }}>
        <div
          onDoubleClick={() => {
            console.log("True");
            setIsCellEditable(true);
          }}
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isCellEditable ? (
            <input
              type="text"
              value={textValue}
              onClick={(e) => {
                e.stopPropagation(); // Prevent the click from bubbling up to the <td>
                console.log("True in Input");
                setIsCellEditable(true);
              }}
              onChange={handleInputChange}
              style={{ width: "100%" }} // Optional: Make the input take full width
            />
          ) : (
            formattedCellContent
          )}
        </div>
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        />
      </td>
    );
  }

  return <td {...restProps}>{children}</td>;
};
const EditableCelll: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<any>(String(record?.[dataIndex] || "0"));

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const extractedPropertyName = typeof dataIndex === "string" && dataIndex.includes("(")
    ? dataIndex.split("(")[1].replace(")", "")
    : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  const calculatePercentageChange = (newValue: number, baseValue: number): number => {
    return ((newValue - baseValue) / baseValue) * 100;
  };

  const handleSliderChange = (value: number) => {
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(value, prevValue);

    setSliderValue(value);
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${value}` });
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
      minValue: calculatedMaxSliderValue,
      maxValue: calculatedMinSliderValue,
      stepValue,
      copy,
    });
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
    if (numStr.endsWith('k')) {
      value *= 1_000;
    } else if (numStr.endsWith('m')) {
      value *= 1_000_000;
    } else if (numStr.endsWith('cr')) {
      value *= 10_000_000;
    } else if (numStr.endsWith('%')) {
      value = (value / 100) * (values.length ? values[values.length - 1] : 0);
    }
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

      while (operators.length > 0 && (currentOperator === '+' || currentOperator === '-') && (operators[operators.length - 1] === '*' || operators[operators.length - 1] === '/')) {
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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);

    const calculatedValue = calculateValue(newValue);
    const percentage = calculatePercentageChange(calculatedValue, dataValue);

    setSliderValue(calculatedValue);
    setPercentageChange(percentage);
    
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });
    handleSave({
      ...record,
      [dataIndex]: `${calculatedValue}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
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
            setSliderValue(dataValue);
            setPercentageChange(0);
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
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={handleInputChange}
      />
    </div>
  );

  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      <Button
        type="link"
        icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        style={{ marginLeft: 8 }}
      />
    </div>
  );
  let childNode = children

  if (editable) {
    childNode = (
      <td {...restProps} onClick={() => setIsCellEditable(false)}>
        <div
          onDoubleClick={() => setIsCellEditable(true)}
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isCellEditable ? (
            <input
              type="text"
              value={textValue}
              onClick={(e) => e.stopPropagation()}
              onChange={handleInputChange}
              style={{ width: "100%" }}
            />
          ) : (
            formattedCellContent
          )}
        </div>
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        />
      </td>
    );
  }

  return <td {...restProps}>{childNode || record[dataIndex]}</td>;
};
const EditableCellll: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  minValue,
  maxValue,
  stepValue,
  copy,
  handleSave,
  ...restProps
}) => {
  const [sliderValue, setSliderValue] = useState<number>(parseFloat(String(record?.[dataIndex] || "0")));
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<any>(String(record?.[dataIndex] || "0"));

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const extractedPropertyName = typeof dataIndex === "string" && dataIndex.includes("(")
    ? dataIndex.split("(")[1].replace(")", "")
    : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || 0);
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  // Calculate initial values from the record whenever it changes
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
      if (numStr.endsWith('k')) {
        value *= 1_000;
      } else if (numStr.endsWith('m')) {
        value *= 1_000_000;
      } else if (numStr.endsWith('cr')) {
        value *= 10_000_000;
      } else if (numStr.endsWith('%')) {
        value = (value / 100) * (values.length ? values[values.length - 1] : 0);
      }
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

        while (operators.length > 0 && (currentOperator === '+' || currentOperator === '-') && (operators[operators.length - 1] === '*' || operators[operators.length - 1] === '/')) {
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
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(value, prevValue);

    setSliderValue(value);
    setPercentageChange(percentage);
    form.setFieldsValue({ [dataIndex]: `${value}` });
    
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const handleInputChange = (e: any) => {
    /*
    const newValue = e.target.value;
    setTextValue(newValue);
    
    const calculatedValue = calculateValue(newValue); // Ensure this function returns the intended numeric value
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(calculatedValue, prevValue);
    // const percentage = calculatePercentageChange(calculatedValue, sliderValue); // Use sliderValue here instead

    // setSliderValue(calculatedValue);
    setPercentageChange(percentage);
    
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });
    handleSave({
      ...record,
      [dataIndex]: `${calculatedValue}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });

    setIsCellEditable(false)
    */
    const newValue = e.target.value;
    setTextValue(newValue);

    const calculatedValue = calculateValue(newValue);
    const percentage = calculatePercentageChange(calculatedValue, dataValue);

    setSliderValue(calculatedValue);
    setPercentageChange(percentage);
    
    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });
    handleSave({
      ...record,
      [dataIndex]: `${calculatedValue}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
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
            setSliderValue(dataValue);
            setPercentageChange(0);
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
        onPressEnter={save}
        onBlur={save}
        type="number"
        value={sliderValue}
        onChange={handleInputChange}
      />
    </div>
  );

  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      <Button
        type="link"
        icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        style={{ marginLeft: 8 }}
      />
    </div>
  );

  let childNode = children;

  if (editable) {
    childNode = (
      <td {...restProps} onClick={() => setIsCellEditable(false)}>
        <div
          onDoubleClick={() => setIsCellEditable(true)}
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isCellEditable ? (
            <input
              type="text"
              value={textValue}
              onClick={(e) => e.stopPropagation()}
              onChange={handleInputChange}
              style={{ width: "100%" }}
            />
          ) : (
            formattedCellContent
          )}
        </div>
        <Popover
          content={popoverContent}
          title=""
          trigger="click"
          visible={visible}
          onVisibleChange={setVisible}
          placement="right"
        />
      </td>
    );
  }

  return <td {...restProps} onClick={() => setIsCellEditable(false)}>{childNode || record[dataIndex]}</td>;
};
const EditableCellllll: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
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
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [isCellEditable, setIsCellEditable] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>(String(record?.[dataIndex] || "0"));

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const extractedPropertyName =
    typeof dataIndex === "string" && dataIndex.includes("(")
      ? dataIndex.split("(")[1].replace(")", "")
      : "";

  const dataValue = parseFloat(record?.[extractedPropertyName] || "0");
  const safeMaxValue = typeof maxValue === "number" ? maxValue : 0;
  const safeMinValue = typeof minValue === "number" ? minValue : 0;

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));

  useEffect(() => {
    setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
    setTextValue(String(record?.[dataIndex] || "0"));

    // setPercentageChange(0)
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
    const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
    const percentage = calculatePercentageChange(value, prevValue);

    setSliderValue(value);
    setPercentageChange(percentage);
    form.setFieldsValue({ [dataIndex]: `${value}` }); // i have to change
    
    handleSave({
      ...record,
      [dataIndex]: `${value}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue); // Update input value without saving immediately
  };

  const handleSaveOnBlurOrEnter = () => {
    const calculatedValue = calculateValue(textValue); // Calculate final value
    const percentage = calculatePercentageChange(calculatedValue, dataValue);

    setSliderValue(calculatedValue); // Set final slider value
    setPercentageChange(percentage);

    form.setFieldsValue({ [dataIndex]: `${calculatedValue}` });

    handleSave({
      ...record,
      [dataIndex]: `${calculatedValue}`,
      percentageChange: `${percentage.toFixed(2)}%`,
    });

    setIsCellEditable(false); // Mark cell as no longer editable
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
            setSliderValue(dataValue);
            setPercentageChange(0);
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
  if (record && record["percentageChange"] !== undefined) {
    console.log(record);
    // setPercentageChange(record["percentageChange"])
  }
  const formattedCellContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>{sliderValue}</span>
      <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
        {percentageChange > 0 ? (
          <span style={{ color: "green" }}>
            <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : percentageChange < 0 ? (
          <span style={{ color: "red" }}>
            <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
          </span>
        ) : (
          <span>{percentageChange.toFixed(2)}%</span>
        )}
      </span>
      {
        showSlider && 
        <Button
          type="link"
          icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setVisible((prev) => !prev);
          }}
          style={{ marginLeft: 8 }}
        />
      }
      
    </div>
  );

  // const formattedCellContent1 = (
  //   <div style={{ display: "flex", alignItems: "center" }}>
  //     {/* Show the slider value or other cell content */}
  //     <span style={{ marginRight: 8 }}>{sliderValue}</span>

  //     {/* Calculate percentageChange from record, or default to 0 */}
  //     <span style={{ fontSize: "0.7em", marginLeft: 8 }}>
  //       {record && record["percentageChange"] !== undefined ? (
  //         record["percentageChange"] > 0 ? (
  //           <span style={{ color: "green" }}>
  //             <ArrowUpOutlined /> {record["percentageChange"].toFixed(2)}%
  //           </span>
  //         ) : record["percentageChange"] < 0 ? (
  //           <span style={{ color: "red" }}>
  //             <ArrowDownOutlined /> {record["percentageChange"].toFixed(2)}%
  //           </span>
  //         ) : (
  //           <span>{record["percentageChange"].toFixed(2)}%</span>
  //         )
  //       ) : (
  //         <span>0%</span>
  //       )}
  //     </span>

  //     {/* Slider toggle button */}
  //     {showSlider && (
  //       <Button
  //         type="link"
  //         icon={visible ? <ShrinkOutlined /> : <EditOutlined />}
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           setVisible((prev) => !prev);
  //         }}
  //         style={{ marginLeft: 8 }}
  //       />
  //     )}
  //   </div>
  // );

  let childNode = children;

  if (editable) {
    childNode = (
      <td {...restProps}>
        {(isCellEditable) ? (
          <input
            type="text"
            value={textValue}
            onChange={handleInputChange}
            onBlur={handleSaveOnBlurOrEnter} // Save on blur
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveOnBlurOrEnter(); // Save on pressing Enter
            }}
            style={{ width: "100%" }}
          />
        ) : (
          <div onDoubleClick={() => {
              if (!showSlider) {
                setIsCellEditable(true)
              }  
            }}>
            {/*children*/}
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
      </td>
    );
  }

  return <td {...restProps}>{childNode || record[dataIndex]}</td>;
};
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

  const calculatedMaxSliderValue = parseFloat((dataValue + (dataValue * safeMaxValue) / 100).toFixed(2));
  const calculatedMinSliderValue = parseFloat((dataValue - (dataValue * safeMinValue) / 100).toFixed(2));
  
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
      <td {...restProps} style={{padding: "4px"}}>
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
      </td>
    );
  }

  return <td {...restProps}  style={{padding: "4px"}}>{childNode || record[dataIndex]}</td>;
};

//slider is not availble in this

  

type ColumnTypes = Exclude<TableProps["columns"], undefined>;
const WhatIfTable: React.FC = () => {
  const [count, setCount] = useState(13);
  const [isChanged, setIsChanged] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [newColumn, setNewColumn] = useState({});
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

  const onPlusButtonClicked = (dataIndex: string) => {
    setClickedColumnName(dataIndex); // Store the clicked column's dataIndex
    setPopUpVisible(true);
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

  const handleModalSubmit1 = (obj: WhatIfParameterType) => {
    console.log("Object From the Modal", obj); // Checkbox state (true or false)

    const newColumnKey = `Scenario ${columns.length + 1}`;
    const newColumnDataIndex = `Scenario ${obj.name} (${clickedColumnName})`;

    const newColumn = {
      key: newColumnKey,
      title: (
        <div>
          {obj.name} ({clickedColumnName})
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
      minValue: obj.sliderMinimumValue,
      maxValue: obj.sliderMaximumValue,
      stepValue: obj.sliderIncrementByValue,
      copy: obj.copyPreviousData
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);

    setModifiedDataSource((prevDataSource) =>
      prevDataSource.map((row) => ({
        ...row,
        [newColumnDataIndex]: '0', // Default value for the new column
      }))
    );
  };

  const handleModalSubmit = (obj: WhatIfParameterType) => {
    console.log("Popup object", obj);
    setModalObject(obj)
    setClickedColumnName(obj.selectedColumn) 
  };

  useEffect(() => {
    console.log(clickedColumnName, "Clicked Col in useEffect")
    if (clickedColumnName) {
      console.log("Clicked Column Name has been updated:", clickedColumnName);
      const selectedColumn = modalObject.selectedColumn; 
      const newColumnKey = `Scenario ${columns.length + 1}`;
      const newColumnDataIndex = `Scenario ${modalObject.name} (${selectedColumn})`;

      const newColumn = {
        key: newColumnKey,
        title: (
          <div>
            {modalObject.name} ({selectedColumn})
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
      // const newColumn = {
      //   key: newColumnKey,
      //   title: (
      //     <div>
      //       {modalObject.name} ({selectedColumn})
      //       <Button
      //         type="link"
      //         icon={<MinusOutlined />}
      //         onClick={() => onRemoveButtonClicked(newColumnKey)}
      //         style={{ marginLeft: 8 }}
      //       />
      //     </div>
      //   ),
      //   dataIndex: newColumnDataIndex,
      //   width: '20%',
      //   editable: true,  // This ensures that new columns are editable
      //   minValue: modalObject.sliderMinimumValue,
      //   maxValue: modalObject.sliderMaximumValue,
      //   stepValue: modalObject.sliderIncrementByValue,
      //   copy: modalObject.copyPreviousData
      // };


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


  useEffect(() => {
    if (fetchedDataSource.length >= 1) {
      const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
      })[] = Object.keys(fetchedDataSource[0]).map((keyName: string) => ({
        title: (
          <div>
            {keyName}
            {/*<Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => onPlusButtonClicked(keyName)} // Pass the dataIndex (keyName)
              style={{ marginLeft: 8 }}
            />*/}
          </div>
        ),
        dataIndex: keyName,
        width: `${100 / Object.keys(fetchedDataSource[0]).length}%`,
        editable: false,
      }));

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
console.log(mappedColumns)
  // const mappedColumns = columns.map((col) => ({
  //   ...col,
  //   onCell: (record: any) => ({
  //     record,
  //     editable: col.editable,  // Only true for new columns
  //     dataIndex: col.dataIndex,
  //     title: col.title,
  //     handleSave: (updatedRecord: any) => {
  //       const newModifiedDataSource = modifiedDataSource.map((item) =>
  //         item["ID"] === updatedRecord["ID"] ? updatedRecord : item
  //       );
  //       setModifiedDataSource(newModifiedDataSource);
  //     },
  //     minValue: col.minValue, 
  //     maxValue: col.maxValue,
  //     stepValue: col.stepValue,
  //     copy: col.copy
  //   }),
  // }));
console.log("modifiedDataSource", modifiedDataSource)

  return (
    <div>
      <Button 
      className="myClass"
        type="primary"
        onClick={() => setPopUpVisible(true)}
        >
        What-If
      </Button>
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



interface DataType {
  key: React.Key;
  id: string;
  CompanyName: string;
  year2022: string;
  year2023: string;
  year2024: string;
  previousValue: any;
  percentageChange?: string;
}
export default WhatIfTable;












/**
 * Plus Icon code
 * /

/* eslint-disable max-lines-per-function */
// import { useContext, useEffect, useRef, useState, createContext } from "react";
// import * as React from "react";
// import "./whatIfTable.css";
// import type { InputRef, TableProps } from "antd";
// import { Button, Form, Input, Popover, Slider, Table } from "antd";
// import { LineOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
// import {PopupModal, WhatIfParameterType} from "./PopUpWindow"

// // Context for editable cells
// const EditableContext = createContext<any | null>(null);
// interface Item {
//   key: string;
//   companyName: string;
//   year2022: string;
//   year2023: string;
//   year2024: string;
//   percentageChange?: string;
//   minValue: any;
//   maxValue: any;
//   stepValue: any;
//   copy: any;
// }
// interface EditableRowProps {
//   index: number;
// }
// const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
//   const [form] = Form.useForm();
//   return (
//     <Form form={form} component={false}>
//       <EditableContext.Provider value={form}>
//         <tr {...props} />
//       </EditableContext.Provider>
//     </Form>
//   );
// };
 
// interface EditableCellProps {
//   title: React.ReactNode;
//   editable: boolean;
//   dataIndex: keyof Item;
//   record: Item;
//   minValue: number;
//   maxValue: number;
//   stepValue: number;
//   copy: boolean;
//   handleSave: (record: Item) => void;
// }
// const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
//   title,
//   editable,
//   children,
//   dataIndex,
//   record,
//   minValue,
//   maxValue,
//   stepValue,
//   copy,
//   handleSave,
//   ...restProps
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));
//   const [percentageChange, setPercentageChange] = useState<number>(0);
//   const [visible, setVisible] = useState(false);

//   const inputRef = useRef<InputRef>(null);
//   const form = useContext(EditableContext)!;

//   // Initialize slider value when entering edit mode or when props change
//   useEffect(() => {
//     if (editing) {
//       setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
//     }
//   }, [editing, record, dataIndex]);

//   // Handle "copy" logic: if `copy` is true, sync the value when the column is copied
//   useEffect(() => {
//     if (copy && record[dataIndex]) {
//       setSliderValue(parseFloat(String(record[dataIndex] || "0")));
//     }
//   }, [copy, dataIndex, record]);

//   const toggleEdit = () => {
//     setEditing(!editing);
//     setVisible((prevVisible) => !prevVisible);
//     form.setFieldsValue({ [dataIndex]: record[dataIndex] || "0" });
//   };

//   const save = async () => {
//     try {
//       const values = await form.validateFields();
//       toggleEdit();
//       handleSave({ ...record, ...values });
//     } catch (errInfo) {
//       console.log("Save failed:", errInfo);
//     }
//   };

//   // Handle slider value and percentage change calculations
//   const handleSliderChange = (value: number) => {
//     const extractedPropertyName = dataIndex.split('(')[1].replace(')', '');
//     const prevValue = parseFloat(String(record?.[extractedPropertyName] || "0"));
//     const percentage = ((value - prevValue) / prevValue) * 100;

//     setSliderValue(value);
//     setPercentageChange(percentage);

//     const newValue = `${value}`;
//     form.setFieldsValue({ [dataIndex]: newValue });
//     handleSave({
//       ...record,
//       [dataIndex]: newValue,
//       percentageChange: `${percentage.toFixed(2)}%`,
//       minValue,
//       maxValue,
//       stepValue,
//       copy,
//     });
//   };

//   const popoverContent = (
//     <div>
//       <div style={{ width: 150, position: "relative" }}>
//         <Slider
//           min={minValue}
//           max={maxValue}
//           step={stepValue}
//           value={sliderValue}
//           onChange={handleSliderChange}
//           style={{ width: "100%" }}
//         />
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginTop: "4px",
//             fontSize: "12px",
//             width: "100%",
//             color: "#999",
//           }}
//         >
//           <span>{minValue}</span>
//           <span>{maxValue}</span>
//         </div>
//       </div>
//       <Input
//         ref={inputRef}
//         style={{ width: 100, marginTop: 8 }}
//         onPressEnter={save}
//         onBlur={save}
//         type="number"
//         value={sliderValue}
//         onChange={(e) => {
//           const value = parseFloat(e.target.value) || 0;
//           setSliderValue(value);
//           handleSliderChange(value);
//         }}
//       />
//     </div>
//   );

//   // Ensure proper Popover visibility control
//   const handleVisibleChange = (newVisible: boolean) => {
//     setVisible(newVisible);
//     if (!newVisible) {
//       setEditing(false); // Exit edit mode when Popover is closed
//     }
//   };

//   let childNode = children;

//   // Formatting cell content with value and percentage change
//   const formattedCellContent = (
//     <div>
//       <span>{sliderValue}</span>
//       <span style={{ fontSize: "0.8em", marginLeft: 8 }}>
//         {percentageChange > 0 ? (
//           <span style={{ color: "green" }}>
//             <ArrowUpOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : percentageChange < 0 ? (
//           <span style={{ color: "red" }}>
//             <ArrowDownOutlined /> {percentageChange.toFixed(2)}%
//           </span>
//         ) : (
//           <span>{percentageChange.toFixed(2)}%</span>
//         )}
//       </span>
//     </div>
//   );

//   if (editable) {
//     childNode = editing ? (
//       <Popover
//         content={popoverContent}
//         title=""
//         trigger="click"
//         visible={visible}
//         onVisibleChange={handleVisibleChange}
//       >
//         <div>
//           <span onClick={() => setEditing(true)}>{formattedCellContent}</span>
//         </div>
//       </Popover>
//     ) : (
//       <div
//         className="editable-cell-value-wrap"
//         style={{ paddingInlineEnd: 24 }}
//         onClick={toggleEdit}
//       >
//         {formattedCellContent}
//       </div>
//     );
//   }

//   return <td {...restProps}>{childNode || record[dataIndex]}</td>;
// };
 
 
// interface DataType {
//   key: React.Key;
//   id: string;
//   CompanyName: string;
//   year2022: string;
//   year2023: string;
//   year2024: string;
//   previousValue: any;
//   percentageChange?: string;
// }
// type ColumnTypes = Exclude<TableProps["columns"], undefined>;
// const WhatIfTable: React.FC = () => {
//   const [count, setCount] = useState(13);
//   const [isChanged, setIsChanged] = useState(false);
//   const [columns, setColumns] = useState<any[]>([]);
//   const [newColumn, setNewColumn] = useState({});
//   const [isPopUpVisible, setPopUpVisible] = useState(false);

//   const [fetchedDataSource, setFetchedDataSource] = useState<any[]>([]);
//   const [modifiedDataSource, setModifiedDataSource] = useState<any[]>([]);

//   // State to hold the column name where the plus button was clicked
//   const [clickedColumnName, setClickedColumnName] = useState<string>("");

//   // Fetch data from API
//   useEffect(() => {
//     fetch("http://localhost:8000/revenue")
//       .then((response) => response.json())
//       .then((data) => {
//         setFetchedDataSource(data);
//         setModifiedDataSource(data);
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }, []);

//   const onPlusButtonClicked = (dataIndex: string) => {
//     setClickedColumnName(dataIndex); // Store the clicked column's dataIndex
//     setPopUpVisible(true);
//   };


//   const onRemoveButtonClicked = (key: string) => {
//     setColumns((prevColumns) => {
//       const filteredColumns = prevColumns.filter((col) => col.key !== key);
//       return filteredColumns;
//     });

//     setModifiedDataSource((prevDataSource) =>
//       prevDataSource.map((row) => {
//         const { [key]: _, ...rest } = row;
//         return rest;
//       })
//     );
//   };

//   const handleModalSubmit1 = (obj: WhatIfParameterType) => {
//     console.log("Checkbox value:", obj.copyPreviousData); // Checkbox state (true or false)

//     const newColumnKey = `Scenario ${columns.length + 1}`;
//     const newColumnDataIndex = `Scenario ${obj.name} (${clickedColumnName})`;

//     const newColumn = {
//       key: newColumnKey,
//       title: (
//         <div>
//           {obj.name} ({clickedColumnName})
//           <Button
//             type="link"
//             icon={<MinusOutlined />}
//             onClick={() => onRemoveButtonClicked(newColumnKey)}
//             style={{ marginLeft: 8 }}
//           />
//         </div>
//       ),
//       dataIndex: newColumnDataIndex,
//       width: '20%',
//       editable: true,
//       minValue: obj.sliderMinimumValue,
//       maxValue: obj.sliderMaximumValue,
//       stepValue: obj.sliderIncrementByValue,
//       copy: obj.copyPreviousData
//     };

//     setColumns((prevColumns) => [...prevColumns, newColumn]);

//     setModifiedDataSource((prevDataSource) =>
//       prevDataSource.map((row) => ({
//         ...row,
//         [newColumnDataIndex]: '0', // Default value for the new column
//       }))
//     );
//   };

// const handleModalSubmit = (obj: WhatIfParameterType) => {
//   const newColumnKey = `Scenario ${columns.length + 1}`;
//   const newColumnDataIndex = `Scenario ${obj.name} (${clickedColumnName})`;

//   const newColumn = {
//     key: newColumnKey,
//     title: (
//       <div>
//         {obj.name} ({clickedColumnName})
//         <Button
//           type="link"
//           icon={<MinusOutlined />}
//           onClick={() => onRemoveButtonClicked(newColumnKey)}
//           style={{ marginLeft: 8 }}
//         />
//       </div>
//     ),
//     dataIndex: newColumnDataIndex,
//     width: '20%',
//     editable: true,
//     minValue: obj.sliderMinimumValue,
//     maxValue: obj.sliderMaximumValue,
//     stepValue: obj.sliderIncrementByValue,
//     copy: obj.copyPreviousData
//   };

//   setColumns((prevColumns) => [...prevColumns, newColumn]);

//   // Update modifiedDataSource based on whether the checkbox is checked
//   setModifiedDataSource((prevDataSource) =>
//     prevDataSource.map((row) => {
//       const newValue = obj.copyPreviousData ? row[clickedColumnName] : '0';
//       return {
//         ...row,
//         [newColumnDataIndex]: newValue, // Copy value from the clicked column if checkbox is true
//       };
//     })
//   );
// };


//   useEffect(() => {
//     if (fetchedDataSource.length >= 1) {
//       const defaultColumns: (ColumnTypes[number] & {
//         editable?: boolean;
//         dataIndex: string;
//       })[] = Object.keys(fetchedDataSource[0]).map((keyName: string) => ({
//         title: (
//           <div>
//             {keyName}
//             <Button
//               type="link"
//               icon={<PlusOutlined />}
//               onClick={() => onPlusButtonClicked(keyName)} // Pass the dataIndex (keyName)
//               style={{ marginLeft: 8 }}
//             />
//           </div>
//         ),
//         dataIndex: keyName,
//         width: `${100 / Object.keys(fetchedDataSource[0]).length}%`,
//         editable: false,
//       }));

//       setColumns(defaultColumns);
//     } else {
//       setColumns([]);
//     }
//   }, [fetchedDataSource]);

//   const components = {
//     body: {
//       row: EditableRow,
//       cell: EditableCell,
//     },
//   };
// const mappedColumns = columns.map((col) => ({
//   ...col,
//   onCell: (record: any) => ({
//     record,
//     editable: col.editable,
//     dataIndex: col.dataIndex,
//     title: col.title,
//     handleSave: (updatedRecord: any) => {
//       console.log("In mapped columns", updatedRecord, record, col);
//       const newModifiedDataSource = modifiedDataSource.map((item) =>
//         item["ID"] === updatedRecord["ID"] ? updatedRecord : item
//       );
//       setModifiedDataSource(newModifiedDataSource);
//     },
//     minValue: col.minValue, // Make sure minValue is passed here
//     maxValue: col.maxValue,
//     stepValue: col.stepValue,
//     copy: col.copy
//   }),
// }));

//   return (
//     <div>
//       <Table
//         components={components}
//         rowClassName={() => "editable-row"}
//         bordered
//         className="custom-table"
//         dataSource={modifiedDataSource}
//         columns={mappedColumns as ColumnTypes}
//       />
//       <PopupModal
//         visible={isPopUpVisible}
//         onClose={() => setPopUpVisible(false)}
//         onSubmit={handleModalSubmit}
//       />
//     </div>
//   );
// };



// export default WhatIfTable;