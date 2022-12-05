import {React, useState, useCallback} from 'react'
import {Button, Select} from '@shopify/polaris';
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function order() {

  const [selected, setSelected] = useState('5');
  const [til, settittle] = useState('');

  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const options = [
    {label: '5 Customers', value: '5'},
    {label: '10 Customers', value: '10'},
    {label: '15 Customers', value: '15'},
  ];

  const [checked, setChecked] = useState(false);
    const handleChange = useCallback((newChecked) => setChecked(newChecked), []);
    const app = useAppBridge();

    const collval = {
      key: selected,
    }

    const clicktocollection = async (collval) =>{
      console.log("object")
      
      try {
        const Token = await getSessionToken(app);
        console.log("qty==>")
        const res = await axios.post("/api/order-create",collval, {
          headers: {
            Authorization: "Bearer " + Token,
          },
          body: JSON.stringify(collval)
        });
        console.log("Garlic",res)
      } catch (error) {
        console.log(error)
      }
    }

    const newfunction = () => {
      clicktocollection(collval)
      console.log("Selected Option:", selected)
    }

  return (
    <>
      <Select
      label="Select number you want to add."
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
    <Button onClick={newfunction} >Add Customer</Button>
    </>
  )
}
