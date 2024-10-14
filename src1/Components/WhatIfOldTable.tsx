/* eslint-disable max-lines-per-function */
import { useContext, useEffect, useRef, useState, createContext } from "react";
import * as React from "react";
import "./whatIfTable.css";
import type { InputRef, TableProps } from "antd";
import { Button, Form, Input, Popover, Slider, Table } from "antd";
import { LineOutlined } from "@ant-design/icons";

// import { useContext, useEffect, useRef, useState, createContext } from "react";
// import * as React from "react";
// import { InputRef, TableProps } from "antd";
// import { Button, Form, Input, Popover, Slider, Table } from "antd";
// import { LineOutlined } from "@ant-design/icons";

// Context for editable cells
const EditableContext = createContext<any | null>(null);

interface Item {
  key: string;
  companyName: string;
  year2022: string;
  year2023: string;
  year2024: string;
  percentageChange?: string;
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
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => { 
  //dataIndex is the key of the cell, key means year for which selected
  // console.log(record?.[dataIndex]) //value of the cell
  const [editing, setEditing] = useState(false);
  const [sliderValue, setSliderValue] = useState(parseFloat(String(record?.[dataIndex] || "0")));

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      setSliderValue(parseFloat(String(record?.[dataIndex] || "0")));
    }
  }, [editing, record, dataIndex]);

  const toggleEdit = () => {
    if (record && dataIndex in record) {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] || "0" });
    } else {
      console.error(`Error: record is ${record}, dataIndex is ${dataIndex}`);
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      console.log("Saved Value",values)
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const newValue = `${value}`;
    form.setFieldsValue({ [dataIndex]: newValue });
    handleSave({ ...record, [dataIndex]: newValue });
  };

  const popoverContent = (
    <div>
      <Slider
        min={0}
        max={10000000}
        step={50}
        value={sliderValue}
        onChange={handleSliderChange}
        style={{ width: 150 }}
      />
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
        }}
      />
    </div>
  );

  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Popover
        content={popoverContent}
        title={title}
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        <div>
          <span onClick={() => setEditing(true)}>{children}</span>
        </div>
      </Popover>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td >{childNode || record[dataIndex]}</td>;
};

interface DataType {
  key: React.Key;
  id: string;
  companyName: string;
  year2022: string;
  year2023: string;
  year2024: string;
  percentageChange?: string;
}

type ColumnTypes = Exclude<TableProps["columns"], undefined>;






//Main Code
const WhatIfTable: React.FC = () => {
  const [count, setCount] = useState(13);
  const [isChanged, setIsChanged] = useState(false);
  const calculatePercentageChange = (
    year2023: string | number,
    year2024: string | number
  ) => {
    const value2023 =
      typeof year2023 === "string" ? parseFloat(year2023) : year2023;
    const value2024 =
      typeof year2024 === "string" ? parseFloat(year2024) : year2024;
       

    // Handle invalid or zero values
    if (isNaN(value2023) || isNaN(value2024) || value2023 === 0) {
      return "0%";
    }

    const change = (((value2024 - value2023) / value2023) * 100)
    return `${change.toFixed(2)}%`;
  };

  //this is only getting the data from the remote
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then((response) => {
        console.log(response)
        return response.json()
      })
      .then((data) => {
        // Console log the data
        console.log(data)
        setDataSource(data);
        // console.log(data);
      }) // Parse the JSON from the response
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleSave = (row: DataType) => {
    setIsChanged(true); // Mark as changed
    const newData = [...dataSource];
    const index = newData.findIndex((item: DataType) => {
      return row["ID"] === item["ID"]
    });
    const item = newData[index];
    console.log(item.id, item, row.id, row, index)
    const updatedItem = {
      ...item,
      previousValue: item["Revenue2024"],
      // newValue: row["Revenue2024"],
      ...row,
      // newValue: row[""],
      percentageChange: calculatePercentageChange(item["previousValue"] ? item["previousValue"] : item["Revenue2024"], row["Revenue2024"]),
    };
    console.log(updatedItem)
    newData.splice(index, 1, updatedItem);
    setDataSource(newData);
  };


  const handleAdd = () => {
    const newData: DataType = {
      key: count.toString(),
      id: count.toString(),
      companyName: `Company ${count}`,
      year2022: "0",
      year2023: "0",
      year2024: "0",
      percentageChange: "0%", // Default value
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
    setIsChanged(false); // Reset change tracking when adding new data
  };

  // Conditionally include the percentageChange column based on isChanged state
  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: "Company Name",
      dataIndex: "CompanyName",
      width: "30%",
      editable: false, // Company Name is not editable
    },
    {
      title: "Year 2022",
      dataIndex: "Revenue2022",
      width: "25%",
      editable: false,
    },
    {
      title: "Year 2023",
      dataIndex: "Revenue2023",
      width: "25%",
      editable: true,
    },
    ...(isChanged
      ? [
          {
            title: <LineOutlined />,
            dataIndex: "percentageChange",
            width: "1%",
            editable: false,
          },
        ]
      : []),
    {
      title: "Year 2024",
      dataIndex: "Revenue2024",
      width: "20%",
      editable: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        className="custom-table"
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      />
    </div>
  );
};

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
// const EditableCellShowing: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
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
// const WhatIfTableNormal: React.FC = () => {
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