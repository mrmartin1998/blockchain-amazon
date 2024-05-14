"use client";
import React, { useState, useEffect } from "react";
import '../globals.css';
import { web3, Amazon, initializeWeb3 } from '../utils/web3';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        async function init() {
            const initialized = await initializeWeb3();
            if (initialized && Amazon) {
                console.log("Contract initialized and web3 is ready.");
                setInitialized(true);
                loadProducts();
            } else {
                console.error("Contract not initialized.");
            }
        }
        init();
    }, []);

    const loadProducts = async () => {
        const count = await Amazon.methods.itemCount().call();
        let loadedProducts = [];
        for (let i = 1; i < count; i++) {
            const item = await Amazon.methods.items(i).call();
            if (item && item.id.toString() !== "0") {
                loadedProducts.push({
                    id: item.id.toString(),
                    name: item.name,
                    imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
                    category: item.category,
                    cost: web3.utils.fromWei(item.cost, 'ether'),
                    stock: item.stock.toString(),
                });
            }
        }
        setProducts(loadedProducts);
    };

    const addToCart = (product) => {
        const newCart = [...cart];
        const foundIndex = newCart.findIndex(item => item.id === product.id);
        if (foundIndex !== -1) {
            newCart[foundIndex].quantity += 1;
        } else {
            newCart.push({...product, quantity: 1});
        }
        setCart(newCart);
    };

    const removeFromCart = (id) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
    };

    const buyProduct = async (id) => {
        const accounts = await web3.eth.getAccounts();
        const product = products.find(p => p.id === id);
        if (!product) {
            alert('Product not found!');
            return;
        }
        const cost = web3.utils.toWei(product.cost, 'ether');
        try {
            await Amazon.methods.buy(id, 1).send({
                from: accounts[0],
                value: cost
            });
            alert('Purchase successful');
            loadProducts();  // Reload to update the stock
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed, see console for details.');
        }
    };

    const checkoutCart = async () => {
        const accounts = await web3.eth.getAccounts();
        for (const item of cart) {
            const cost = web3.utils.toWei((item.cost * item.quantity).toString(), 'ether');
            try {
                await Amazon.methods.buy(item.id, item.quantity).send({
                    from: accounts[0],
                    value: cost
                });
            } catch (error) {
                console.error('Checkout failed for item:', item.name, error);
                alert(`Checkout failed for item ${item.name}: ${error.message}`);
                return;
            }
        }
        alert('Checkout successful!');
        setCart([]);
        loadProducts();  // Reload to update the stock
    };

    return (
        <div>
            <h1>Product Page</h1>
            <div>
                {products.map(product => (
                    <div key={product.id}>
                        <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>Category: {product.category}</p>
                        <p>Price: {product.cost} ETH</p>
                        <p>Stock: {product.stock}</p>
                        <button onClick={() => buyProduct(product.id)}>Buy Now</button>
                        <button onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                ))}
                {cart.length > 0 && (
                    <div>
                        <h2>Shopping Cart</h2>
                        {cart.map(item => (
                            <div key={item.id}>
                                <p>{item.name} - Quantity: {item.quantity}</p>
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                            </div>
                        ))}
                        <button onClick={checkoutCart}>Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
