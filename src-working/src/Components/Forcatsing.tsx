
// import { useEffect, useState } from "react";
// import "../../src/style.css"
// import * as React from "react";
// import { Button, Form, Modal, Table, DatePicker, Input, Radio, Select } from "antd";
// import { SiCodeforces } from "react-icons/si";
// import { Dayjs } from 'dayjs';
// const { RangePicker } = DatePicker;
// interface RevenueData {
//   ID: any;
//   key: string;
//   CompanyName: string;
//   Revenue2022: string;
//   Revenue2023: string;
//   Revenue2024: string;
//   forecasts?: Array<{ key: string; forecastValue: number }>;
// }
// const Forcasting: React.FC = () => {
//   const [dataSource, setDataSource] = useState<RevenueData[]>([]);
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [forecastTitle, setForecastTitle] = useState<string>("");
//   const [forecastRange, setForecastRange] = useState<[Dayjs, Dayjs] | null>(null);
//   const [forecastType, setForecastType] = useState<string>("blank");
//   const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
//   const [selectedColumn, setSelectedColumn] = useState<string>("");
//   const [addedColumns, setAddedColumns] = useState<any[]>([]);
//   const forecastMultipleYears = (year2023: string, year2024: string, years: number): number[] => {
//     const forecasts: number[] = [];
//     const value2023 = parseFloat(year2023);
//     const value2024 = parseFloat(year2024);
//     if (isNaN(value2023) || isNaN(value2024) || value2023 === 0) {
//       return Array(years).fill(0);
//     }
//     const growthRate = (value2024 - value2023) / value2023;
//     forecasts.push(parseFloat((value2024 * (1 + growthRate)).toFixed(2)));
//     for (let i = 1; i < years; i++) {
//       const nextForecast = parseFloat((forecasts[i - 1] * (1 + growthRate)).toFixed(2));
//       forecasts.push(nextForecast);
//     }
//     return forecasts;
//   };
//   useEffect(() => {
//     fetch("http://localhost:8000/revenue")
//       .then(response => {
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return response.json();
//       })
//       .then((data: RevenueData[]) => {
//         setRevenueData(data);
//         setDataSource(data);
//       })
//       .catch(error => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);
//   const handleModalOk = () => {
//     const years = forecastRange ? forecastRange[1].year() - forecastRange[0].year() + 1 : 0;
//     const modifyData = revenueData.map((item) => {
//       let forecasts;
//       if (forecastType === "future") {
//         forecasts = forecastMultipleYears(item.Revenue2023, item.Revenue2024, years);
//       } else if (forecastType === "existing") {
//         forecasts = item.forecasts ? item.forecasts.map(f => f.forecastValue) : Array(years).fill(0);
//       } else {
//         forecasts = Array(years).fill(0);
//       }
//       return {
//         ...item,
//         [`Forcast_${selectedColumn}`]: item[selectedColumn],
//         forecasts: forecasts.map((value, i) => ({
//           key: `${item[selectedColumn]}-${i}`,
//           forecastValue: value,
//         })),
//       };
//     });
//     console.log(modifyData, "modifydata")
//     if (forecastType === "existing") {
//       setDataSource(pre => {
//         const a = pre.map((d) => {
//           d[`Forcast_${selectedColumn}`] = d[selectedColumn]
//         })
//         return pre
//       }

