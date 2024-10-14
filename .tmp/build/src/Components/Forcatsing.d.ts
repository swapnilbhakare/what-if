import "../../src/forcast.css";
import * as React from "react";
interface ForecastingProps {
    host: any;
    options1: any;
    dataView: any;
    exportDataCb: any;
    formattingSettings: any;
    target: any;
}
declare const Forcasting: React.FC<ForecastingProps>;
export default Forcasting;
