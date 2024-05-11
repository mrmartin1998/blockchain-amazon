"use client";
import React, { useState, useEffect } from "react";
import '../globals.css';
import { web3, Amazon, initializeWeb3 } from '../utils/web3';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { web3, Amazon } = await initializeWeb3();
                if (Amazon) {
                    console.log("Contract initialized and web3 is ready.");
                    setInitialized(true);
                } else {
                    console.error("Contract not initialized.");
                }
            } catch (error) {
                console.error("Web3 initialization error:", error);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (initialized) {
            loadProducts();
        }
    }, [initialized]); // Removed filter and sortOrder from dependencies to simplify the example

    const loadProducts = async () => {
        try {
            const count = await Amazon.methods.itemCount().call();
            console.log(`Total items: ${count}`);
            let loadedProducts = [];

            for (let i = 1; i <= count; i++) {
                const item = await Amazon.methods.items(i).call();
                if (item && item.id !== "0" && item.cost !== "0") { // Ensure valid items are added, checking cost is not zero
                    loadedProducts.push({
                        id: item.id,
                        name: item.name,
                        imageUrl: item.imageUrl,
                        category: item.category,
                        cost: item.cost,
                        stock: item.stock
                    });
                }
            }

            setProducts(loadedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const buyProduct = async (id) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const item = await Amazon.methods.items(id).call();
            const price = web3.utils.fromWei(item.cost, 'ether');
            await Amazon.methods.buy(id, 1).send({ from: accounts[0], value: price });
            alert('Purchase successful');
            loadProducts(); // Reload products to reflect the new stock count
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed, see console for details.');
        }
    };

    return (
        <div>
            <h1>Product Page</h1>
            <div>
                {products.length > 0 ? products.map(product => (
                    <div key={product.id}>
                        <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>Category: {product.category}</p>
                        <p>Price: {web3.utils.fromWei(product.cost, 'ether')} ETH</p>
                        <p>Stock: {product.stock}</p>
                        <button onClick={() => buyProduct(product.id)}>Buy</button>
                    </div>
                )) : (
                    <p>No products available.</p>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
