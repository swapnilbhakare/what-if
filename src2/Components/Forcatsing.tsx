
import { useEffect, useState } from "react";
import "./whatIfTable.css";
import * as React from "react";
import { Button, Form, Modal, Table, DatePicker, Input, Radio, Select } from "antd";
import { SiCodeforces } from "react-icons/si";
import { Dayjs } from 'dayjs';
import { ForecastParameterType, PopupModalForecast } from './PopUpWindow'
const { RangePicker } = DatePicker;
interface RevenueData {
  ID: any;
  key: string;
  CompanyName: string;
  Revenue2022: string;
  Revenue2023: string;
  Revenue2024: string;
  forecasts?: Array<{ key: string; forecastValue: number }>;
}
const Forcasting: React.FC = () => {
  const [dataSource, setDataSource] = useState<RevenueData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [forecastTitle, setForecastTitle] = useState<string>("");
  const [forecastRange, setForecastRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [forecastType, setForecastType] = useState<string>("blank");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [addedColumns, setAddedColumns] = useState<any[]>([]);
  
  const forecastMultipleYears = (year2023: string, year2024: string, years: number): number[] => {
    const forecasts: number[] = [];
    const value2023 = parseFloat(year2023);
    const value2024 = parseFloat(year2024);
    if (isNaN(value2023) || isNaN(value2024) || value2023 === 0) {
      return Array(years).fill(0);
    }
    const growthRate = (value2024 - value2023) / value2023;
    forecasts.push(parseFloat((value2024 * (1 + growthRate)).toFixed(2)));
    for (let i = 1; i < years; i++) {
      const nextForecast = parseFloat((forecasts[i - 1] * (1 + growthRate)).toFixed(2));
      forecasts.push(nextForecast);
    }
    return forecasts;
  };
  useEffect(() => {
    fetch("http://localhost:8000/revenue")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: RevenueData[]) => {
        setRevenueData(data);
        setDataSource(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);
  const handleModalOk = () => {
    const years = forecastRange ? forecastRange[1].year() - forecastRange[0].year() + 1 : 0;
    const modifyData = revenueData.map((item) => {
      let forecasts;
      if (forecastType === "actual") {
        forecasts = forecastMultipleYears(item.Revenue2023, item.Revenue2024, years);
      } else if (forecastType === "existing") {
        forecasts = item.forecasts ? item.forecasts.map(f => f.forecastValue) : Array(years).fill(0);
      } else {
        forecasts = Array(years).fill(9);
      }
      console.log("return", {
        ...item,
        [`Forcast_${selectedColumn}`]: item[selectedColumn],
        forecasts: forecasts.map((value, i) => ({
          key: `${item[selectedColumn]}-${i}`,
          forecastValue: value,

        })),
      })
      return {
        ...item,
        [`Forcast_${selectedColumn}`]: item[selectedColumn],
        forecasts: forecasts.map((value, i) => ({
          key: `${item[selectedColumn]}-${i}`,
          forecastValue: value,

        })),
      };
    });
    console.log(modifyData, "modifydata")

    if (forecastType === "existing") {  setDataSource(pre => {

    const a =pre.map((d) =>{
      d[`Forcast_${selectedColumn}`]=d[selectedColumn]      
    }) 
    return pre}
    // [ ...pre,   [`Forcast_${selectedColumn}`]: item[selectedColumn],  ]
    );}
    else{
      setDataSource(modifyData);
    }


    if (selectedColumn) {
      setAddedColumns(prev => [...prev, `Forcast_${selectedColumn}`]);
    }
    setIsModalVisible(false);
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  const handleForecastChange = (value: number, recordKey: string, index: number) => {
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.key === recordKey) {
          const newForecasts = item.forecasts?.map((forecast, i) => {
            if (i === index) {
              return { ...forecast, forecastValue: value };
            }
            return forecast;
          });
          return { ...item, forecasts: newForecasts };
        }
        return item;
      })
    );
  };
  const handleDynamicColumnChange = (value: string, recordKey: string) => {
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.key === recordKey) {
          return { ...item, [`Forcast_${selectedColumn}`]: value };
        }
        return item;
      })
    );
  };
  const handleExistingColumnChange = (value: string, recordKey: string, column: string) => {
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.key === recordKey) {
          return { ...item, [column]: value };
        }
        return item;
      })
    );
  };
  const defaultColumns = [
    {
      title: "Company Name",
      dataIndex: "CompanyName",
      render: (text: any, record: RevenueData) => (
        <Input
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'CompanyName')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "30%",
    },
    {
      title: "Revenue2022",
      dataIndex: "Revenue2022",
      render: (text: any, record: RevenueData) => (
        <Input
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2022')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
    {
      title: "Revenue2023",
      dataIndex: "Revenue2023",
      render: (text: any, record: RevenueData) => (
        <Input
          value={text}
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2023')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
    {
      title: "Revenue2024",
      dataIndex: "Revenue2024",
      render: (text: any, record: RevenueData) => (
        <Input
          value={text}

          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2024')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
  ];
  const dynamicColumns = addedColumns.map(column => ({
    title: column,
    dataIndex: column,
    render: (text: any, record: RevenueData) => (
      <Input
        value={record[column] || ''}
        onChange={(e) => handleDynamicColumnChange(e.target.value, record.key = record.ID)}
        style={{ width: '100%', border: 'none', padding: '0px', color: 'red' }}
      />
    ),
    width: "25%",
  }));
  const forecastColumns = forecastRange ?
    Array.from({ length: forecastRange[1].year() - forecastRange[0].year() + 1 }, (_, index) => ({
      title: `${forecastTitle} ${forecastRange[0].year() + index}`,
      dataIndex: `forecast${index}`,
      width: "25%",
      render: (text: any, record: RevenueData) => {
        record.key = record.ID
        const forecastValue = record.forecasts?.[index]?.forecastValue ?? "";
        return forecastType === "blank" ? (
          <Input
            id={`forecast-${record.key}-${index}`} // Unique ID for each input
            value={forecastValue}
            onChange={(e) => {
              const newForecastValue = e.target.value ? parseFloat(e.target.value) : 0;
              handleForecastChange(newForecastValue, record.key, index);
            }}
            style={{ width: '100px', border: 'none', padding: '0px' }}
          />
        ) : (
          <span>{forecastValue}</span>
        );
      },
    })) : [];
  const columns = [...defaultColumns, ...dynamicColumns, ...forecastColumns];
  const options = defaultColumns.map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));
  return (
    <div>
      <Button 
        type="primary" 
        onClick={() => setIsModalVisible(true)} 
        className='forecast'>
        Forecast Data <SiCodeforces />
      </Button>
      {
        isModalVisible ? 
          <PopupModalForecast
            availableColumns={}
            onClose={}
            onSubmit={} />
      }
      <Modal
        title="Select Forecast Options"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form layout="vertical">
          {forecastType === "existing" ? (
            <div>
              <label>Select Existing Columns</label>
              <Select
                value={selectedColumn}
                onChange={(value) => setSelectedColumn(value)}
                style={{ width: "100%" }}
                options={options}
              />
            </div>
          ) : (
            <>
              <Form.Item label="Forecast Title" required>
                <Input
                  value={forecastTitle}
                  onChange={(e) => setForecastTitle(e.target.value)}
                  placeholder="Enter forecast title"
                />
              </Form.Item>
              <Form.Item label="Select Date Range" required>
                <RangePicker
                  value={forecastRange}
                  onChange={setForecastRange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </>
          )}
          <Form.Item label="Forecast Type" required>
            <Radio.Group value={forecastType} onChange={(e) => setForecastType(e.target.value)}>
              <Radio value="blank">Blank Forecast</Radio>
              <Radio value="actual">Future Forecast</Radio>
              <Radio value="existing">Existing Forecast</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        bordered
        className="custom-table"
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};
export default Forcasting;
