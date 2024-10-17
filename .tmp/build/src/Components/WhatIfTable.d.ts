import * as React from "react";
import "./whatIfTable.css";
interface whatifProps {
    host: any;
    options1: any;
    dataView: any;
    exportDataCb: any;
    formattingSettings: any;
    target: any;
}
declare const WhatIfTable: React.FC<whatifProps>;
export default WhatIfTable;
