
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../../models/CartItem";
import { CartSlice } from "../../models/CartSlice";

const initialState: CartSlice = {
  cartOpen: false,
  cartItems: [],
};

export const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity ?? 1) + 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
    },

    addItemsToCart: (state, action: PayloadAction<CartItem[]>) => {
      action.payload.forEach((reorderedItem) => {
        const existingItem = state.cartItems.find(
          (item) => item.id === reorderedItem.id
        );

        const quantityToAdd = reorderedItem.quantity ?? 1;

        if (existingItem) {
          existingItem.quantity =
            (existingItem.quantity ?? 1) + quantityToAdd;
        } else {
          state.cartItems.push({
            ...reorderedItem,
            quantity: quantityToAdd,
          });
        }
      });
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },

    reduceFromCart: (state, action: PayloadAction<number>) => {
      const item = state.cartItems.find(
        (item) => item.id === action.payload
      );

      if (item && (item.quantity ?? 1) > 1) {
        item.quantity = (item.quantity ?? 1) - 1;
      } else {
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== action.payload
        );
      }
    },

    setCartState: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },

    emptyCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  addItemsToCart,
  removeFromCart,
  setCartState,
  reduceFromCart,
  emptyCart,
} = cartSlice.actions;

export default cartSlice.reducer;
