export declare const columns: ({
    title: string;
    dataIndex: string;
    key: string;
    width: string;
} | {
    title: string;
    dataIndex: string;
    key: string;
    width?: undefined;
})[];
export declare const CompanyName: string[];
export declare const Product: string[];
export declare const Revenue: number[];
export declare const prepareData: () => ({
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
export declare const prepareData1: () => {
    ID: string;
    CompanyName: string;
    Revenue2021: number;
    Revenue2022: number;
}[];
