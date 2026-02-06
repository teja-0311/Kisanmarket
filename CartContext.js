import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
const API_URL = "http://10.15.108.12:5000/api/cart";

export const CartProvider = ({ children, userPhone }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from DB whenever userPhone changes
  useEffect(() => {
    if (!userPhone) return setLoading(false);

    const fetchCart = async () => {
      try {
        const res = await axios.get(`${API_URL}/${userPhone}`);
        setCart(res.data.items || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userPhone]);

  // Sync cart with DB
  const syncCart = async (newCart) => {
    if (!userPhone) return;
    setCart(newCart); // update local state immediately
    try {
      await axios.post(`${API_URL}/update`, {
        phone: userPhone,
        items: newCart,
      });
    } catch (err) {
      console.error("Error syncing cart:", err);
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (!product?._id) return;

    const existingItem = cart.find((item) => item.productId === product._id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.productId === product._id
          ? { ...item, cartQuantity: item.cartQuantity + quantity }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product._id,
          cropName: product.cropName || product.name,
          price: product.price,
          quantity: product.quantity || 1,
          location: product.location || "",
          imageUrl: product.imageUrl || "",
          cartQuantity: quantity,
        },
      ];
    }

    syncCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    syncCart(updatedCart);
  };

  const updateQuantity = (productId, quantity) => {
    const updatedCart = cart
      .map((item) =>
        item.productId === productId ? { ...item, cartQuantity: quantity } : item
      )
      .filter((item) => item.cartQuantity > 0);
    syncCart(updatedCart);
  };

  const clearCart = async () => {
    setCart([]);
    if (!userPhone) return;
    try {
      await axios.delete(`${API_URL}/clear/${userPhone}`);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
