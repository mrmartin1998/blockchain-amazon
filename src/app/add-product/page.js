"use client";
import { useState } from "react";
import '../globals.css';
import { web3, Amazon } from '../utils/web3';

export default function AddProduct() {
    const [product, setProduct] = useState({
        name: '',
        category: '',
        cost: '',
        stock: '',
        manufacturer: '',
        dimensions: '',
        weight: '',
        image: null
    });
    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setProduct(prev => ({ ...prev, image: e.target.files[0] }));
    };

    // Define uploadImage function inside the component
    const uploadImage = async (file) => {
        // Return a placeholder image URL directly
        return "https://via.placeholder.com/150";
    };

    const addProduct = async (e) => {
        e.preventDefault();

        // Use the placeholder image directly
        const imageUrl = await uploadImage(product.image);
        const costInWei = web3.utils.toWei(product.cost, 'ether');

        try {
            const accounts = await web3.eth.getAccounts();
            if (!await Amazon.methods.isSeller(accounts[0]).call()) {
                setResponseMessage("You are not authorized to list products.");
                return;
            }

            await Amazon.methods.list(
                product.name,
                product.category,
                imageUrl,
                costInWei,
                product.stock,
                product.manufacturer,
                product.dimensions,
                product.weight
            ).send({ from: accounts[0] });

            setResponseMessage('Product added successfully!');
        } catch (error) {
            console.error('Error while adding product:', error);
            setResponseMessage('Error while adding product: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Add Product Page</h2>
            <p>{responseMessage}</p>
            <form onSubmit={addProduct}>
                <input type="text" name="name" placeholder="Product Name" required onChange={handleChange} />
                <input type="text" name="category" placeholder="Category" required onChange={handleChange} />
                <input type="number" name="cost" placeholder="Cost (in ETH)" step="0.00001" required onChange={handleChange} />
                <input type="number" name="stock" placeholder="Stock" required onChange={handleChange} />
                <input type="file" name="image" accept="image/*" required onChange={handleImageChange} />
                <input type="text" name="manufacturer" placeholder="Manufacturer" required onChange={handleChange} />
                <input type="text" name="dimensions" placeholder="Dimensions" required onChange={handleChange} />
                <input type="number" name="weight" placeholder="Weight" step="0.000001" required onChange={handleChange} />
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
}
