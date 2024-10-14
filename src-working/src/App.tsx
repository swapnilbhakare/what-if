

// import * as React from "react";
// import { Radio } from 'antd';
// import Forcasting from "./Components/Forcatsing";
// import WhatIfTable from "./Components/WhatIfTable";

// const App = () => {
//   const [selectedComponent, setSelectedComponent] = React.useState('forcasting');

//   const handleChange = (e: any) => {
//     setSelectedComponent(e.target.value);
//   };

//   return (
//     <div>
//       <Radio.Group onChange={handleChange} value={selectedComponent}>
//         <Radio value="forcasting"> <label>Forcasting</label></Radio>
//         <Radio value="whatIfTable"> <label>What If Table</label></Radio>
//       </Radio.Group>

//       <div style={{ marginTop: 20 }}>
//         {selectedComponent === 'forcasting' && <Forcasting />}
//         {selectedComponent === 'whatIfTable' && <WhatIfTable />}
//       </div>
//     </div>
//   );
// };

// export default App;

import * as React from "react";
import { Radio } from 'antd';
import Forcasting from "./Components/Forcatsing";
import WhatIfTable from "./Components/WhatIfTable";
import { IoHome } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import "../style/app.css"

const App = () => {
  const [selectedComponent, setSelectedComponent] = React.useState('forcasting');

  const handleChange = (e: any) => {
    setSelectedComponent(e.target.value);
  };

  return (
    <div style={{ padding: '1px',  }}>
      <div className="radiobox"> 


      <div className="home"> <div className="span"><span> <IoHome /> </span><span>Home</span></div>
          </div>
          <div className="admin"><div className="span"><span> <FaUser /> </span> <span>Admin</span></div></div>

        
      {/* Radio Buttons Group */}
      <Radio.Group onChange={handleChange} value={selectedComponent} style={{ display: 'flex', gap: '20px', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Radio value="forcasting"  style={{ color:'#00606'}}/>
          <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '500' }}>Forcasting</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Radio value="whatIfTable" style={{ color:'#00606'}} />
          <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '500' }}>What If </span>
        </div>
      </Radio.Group>
      </div>
      {/* Displayed Component */}
      <div  className="subheader" >
        {selectedComponent === 'forcasting' && <Forcasting   />}
        {selectedComponent === 'whatIfTable' && <WhatIfTable />}
      </div>
    </div>
  );
};

export default App;


