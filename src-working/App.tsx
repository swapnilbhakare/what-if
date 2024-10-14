// import * as React from "react";
// import Forcasting from "./Components/Forcatsing";
// import { Switch } from 'antd';
// import WhatIfTable from "./Components/WhatIfTable";
// const App = () => {
//   const[forcasting , setForcasting]= React.useState(false)
//   const onChange = (checked: boolean) => {
//     setForcasting(checked)
//   };
//   return (
//     <div>
//     <Switch  onChange={onChange} />
// {
// forcasting ? <Forcasting /> : <WhatIfTable />
// }
//     </div>
//   );
// };

// export default App;

import * as React from "react";
import { Tabs } from 'antd';
import Forcasting from "./Components/Forcatsing";
import WhatIfTable from "./Components/WhatIfTable";

const { TabPane } = Tabs;

const App = () => {
  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Forcasting" key="1">
          <Forcasting />
        </TabPane>
        <TabPane tab="What If Table" key="2">
          <WhatIfTable />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
