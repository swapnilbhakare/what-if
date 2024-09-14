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
  const [editing, setEditing] = useState(false);
  const [sliderValue, setSliderValue] = useState(
    parseFloat(String(record?.[dataIndex] || "0")) || 0
  );

  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      setSliderValue(parseFloat(String(record?.[dataIndex] || "0")) || 0);
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
        max={10000000000}
        step={1}
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

  return <td {...restProps}>{childNode || record[dataIndex]}</td>;
};

interface DataType {
  key: React.Key;
  companyName: string;
  year2022: string;
  year2023: string;
  year2024: string;
  percentageChange?: string;
}

type ColumnTypes = Exclude<TableProps["columns"], undefined>;

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

    const change = ((value2024 - value2023) / value2023) * 100;
    return `${change.toFixed(2)}%`;
  };

  const [dataSource, setDataSource] = useState<DataType[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then((response) => response.json())
      .then((data) => {
        // Console log the data
        setDataSource(data);
        console.log(data);
      }) // Parse the JSON from the response

      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  console.log(dataSource);

  const handleSave = (row: DataType) => {
    setIsChanged(true); // Mark as changed

    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    const updatedItem = {
      ...item,
      ...row,
      percentageChange: calculatePercentageChange(row.year2023, row.year2024),
    };
    newData.splice(index, 1, updatedItem);
    setDataSource(newData);
  };

  const handleAdd = () => {
    const newData: DataType = {
      key: count.toString(),
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
