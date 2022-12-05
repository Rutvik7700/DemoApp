import React from 'react'
import {useState, useCallback} from 'react';
import {Select,Card, ResourceList, Avatar, ResourceItem} from '@shopify/polaris';
import {Button} from '@shopify/polaris';
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Collection() {
  const [selected, setSelected] = useState('1');
  const [til, settittle] = useState('');

  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const options = [
    {label: '1 Collection', value: '1'},
    {label: '5 Collection', value: '5'},
    {label: '10 Collection', value: '10'},
  ];
    const [checked, setChecked] = useState(false);
    const handleChange = useCallback((newChecked) => setChecked(newChecked), []);
    const app = useAppBridge();

    const collval = {
      key: selected,
    }

    const clicktocollection = async (collval) =>{
      
      try {
        const Token = await getSessionToken(app);
        console.log("qty==>",selected)
        const res = await axios.post("/api/collection-create",collval, {
          headers: {
            Authorization: "Bearer " + Token,
          },
          body: JSON.stringify(collval)
        });
        console.log("Lasan",res)
      } catch (error) {
        console.log(error)
      }
    }

    const newfunction = () => {
      clicktocollection(collval)
    }

  return (
    <>
      <Select
      label="Select number you want to add."
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
    <Button onClick={newfunction} >Add Collection</Button>
    </>
  )
}
