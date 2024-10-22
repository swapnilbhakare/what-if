// export const columns = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     key: 'name',
//     width: '40%',
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     key: 'age',
//     width: '30%',
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     key: 'address',
//   }
// ];

import { Children } from "react"

// export const CompanyName = [
//   "Apple",
//   "Google",
//   "Amazon",
//   "Apple",
//   "Google",
//   "Amazon"
// ]
// export const Product = [
//   "I-Phone",
//   "Pixel",
//   "FireStick",
//   "Macbook",
//   "Pixel-1",
//   "FireStick-1"
// ]

// export const Revenue = [
//   2000,
//   1000,
//   5000,
//   300,
//   1500,
//   9500
// ]

// //heiarchical data

// export const prepareData = () => {
//   return [
//     {
//       ID: '1',
//       CompanyName: "Apple",
//       // Revenue: 2000
//       children: [
//         {
//           ID: '1.1',
//           CompanyName: "I-phone",
//           Revenue: 2000,
//           Revenue2022: 1000,
//         },
//         {
//           ID: '1.2',
//           CompanyName: "Macbook",
//           Revenue: 300,
//           Revenue2022: 100,
//         }
//       ]
//     },
//     {
//       ID: '2',
//       CompanyName: "Google",
//       children: [
//         {
//           ID: '2.1',
//           CompanyName: "Pixel",
//           Revenue: 1000,
//           Revenue2022: 99,
//         },
//         {
//           ID: '2.2',
//           CompanyName: "Pixel-1",
//           Revenue: 1500,
//           Revenue2022: 2000,
//         }
//       ]
//     },
//     {
//       ID: '3',
//       CompanyName: "Amazon",
//       children: [
//         {
//           ID: '3.1',
//           CompanyName: "FireStick",
//           Revenue: 5000,
//           Revenue2022: 2000,
//           children: [
//             {
//               ID: '3.1.1',
//               CompanyName: "FireStick-1",
//               Revenue: 3000,
//               Revenue2022: 1000,
//             },
//             {
//               ID: '3.1.2',
//               CompanyName: "FireStick-2",
//               Revenue: 2000,
//               Revenue2022: 1000,
//             },
//           ]
//         },
//         {
//           ID: '3.2',
//           CompanyName: "Amazon Web Services",
//           Revenue: 9500,
//           Revenue2022: 100,
//         }
//       ]
//     }
//   ]
// }

// // linear
// export const prepareData1 = () => {
//   return [
//     {
//       ID: '1',
//       CompanyName: "Apple",
//       Revenue2021: 2000,
//       Revenue2022: 3000

//     },
//     {
//       ID: '2',
//       CompanyName: "Google",
//       Revenue2021: 4000,
//       Revenue2022: 5000

//     },
//     {
//       ID: '3',
//       CompanyName: "Amazon",
//       Revenue2021: 7000,
//       Revenue2022: 8000,

//     }
//   ]
// }


export const CompanyName = [
  "Apple",
  "Google",
  "Amazon",
  "Apple",
  "Google",
  "Amazon"
]
export const Product = [
  "I-Phone",
  "Pixel",
  "FireStick",
  "Macbook",
  "Pixel-1",
  "FireStick-1"
]
export const Revenue = [
  2000,
  1000,
  5000,
  300,
  1500,
  9500
]

