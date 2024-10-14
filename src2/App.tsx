import * as React from "react";


import Forcasting from "./Components/Forcatsing";
import { Switch } from 'antd';

import WhatIfTable from "./Components/WhatIfTable";
const App = () => {
  const[forcasting , setForcasting]= React.useState(false)
  const onChange = (checked: boolean) => {
    setForcasting(checked)
  };
  return (
    <div>
    <Switch  onChange={onChange} />
{
forcasting ? <Forcasting /> : <WhatIfTable />
}
    </div>
  );
};

export default App;
