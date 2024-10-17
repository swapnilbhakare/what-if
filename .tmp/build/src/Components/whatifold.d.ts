import * as React from "react";
import "./whatIfTable.css";
export declare const EditableContext: React.Context<any>;
export interface Item {
    key: string;
    companyName: string;
    year2022: string;
    year2023: string;
    year2024: string;
    percentageChange?: string;
    minValue: any;
    maxValue: any;
    stepValue: any;
    copy: any;
}
export interface EditableRowProps {
    index: number;
}
export declare const EditableRow: React.FC<EditableRowProps>;
export interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof Item;
    record: Item;
    minValue: number;
    maxValue: number;
    stepValue: number;
    copy: boolean;
    showSlider: boolean;
    handleSave: (record: Item, i: any) => void;
}
export declare const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>>;
