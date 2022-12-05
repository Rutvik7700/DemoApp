import React from 'react';

import {Card, Tabs} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import Products from '../pages/products.jsx';
import Customer from '../pages/customer.jsx';
import Collection from '../pages/collection.jsx';
import Order from '../pages/order.jsx';

export default function MainPage() {

    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    );

    const tabs = [
        {
            id: "0",
            content: 'Product',
            panelID: 'product-content',
        },
        {
        id: "1",
        content: 'Collection',
        accessibilityLabel: 'All customers',
        panelID: 'collection-content',
        },
        {
        id:"2",
        content: 'Customer',
        panelID: 'customer-content',
        },
        {
        id: "3",
        content: 'Order',
        panelID: 'order-content',
        },
        
    ];
    const tabChangeFunction = () => {
        return(
            selected === 0?
            <Products/>:
            selected === 1?<Collection/>:selected ===2?<Customer/>:selected ===3?<Order/>:<h1>page not exist</h1>
        )
    }
    return (
        <>
            <Card>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted/>
            </Card>
            
            {tabChangeFunction()}
        </>
    )}