//heiarchical data
export const prepareData1 = () => {
  return [
    {
      ID: '1',
      CompanyName: "Apple",
      // Revenue: 2000
      children: [
        {
          ID: '1.1',
          CompanyName: "I-phone",
          Revenue: 2000,
          Revenue2022: 1000,
        },
        {
          ID: '1.2',
          CompanyName: "Macbook",
          Revenue: 300,
          Revenue2022: 100,
        }
      ]
    },
    {
      ID: '2',
      CompanyName: "Google",
      children: [
        {
          ID: '2.1',
          CompanyName: "Pixel",
          Revenue: 1000,
        },
        {
          ID: '2.2',
          CompanyName: "Pixel-1",
          Revenue: 1500
        }
      ]
    },
    {
      ID: '3',
      CompanyName: "Amazon",
      children: [
        {
          ID: '3.1',
          CompanyName: "FireStick",
          Revenue: 5000,
          children: [
            {
              ID: '3.1.1',
              CompanyName: "FireStick-1",
              Revenue: 3000
            },
            {
              ID: '3.1.2',
              CompanyName: "FireStick-2",
              Revenue: 2000
            },
          ]
        },
        {
          ID: '3.2',
          CompanyName: "Amazon Web Services",
          Revenue: 9500
        }
      ]
    }
  ]
}
// linear
export const prepareData2 = () => {
  return [
    {
      ID: '1',
      CompanyName: "Apple",
      Revenue2021: 2000,
      Revenue2022: 3000

    },
    {
      ID: '2',
      CompanyName: "Google",
      Revenue2021: 4000,
      Revenue2022: 5000

    },
    {
      ID: '3',
      CompanyName: "Amazon",
      Revenue2021: 7000,
      Revenue2022: 8000,

    }
  ]
}
//new data
export const prepareData = () => {
  return [
    {
      ID: '1',
      ParentCompany: "(HUL) Beauty & Personal Care",
      children: [
        {
          ID: '1.1',
          ParentCompany: "Dove",
          Revenue2023: 500000.50,
          Revenue2024: 600000.75,
          Revenue2025: 650000.90,
        },
        {
          ID: '1.2',
          ParentCompany: "Lux",
          Revenue2023: 450000.80,
          Revenue2024: 550000.60,
          Revenue2025: 580000.45,
        }
      ]
    },
    {
      ID: '2',
      ParentCompany: "(HUL) Food & Refreshment",
      children: [
        {
          ID: '2.1',
          ParentCompany: "Brooke Bond",
          Revenue2023: 320000.40,
          Revenue2024: 380000.55,
          Revenue2025: 420000.80,
        },
        {
          ID: '2.2',
          ParentCompany: "Kissan",
          Revenue2023: 280000.30,
          Revenue2024: 330000.60,
          Revenue2025: 370000.20,
        }
      ]
    },
    {
      ID: '3',
      ParentCompany: "(HUL) Home Care",
      children: [
        {
          ID: '3.1',
          ParentCompany: "Surf Excel",
          Revenue2023: 400000.10,
          Revenue2024: 450000.35,
          Revenue2025: 490000.50,
        },
        {
          ID: '3.2',
          ParentCompany: "Comfort",
          Revenue2023: 250000.20,
          Revenue2024: 300000.50,
          Revenue2025: 350000.75,
        }
      ]
    },
    {
      ID: '4',
      ParentCompany: "(HUL) Health & Hygiene",
      children: [
        {
          ID: '4.1',
          ParentCompany: "Lifebuoy",
          Revenue2023: 370000.50,
          Revenue2024: 420000.25,
          Revenue2025: 460000.85,
        },
        {
          ID: '4.2',
          ParentCompany: "Pureit",
          Revenue2023: 190000.40,
          Revenue2024: 210000.80,
          Revenue2025: 230000.60,
        }
      ]
    },
    {
      ID: '5',
      ParentCompany: "(HUL) Home Care & Detergents",
      children: [
        {
          ID: '5.1',
          ParentCompany: "Wheel",
          Revenue2023: 220000.50,
          Revenue2024: 250000.75,
          Revenue2025: 280000.90,
        },
        {
          ID: '5.2',
          ParentCompany: "Rin",
          Revenue2023: 300000.40,
          Revenue2024: 350000.60,
          Revenue2025: 400000.80,
        }
      ]
    }
  ];
}

