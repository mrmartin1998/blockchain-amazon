"use client";
import React, { useState, useEffect } from "react";
import '../globals.css';
import { web3, Amazon, initializeWeb3 } from '../utils/web3';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            await initializeWeb3();
            const count = await Amazon.methods.itemCount().call();
            let loadedProducts = [];
            for (let i = 1; i <= count; i++) {
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
        } catch (error) {
            setError('Failed to load products: ' + error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        setCart([...cart]);
    };

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.id !== productId);
        setCart(updatedCart);
    };

    const buyProduct = async (productId, quantity) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const product = products.find(p => p.id === productId);
            if (!product) {
                alert('Product not found!');
                return;
            }
            const totalCost = web3.utils.toWei((product.cost * quantity).toString(), 'ether');
            await Amazon.methods.buy(productId, quantity).send({ from: accounts[0], value: totalCost });
            alert('Purchase successful');
            await loadProducts();  // Reload to update the stock
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed, see console for details.');
        }
    };

    const checkout = async () => {
        const accounts = await web3.eth.getAccounts();
        for (const item of cart) {
            await buyProduct(item.id, item.quantity);
        }
        setCart([]);
    };

    return (
        <div>
            <h1>Product Page</h1>
            {loading ? <p>Loading products...</p> : error ? <p>Error: {error}</p> : (
                <div>
                    {products.map(product => (
                        <div key={product.id}>
                            <img src={product.imageUrl} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>Category: {product.category}</p>
                            <p>Price: {product.cost} ETH</p>
                            <p>Stock: {product.stock}</p>
                            <button onClick={() => buyProduct(product.id, 1)}>Buy Now</button>
                            <button onClick={() => addToCart(product)}>Add to Cart</button>
                        </div>
                    ))}
                </div>
            )}
            {cart.length > 0 && (
                <div>
                    <h2>Shopping Cart</h2>
                    {cart.map(item => (
                        <div key={item.id}>
                            <p>{item.name} - Quantity: {item.quantity}</p>
                            <button onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={checkout}>Checkout</button>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
