import * as React from "react";
interface PopupModalProps {
    availableColumns: any;
    onClose: () => void;
    onSubmit: (data: WhatIfParameterType | WhatIfSimulationObject | WhatIfBulkEditingObject) => void;
}
export declare const ARRAY_RADIO: string[];
export interface WhatIfParameterType {
    selectedRadio: any;
    name: string;
    sliderMinimumValue: any;
    sliderMaximumValue: any;
    sliderIncrementByValue: any;
    sliderDefaultValue: any;
    copyPreviousData: boolean;
    selectedColumn: string;
    varianceStyle: string;
    showSlider: boolean;
}
export interface WhatIfSimulationObject {
    selectedRadio: string;
    inputTitle: string;
    availableColumns: any[];
}
export interface WhatIfBulkEditingObject {
    selectedRadio: string;
    availableColumns: any[];
    sliderMinimumValue: any;
    sliderMaximumValue: any;
    inputTitle: any;
}
export declare const PopupModal: React.FC<PopupModalProps>;
export {};
