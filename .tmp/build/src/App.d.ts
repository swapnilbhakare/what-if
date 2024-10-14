import * as React from "react";
import "../style/app.css";
interface AppProps {
    host: any;
    options: any;
    dataView: any;
    formattingSettings: any;
    target: any;
    exportDataCb: any;
}
declare const App: React.FC<AppProps>;
export default App;
