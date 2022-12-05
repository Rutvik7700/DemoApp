import React from 'react';
import {useState, useCallback} from 'react';
import {Select,Card, ResourceList, Avatar, ResourceItem} from '@shopify/polaris';
import {Button} from '@shopify/polaris';
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Products() {
  const [selected, setSelected] = useState('1');
  const [til, settittle] = useState('');

  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const options = [
    {label: '1 Product', value: '1'},
    {label: '5 Products', value: '5'},
    {label: '10 Products', value: '10'},
  ];
    const [checked, setChecked] = useState(false);
    const handleChange = useCallback((newChecked) => setChecked(newChecked), []);
    const app = useAppBridge();


    
    // console.log("resul log==",til)


    
    // function makeprice(length) {
    //   var result           = '';
    //   var characters       = '1234567890';
    //   var charactersLength = characters.length;
    //   for ( var i = 0; i < length; i++ ) {
    //       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //   }
    //   return result;
    // }
    
    const reees = {
      qty: selected,
      
    }
    const addpro = async (reees) => {
      try {
        const token = await getSessionToken(app);
      console.log("token======>",token)
      const res = await axios.post("/api/products-create",reees, {
      headers: {
        Authorization: "Bearer " + token,
      },
        body: JSON.stringify(reees)
    });
    console.log("helo===>",res)
    // maketitle(x)
      } catch (error) {
        console.log(error)
      }
    }

    const clickfun = () =>{
      addpro(reees)
    }
    
  // const getCustomers = async () => {
  //   const token = await getSessionToken(app);
  //   // console.log("token======>",token)
  //   const res = await axios.get("/api/productss", {
  //     headers: {
  //       Authorization: "Bearer " + token,
  //     },
  //   });
  //   setCount(res.data);
  //   console.log("helo===>",res)
  // };


  return (
    <>
    
    <Select
      label="Select number you want to add."
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
    <Button onClick={clickfun} >Add Product</Button>
    <Card>
    <ResourceList
      resourceName={{singular: 'customer', plural: 'customers'}}
      items={[
        
      ]}
      renderItem={(item) => {
        const {id, url, name, location} = item;
        const media = <Avatar customer size="medium" name={name} />;

        // return (
          
        //   <ResourceItem
        //     id={id}
        //     url={url}
        //     media={media}
        //     accessibilityLabel={`View details for ${name}`}
        //   >
        //     <Button onClick={clickfun} >Add This</Button>
        //   </ResourceItem>
        // )
      }}
    />
  </Card>
    </>
  )
}
