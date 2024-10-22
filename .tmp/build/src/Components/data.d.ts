export declare const CompanyName: string[];
export declare const Product: string[];
export declare const Revenue: number[];
export declare const prepareData1: () => ({
    ID: string;
    CompanyName: string;
    children: {
        ID: string;
        CompanyName: string;
        Revenue: number;
        Revenue2022: number;
    }[];
} | {
    ID: string;
    CompanyName: string;
    children: ({
        ID: string;
        CompanyName: string;
        Revenue: number;
        children: {
            ID: string;
            CompanyName: string;
            Revenue: number;
        }[];
    } | {
        ID: string;
        CompanyName: string;
        Revenue: number;
        children?: undefined;
    })[];
})[];
export declare const prepareData2: () => {
    ID: string;
    CompanyName: string;
    Revenue2021: number;
    Revenue2022: number;
}[];
export declare const prepareData: () => {
    ID: string;
    ParentCompany: string;
    children: {
        ID: string;
        ParentCompany: string;
        Revenue2023: number;
        Revenue2024: number;
        Revenue2025: number;
    }[];
}[];
export declare const getData: () => ({
    ID: string;
    ParentCompany: string;
    SubProdtName: string;
    RevenueFor2021: string;
    RevenueFor2024: string;
    SubProductName?: undefined;
    RevenueFor2023?: undefined;
    SubCompany?: undefined;
    Revenue2022?: undefined;
    Revenue2023?: undefined;
    Revenue2024?: undefined;
} | {
    ID: string;
    ParentCompany: string;
    SubProductName: string;
    RevenueFor2023: string;
    RevenueFor2024: string;
    SubProdtName?: undefined;
    RevenueFor2021?: undefined;
    SubCompany?: undefined;
    Revenue2022?: undefined;
    Revenue2023?: undefined;
    Revenue2024?: undefined;
} | {
    ID: string;
    ParentCompany: string;
    SubCompany: string;
    Revenue2022: string;
    Revenue2023: string;
    Revenue2024: string;
    SubProdtName?: undefined;
    RevenueFor2021?: undefined;
    RevenueFor2024?: undefined;
    SubProductName?: undefined;
    RevenueFor2023?: undefined;
})[];
export interface KeyMap {
    parentCompanyKey: string;
    subCompanyKey: string[];
    revenueKeys: string[];
}
export declare const detectKeys: (data: any[]) => KeyMap;
export declare const convertData: (data: any) => any;
export declare const calculateColumnWidth: (text: string) => number;
