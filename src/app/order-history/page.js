"use client";
import React, { useEffect, useState } from "react";
import '../globals.css';
import { web3, Amazon, initializeWeb3 } from '../utils/web3';

const OrderHistoryPage = () => {
    const [orderIds, setOrderIds] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrderIds() {
            try {
                await initializeWeb3();
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) {
                    console.error('No accounts found. Make sure your wallet is connected.');
                    setLoading(false);
                    return;
                }

                const account = accounts[0];
                console.log("Account fetched:", account);

                // Fetch the order IDs using the new function
                const orderIds = await Amazon.methods.getOrderIds(account).call();
                console.log("Order IDs fetched:", orderIds);

                if (Array.isArray(orderIds) && orderIds.length > 0) {
                    setOrderIds(orderIds);

                    // Fetch the details for each order ID
                    const orderDetails = await Promise.all(
                        orderIds.map(orderId => Amazon.methods.orderDetails(orderId.toString()).call())
                    );
                    console.log("Order details fetched:", orderDetails);

                    setOrders(orderDetails);
                } else {
                    console.log("No orders found for this account.");
                    setOrders([]);
                }
            } catch (err) {
                console.error('Failed to fetch order IDs:', err);
                setError(`Failed to fetch order IDs: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }

        fetchOrderIds();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Order History</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {orders.length > 0 ? (
                <ul>
                    {orders.map(order => (
                        <li key={order.orderId}>
                            Order ID: {order.orderId.toString()}, Item ID: {order.itemId.toString()}, Quantity: {order.quantity.toString()}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default OrderHistoryPage;