//       );
//     }
//     else {
//       console.log("modifyData",modifyData)
//       setDataSource(modifyData);
//     }
//     if (selectedColumn) {
//       setAddedColumns(prev => [...prev, `Forcast_${selectedColumn}`]);
//     }
//     setIsModalVisible(false);
//     // zzzzresetForm()
//   };
//   const handleModalCancel = () => {
//     // resetForm();
//     setIsModalVisible(false);
//   };
//   const handleForecastChange = (value: number, recordKey: string, index: number) => {
//     setDataSource(prevData =>
//       prevData.map(item => {
//         if (item.key === recordKey) {
//           const newForecasts = item.forecasts?.map((forecast, i) => {
//             if (i === index) {
//               return { ...forecast, forecastValue: value };
//             }
//             return forecast;
//           });
//           return { ...item, forecasts: newForecasts };
//         }
//         return item;
//       })
//     );
//   };
//   const handleDynamicColumnChange = (value: string, recordKey: string) => {
//     setDataSource(prevData =>
//       prevData.map(item => {
//         if (item.key === recordKey) {
//           return { ...item, [`Forcast_${selectedColumn}`]: value };
//         }
//         return item;
//       })
//     );
//   };
//   const handleExistingColumnChange = (value: string, recordKey: string, column: string) => {
//     setDataSource(prevData =>
//       prevData.map(item => {
//         if (item.key === recordKey) {
//           return { ...item, [column]: value };
//         }
//         return item;
//       })
//     );
//   };
//   const defaultColumns = [
//     {
//       title: "Company Name",
//       dataIndex: "CompanyName",
//       render: (text: any, record: RevenueData) => (
//         <Input
//           value={text}
//           onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'CompanyName')}
//           style={{ width: '100%', border: 'none', padding: '0px' }}
//         />
//       ),
//       width: "30%",
//     },
//     {
//       title: "Revenue2022",
//       dataIndex: "Revenue2022",
//       render: (text: any, record: RevenueData) => (
//         <Input
//           value={text}
//           onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2022')}
//           style={{ width: '100%', border: 'none', padding: '0px' }}
//         />
//       ),
//       width: "25%",
//     },
//     {
//       title: "Revenue2023",
//       dataIndex: "Revenue2023",
//       render: (text: any, record: RevenueData) => (
//         <Input
//           value={text}
//           onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2023')}
//           style={{ width: '100%', border: 'none', padding: '0px' }}
//         />
//       ),
//       width: "25%",
//     },
//     {
//       title: "Revenue2024",
//       dataIndex: "Revenue2024",
//       render: (text: any, record: RevenueData) => (
//         <Input
//           value={text}

//           onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2024')}
//           style={{ width: '100%', border: 'none', padding: '0px' }}
//         />
//       ),
//       width: "25%",
//     },
//   ];
//   const dynamicColumns = addedColumns.map(column => ({
//     title: column,
//     dataIndex: column,
//     render: (text: any, record: RevenueData) => (
//       <Input
//         value={record[column] || ''}
//         onChange={(e) => handleDynamicColumnChange(e.target.value, record.key = record.ID)}
//         style={{ width: '100%', border: 'none', padding: '0px', color: 'red' }}
//       />
//     ),
//     width: "25%",
//   }));
//   const forecastColumns = forecastRange ?
//     Array.from({ length: forecastRange[1].year() - forecastRange[0].year() + 1 }, (_, index) => ({
//       title: `${forecastTitle} ${forecastRange[0].year() + index}`,
//       dataIndex: `forecast${index}`,
//       width: "25%",
//       render: (text: any, record: RevenueData) => {
//         record.key = record.ID
//         const forecastValue = record.forecasts?.[index]?.forecastValue ?? "";
//         return forecastType === "blank" ? (
//           <Input
//             id={`forecast-${record.key}-${index}`} // Unique ID for each input
//             value={forecastValue}
//             onChange={(e) => {
//               const newForecastValue = e.target.value ? parseFloat(e.target.value) : 0;
//               handleForecastChange(newForecastValue, record.key, index);
//             }}
//             style={{ width: '100px', border: 'none', padding: '0px' }}
//           />
//         ) : (
//           <span>{forecastValue}</span>
//         );
//       },
//     })) : [];
//   const columns = [...defaultColumns, ...dynamicColumns, ...forecastColumns];
//   const options = defaultColumns.map((d: any) => ({
//     label: d.dataIndex,
//     value: d.dataIndex,
//   }));
//   const resetForm = () => {
//     // debugger
//     setForecastTitle('');
//     setForecastRange(null);
//     //  debugger
//   }
//   return (
//     <div>
//       <Button type="primary" onClick={() => setIsModalVisible(true)} style={{backgroundColor:'#006064', color:'white'}}  className='forecast'>
//         Forecast
//       </Button>
//       <Modal
//         title="Select Forecast Options"
//         visible={isModalVisible}
//         onOk={handleModalOk}
//         onCancel={handleModalCancel}
//       >
//         <Form layout="vertical">
//           {forecastType === "existing" ? (
//             <div>
//               <label>Select Existing Columns</label>
//               <Select
//                 value={selectedColumn}
//                 onChange={(value) => setSelectedColumn(value)}
//                 style={{ width: "100%" }}
//                 options={options}
//               />
//             </div>
//           ) : (
//             <>
//               <Form.Item label="Forecast Title" required>
//                 <Input
//                   value={forecastTitle}
//                   onChange={(e) => setForecastTitle(e.target.value)}
//                   placeholder="Enter forecast title"
//                 />
//               </Form.Item>
//               <Form.Item label="Select Date Range" required>
//                 <RangePicker
//                   value={forecastRange}
//                   onChange={setForecastRange}
//                   format="YYYY-MM-DD"
//                 />
//               </Form.Item>
//             </>
//           )}
//           <Form.Item label="Forecast Type" required>
//             <Radio.Group value={forecastType} onChange={(e) => setForecastType(e.target.value)}>
//               <Radio value="blank">Blank Forecast</Radio>
//               <Radio value="future">Future Forecast</Radio>
//               <Radio value="existing">Existing Forecast</Radio>
//             </Radio.Group>
//           </Form.Item>
//         </Form>
//       </Modal>
//       <Table
//         bordered
//         className="custom-table-forcast"
//         dataSource={dataSource}
//         columns={columns}
        
