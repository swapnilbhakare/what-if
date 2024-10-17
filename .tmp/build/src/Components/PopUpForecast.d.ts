import * as React from "react";
interface PopupModalProps {
    availableColumns: any;
    onClose: () => void;
    onSubmit: (data: WhatIfParameterType | BlankForecastObject | ExistingForecastObject) => void;
}
export declare const ARRAY_RADIO: string[];
export interface WhatIfParameterType {
    selectedRadio: string;
    inputTitle: string;
    availableColumns: any[];
    dateRange: any;
}
export interface BlankForecastObject {
    selectedRadio: string;
    inputTitle: string;
    availableColumns: any[];
    dateRange: any;
}
export interface ExistingForecastObject {
    selectedRadio: string;
    selectedColumn: any;
    inputTitle: any;
}
export declare const PopupModal: React.FC<PopupModalProps>;
export {};