// export const prepareData = () => {
//   return [
//     {
//       ID: '1',
//       ParentCompany: "McDonald's Corp.",
//       children: [
//         {
//           ID: '1.1',
//           ParentCompany: "Pizza",
//           children: [
//             {
//               ID: '1.1.1',
//               ParentCompany: "Pizza-1", 
//               Revenue2023: 130000.65,
//               Revenue2024: 145300.98
//             },
//             {
//               ID: '1.1.2',
//               ParentCompany: "Pizza-2", 
//               children: [
//                   {
//                     ID: '1.1.1.1',
//                     ParentCompany: "Pizza-2-1", 
//                     children: [
//                       {
//                         ID: '1.1.1.1.1',
//                         ParentCompany: "Pizza-2-1-1",  
//                         Revenue2023: 130000.65,
//                         Revenue2024: 145300.98
//                       }
//                     ] 
//                   },
//                   {
//                     ID: '1.1.1.2',
//                     ParentCompany: "Pizza-2-2",  
//                     Revenue2023: 130000.65,
//                     Revenue2024: 145300.98
//                   }
//               ]
//               // Revenue2023: 130000.65,
//               // Revenue2024: 145300.98
//             }
//           ], 
//           // Revenue2023: 145000.45,
//           // Revenue2024: 165000.78
//         },
//         {
//           ID: '1.2',
//           ParentCompany: "Coca-cola", 
//           Revenue2023: 130000.65,
//           Revenue2024: 145300.98
//         }
//       ]
//     },
//   ]
// }
//for algorithm
export const getData = () => {
  return [
    {
      "ID": "1",
      "ParentCompany": "McDonald's Corp.", // Can vary
      "SubProdtName": "Pizza", // Can vary
      "RevenueFor2021": "145000.45", // Can vary
      "RevenueFor2024": "165000.78", // Can vary
    },
    {
      "ID": "2",
      "ParentCompany": "McDonald's Corp.",
      "SubProductName": "Coca-Cola",
      "RevenueFor2023": "130000.65",
      "RevenueFor2024": "145300.98",
    },
    {
      "ID": "3",
      "ParentCompany": "McDonald's Corp.",
      "SubCompany": "Sandwich",
      "Revenue2022": "112000.11",
      "Revenue2023": "142500.75",
      "Revenue2024": "155000.34"
    },
    {
      "ID": "4",
      "ParentCompany": "McDonald's Corp.",
      "SubCompany": "Burger",
      "Revenue2022": "135000.23",
      "Revenue2023": "160500.45",
      "Revenue2024": "180000.78"
    },
    {
      "ID": "5",
      "ParentCompany": "Pizza Hut",
      "SubCompany": "Cheese Pizza",
      "Revenue2022": "105000.32",
      "Revenue2023": "115000.25",
      "Revenue2024": "122000.45"
    },
    {
      "ID": "3",
      "ParentCompany": "McDonald's Corp.",
      "SubCompany": "Sandwich",
      "Revenue2022": "112000.11",
      "Revenue2023": "142500.75",
      "Revenue2024": "155000.34"
    },
    {
      "ID": "4",
      "ParentCompany": "McDonald's Corp.",
      "SubCompany": "Burger",
      "Revenue2022": "135000.23",
      "Revenue2023": "160500.45",
      "Revenue2024": "180000.78"
    },
    {
      "ID": "5",
      "ParentCompany": "Pizza Hut",
      "SubCompany": "Cheese Pizza",
      "Revenue2022": "105000.32",
      "Revenue2023": "115000.25",
      "Revenue2024": "122000.45"
    },
    {
      "ID": "6",
      "ParentCompany": "Pizza Hut",
      "SubCompany": "Veggie Pizza",
      "Revenue2022": "110000.45",
      "Revenue2023": "125500.76",
      "Revenue2024": "135000.98"
    },
    {
      "ID": "7",
      "ParentCompany": "Pizza Hut",
      "SubCompany": "Pepperoni Pizza",
      "Revenue2022": "98000.22",
      "Revenue2023": "118000.12",
      "Revenue2024": "125500.32"
    },
    {
        "ID": "8",
        "ParentCompany": "Pizza Hut",
        "SubCompany": "Garlic Bread",
        "Revenue2022": "45000.12",
        "Revenue2023": "52000.25",
        "Revenue2024": "58000.5"
    },
    {
        "ID": "9",
        "ParentCompany": "Starbucks Corp.",
        "SubCompany": "Coffee",
        "Revenue2022": "145000.11",
        "Revenue2023": "160000.45",
        "Revenue2024": "170500.89"
    },
    {
        "ID": "10",
        "ParentCompany": "Starbucks Corp.",
        "SubCompany": "Frappuccino",
        "Revenue2022": "125000.45",
        "Revenue2023": "135000.55",
        "Revenue2024": "145000.65"
    },
    {
        "ID": "11",
        "ParentCompany": "Starbucks Corp.",
        "SubCompany": "Latte",
        "Revenue2022": "115000.78",
        "Revenue2023": "125000.88",
        "Revenue2024": "138000.98"
    },
    {
        "ID": "12",
        "ParentCompany": "Starbucks Corp.",
        "SubCompany": "Tea",
        "Revenue2022": "108000.34",
        "Revenue2023": "118000.45",
        "Revenue2024": "128000.67"
    },
    {
        "ID": "13",
        "ParentCompany": "Coca-Cola Company",
        "SubCompany": "Coke",
        "Revenue2022": "200000.67",
        "Revenue2023": "225000.34",
        "Revenue2024": "245000.89"
    },
    {
        "ID": "14",
        "ParentCompany": "Coca-Cola Company",
        "SubCompany": "Sprite",
        "Revenue2022": "145000.44",
        "Revenue2023": "158000.23",
        "Revenue2024": "170000.99"
    },
    {
        "ID": "15",
        "ParentCompany": "Coca-Cola Company",
        "SubCompany": "Fanta",
        "Revenue2022": "125000.56",
        "Revenue2023": "132500.45",
        "Revenue2024": "145000.89"
    },
    {
        "ID": "16",
        "ParentCompany": "Coca-Cola Company",
        "SubCompany": "Diet Coke",
        "Revenue2022": "115000.78",
        "Revenue2023": "128000.9",
        "Revenue2024": "135000.45"
    },
  ];
};
  