//       />
//     </div>
//   );
// };
// export default Forcasting;




import { useEffect, useState } from "react";
import "../../src/forcast.css"
import * as React from "react";
import { Button, Form, Modal, Table, DatePicker, Input, Radio, Select } from "antd";
import { SiCodeforces } from "react-icons/si";
import { Dayjs } from 'dayjs';
import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
import { Parser } from 'json2csv';


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
      if (forecastType === "future") {
        forecasts = forecastMultipleYears(item.Revenue2023, item.Revenue2024, years);
      } else if (forecastType === "existing") {
        forecasts = item.forecasts ? item.forecasts.map(f => f.forecastValue) : Array(years).fill(0);
      } else {
        forecasts = Array(years).fill(0);
      }
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

    setIsModalVisible(false);
    if (forecastType == "existing" || forecastType == "existing" ) {
      console.log("Hi in IF")
      setDataSource(pre => {
        const a = pre.map((d) => {
          d[`Forcast_${selectedColumn}`] = d[selectedColumn]
        })
        return pre
      })
      console.log("Data change completed")
       if (selectedColumn) {
        setAddedColumns(prev => [...prev, `Forcast_${selectedColumn}`]); 
      }
    } else {
      console.log("else")
      setAddedColumns([])
      setColumns([])
      setDataSource(modifyData)
    }
    //setAddedColumns([])
    console.log("performChanges calling")
    performChanges()
    console.log("performChanges calling completed")
    // zzzzresetForm()
  };

  const handleModalCancel = () => {
    // resetForm();
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
    console.log(value, recordKey)
    setDataSource(prevData =>
      prevData.map(item => {
        if (item.ID == recordKey) {
          console.log(item)
          return { ...item, [`Forcast_${selectedColumn}`]: value };
        }
        return item;
      })
    );
  };
  const handleExistingColumnChange = (value: string, recordKey: string, column: string) => {
    console.log(value)
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
        <input
         className="inputcolor"
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
        <input
         className="inputcolor"
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
        <input
         className="inputcolor"
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
        <input
          value={text}
 className="inputcolor"
          onChange={(e) => handleExistingColumnChange(e.target.value, record.key = record.ID, 'Revenue2024')}
          style={{ width: '100%', border: 'none', padding: '0px' }}
        />
      ),
      width: "25%",
    },
  ];

  //columns related code

  const [columns, setColumns] = useState(defaultColumns)
  const performChanges = () => {
    console.log(dataSource, "data in perform change")
    //existing
    let dynamicColumns = []
    dynamicColumns = addedColumns.map(column => ({
      title: column,
      dataIndex: column,
      render: (text: any, record: RevenueData) => (
        <input
         className="inputcolor"
          value={record[column] || ''}
          onChange={(e) => {
            console.log(e.target.value, "Existing")
            handleDynamicColumnChange(e.target.value, record.ID)
          }}
          style={{ width: '100%', border: 'none', padding: '0px', color: 'red' }}
        />
      ),
      width: "25%",
    }));
    //for blank and forecast
    let forecastColumns = []
    forecastColumns = forecastRange ?
      Array.from({ length: forecastRange[1].year() - forecastRange[0].year() + 1 }, (_, index) => ({
        title: `${forecastTitle} ${forecastRange[0].year() + index}`,
        dataIndex: `forecast${index}`,
        width: "25%",
        render: (text: any, record: RevenueData) => {
          record.key = record.ID
          const forecastValue = record.forecasts?.[index]?.forecastValue ?? "";
          return forecastType === "blank" ? (
            <input
              id={`forecast-${record.key}-${index}`} // Unique ID for each input
              value={forecastValue}
              className="inputcolor"
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
    console.log("seeting columns")
    if(forecastType == "existing") {
      setColumns([...defaultColumns, ...dynamicColumns, ...forecastColumns])
      console.log(dynamicColumns, "dynamicColumns")
    } 
    if(forecastType == "future") {
      setColumns([...defaultColumns, ...forecastColumns])
      console.log(forecastColumns, "forecastColumns")
    }
    if(forecastType == "blank") {

      setColumns([...defaultColumns, ...forecastColumns])
      console.log(forecastColumns, "blank")
      console.log(addedColumns, "addedColumns")
    }
    console.log("seeting columns completed")
    setForecastTitle("")
    setForecastRange(null)
    // setSelectedColumn("")
  }
  useEffect(() => {
    if(forecastType=="existing") performChanges();
  }, [/*dataSource, , */addedColumns, addedColumns]);
  useEffect(() => {
    console.log("columns", columns)
    console.log("data in columns", dataSource)
  }, [columns])
 
  const options = defaultColumns.map((d: any) => ({
    label: d.dataIndex,
    value: d.dataIndex,
  }));
  const resetForm = () => {
    // debugger
    setForecastTitle('');
    setForecastRange(null);
    //  debugger
  }
  const exportToCSV = () => {
    
    console.log("exportToCSV",exportToCSV);

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(dataSource);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "table_data.csv");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataSource);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "table_data.xlsx");
  };
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between', alignItems:'center'}}>   
      <button onClick={() => setIsModalVisible(true)} className='forcast'>
        Forecasting
      </button>
      <button className='forcast'onClick={exportToCSV} >
        Export
      </button>
      {forecastType == "blank" ? (
      <button className='forcast' >
        Import
      </button> ) :( <>  </>) }
      </div>
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
              <Radio value="future">Future Forecast</Radio>
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








// const  abcd = [
//   { '0': 1 },
//   { '1': 2 },
//   { '2': 4 },
//   { '3': 6 },
//   { '4': 7 },
//   { '5': 9 }
// ]
//  const aaaaa =[] 
//  abcd.map((d,i)=>{
//  aaaaa[i] = d[`${i}`]
// })

// console.log(aaaaa,"aaaaa")


// const  abcd =[1,2,4,6,7,9];
//  const aaaaa =abcd.map((d,i)=>{
// return {
//   [i]:d
// }
// })

// console.log(aaaaa,"aaaaaa")
