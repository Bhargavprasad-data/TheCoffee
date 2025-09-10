import { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// No seed data. Only load from backend.

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load products from backend on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    try {
      setLoading(true);
      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        imageUrl: product.image,
        category: product.category,
        countInStock: parseInt(product.stock),
        roastLevel: product.category.includes('Light') ? 'Light' : 
                   product.category.includes('Dark') ? 'Dark' : 'Medium',
        origin: product.origin,
        weight: 250
      };
      
      const response = await productsAPI.create(productData);
      // Refresh list from server to ensure consistency
      await fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      // Do not silently fall back; require backend to succeed
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, updatedProduct) => {
    try {
      setLoading(true);
      const productData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: parseFloat(updatedProduct.price),
        imageUrl: updatedProduct.image,
        category: updatedProduct.category,
        countInStock: parseInt(updatedProduct.stock),
        roastLevel: updatedProduct.category.includes('Light') ? 'Light' : 
                   updatedProduct.category.includes('Dark') ? 'Dark' : 'Medium',
        origin: updatedProduct.origin,
        weight: 250
      };
      
      const response = await productsAPI.update(productId, productData);
      await fetchProducts();
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      await productsAPI.delete(productId);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (productId) => {
    return products.find(p => p._id === productId || p.id === productId);
  };

  const getFeaturedProducts = () => {
    return products.filter(p => p.featured);
  };

  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category);
  };

  const searchProducts = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery) ||
      p.origin.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
