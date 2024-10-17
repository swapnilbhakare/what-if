export const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '40%',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: '30%',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  }
];

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

export const prepareData = () => {
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
export const prepareData1 = () => {
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


