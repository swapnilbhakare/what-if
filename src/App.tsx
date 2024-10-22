import * as React from "react";
import Forcasting from "./Components/Forcatsing";
import WhatIfTable from "./Components/WhatIfTable";
import { IoHome } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import "../style/app.css";
import { Button } from "antd";

interface AppProps {
  host: any; // You can replace 'any' with the specific type if needed
  options: any; // Similarly, type as required
  dataView: any; // Type this based on your use case
  formattingSettings: any;
  target: any // Type as needed
  exportDataCb: any
}

const App: React.FC<AppProps> = ({ host, options, dataView, formattingSettings, target, exportDataCb, }) => {
  // console.log("props in app", host, options, dataView, formattingSettings, target)
  const [selectedComponent, setSelectedComponent] = React.useState('whatIfTable');

  const handleButtonClick = (value: string) => {
    setSelectedComponent(value);
  };

  return (
    <div style={{ padding: '1px', borderRadius: 'none' }}>
      <div className="radiobox">

        <div className="home">
          <div className="span">
            <span><IoHome /></span>
            <span>Home</span>
          </div>
        </div>

        <div className="admin">
          <div className="span">
            <span><FaUser /></span>
            <span>Admin</span>
          </div>
        </div>

        {/* Buttons Group */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '5px' }}>


          <button
            className="button-style-main"
            onClick={() => handleButtonClick('whatIfTable')}
          >
            <span> What If </span>
          </button>

          <button
            className="button-style-main"
            onClick={() => handleButtonClick('forcasting')}
          >
            <span>Forcasting</span>
          </button>

        </div>
      </div>

      {/* Displayed Component */}
      <div className="subheader">
        {selectedComponent === 'forcasting' && <Forcasting
          host={host}
          options1={options}
          exportDataCb={exportDataCb}
          dataView={dataView}
          formattingSettings={formattingSettings}
          target={target} />}
        {selectedComponent === 'whatIfTable' && <WhatIfTable 
        
        host={host}
        options1={options}
        exportDataCb={exportDataCb}
        dataView={dataView}
        formattingSettings={formattingSettings}
        target={target} />}
        
      </div>
    </div>
  );
};

export default App;