export interface KeyMap {
  parentCompanyKey: string;
  subCompanyKey: string[];
  revenueKeys: string[];
}
// Detects dynamic key names based on data
export const detectKeys = (data: any[]): KeyMap => {
  const keys: KeyMap = {
    parentCompanyKey: '',
    subCompanyKey: [], // Remains a single string
    revenueKeys: [],
  };

  // Set to collect unique keys
  const parentCompanyKeys = new Set<string>();
  const subCompanyKeysSet = new Set<string>();
  const revenueKeysSet = new Set<string>();

  data.forEach((item) => {
    // Dynamically detect the parent company key
    Object.keys(item).forEach((key) => {
      if (key.toLowerCase().includes("parentcompany")) {
        parentCompanyKeys.add(key);
      }
      if (key.toLowerCase().includes("subprod") || key.toLowerCase().includes("subproduct") || key.toLowerCase().includes("subcompany")) {
        subCompanyKeysSet.add(key);
      }
      if (key.toLowerCase().startsWith("revenue")) {
        revenueKeysSet.add(key);
      }
    });
  });

  // Assign the found keys to the result, if available
  keys.parentCompanyKey = Array.from(parentCompanyKeys)[0] || '';
  keys.subCompanyKey = Array.from(subCompanyKeysSet)
  keys.revenueKeys = Array.from(revenueKeysSet);

  // Log the detected keys for debugging
  console.log('Detected keys:', keys);

  return keys;
};
export const convertData = (data) => {
  // const data = getData();

  // Dynamically detect the keys from the data
  const { parentCompanyKey, subCompanyKey, revenueKeys } = detectKeys(data);
  let companyIdCounter = 1; 
  // Find all unique parent companies to ensure they are grouped together
  const groupedData = data.reduce((acc: any[], curr: any) => {
    const parentCompany = curr[parentCompanyKey];

    // Extract the first available sub-company name from the detected sub-company keys
    const subCompany = subCompanyKey.map(key => curr[key]).find(name => name) || "Unknown"; // Default to "Unknown" if missing

    // Find the parent company in the accumulator
    let company = acc.find(item => item.ParentCompany === parentCompany);

    // If the company doesn't exist, create a new company object
    if (!company) {
      company = {
        ID: companyIdCounter++/*curr.ID*/,  // Top-level ID for the company
        ParentCompany: parentCompany,
        children: [],
      };
      acc.push(company);
    }

    // Initialize revenue data with null for each revenue key to ensure all fields exist
    const revenueData: any = {};
    revenueKeys.forEach(key => {
      revenueData[key] = curr[key] !== undefined ? parseFloat(curr[key]) : null;
    });

    // Add sub-company data (with dynamic revenue fields)
    company.children.push({
      ID: `${company.ID}.${company.children.length + 1}`, // Dynamic child ID
      ParentCompany: subCompany, // Ensure ParentCompany is included
      ...revenueData, // Dynamic revenue fields
    });

    return acc;
  }, []);

  return groupedData
  // console.log("New data:", groupedData);
};


export const calculateColumnWidth = (text: string) => {
  const baseWidth = 100; // Base width for short text
  const extraWidthPerChar = 10; // Extra width for each character in the header
  const minWidth = 65; // Minimum width to prevent very narrow columns
  const maxWidth = 180; // Maximum width to prevent very wide columns

  // Calculate width based on text length
  const calculatedWidth = baseWidth + text.length * extraWidthPerChar;

  // Ensure width is within the min-max range
  return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
};

  
//in 




