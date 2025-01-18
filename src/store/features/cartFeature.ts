/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import store from "../store";
import { toast } from "react-toastify";
import API, {
  removeItemsFromLoggedInUserCart,
  updateCart,
} from "../../endpoint/index";
import { getUserCartItems, addItemsToUserCart } from "../../endpoint/index";
import { Product } from "../../helpers/interface/interfaces";

// const product: Product = {
//   productImages: [],
// };

const initialState = {
  userCart: {
    cartProducts: [] as { productId: number; quantity: any; price: any }[],
  },
  guestUserCart: [] as { productId: number; quantity: any; price: any }[],
  cartLoading: false,
  addCartLoading: false,
  updateCartLoading: false,
  removeCartLoading: false,

  cartError: "",
};

export const fetchUserCart = createAsyncThunk("usersCart", async () => {
  const cartId = store.getState().user.cartId;
  console.log("cartId", cartId);
  try {
    const response = await API.get(`${getUserCartItems}${cartId}`);

    return response.data;
  } catch (error) {
    console.log("cart error", error);
  }
});

export const addUserItemsToCart = createAsyncThunk(
  "addUserItemsToCart",
  async (
    {
      customerId,
      product,
      cartId,
    }: { customerId: string; product: Product; cartId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.post(`${addItemsToUserCart}`, {
        cartId: cartId,
        productId: product.productId,
        customerId: customerId,
        quantity: product.quantity,
      });
      return response.data;
    } catch (error: any) {
      console.log("error", error);
      return rejectWithValue(error.response.data);
    }
  }
);
export const removeUserItemsFromCart = createAsyncThunk(
  "removeUserItemsFromCart",
  async (product: Product) => {
    const cartId = store.getState().user.cartId;
    const customerId = store.getState().user.currentUser?.uid || "";
    try {
      const response = await API.delete(
        `${removeItemsFromLoggedInUserCart}/${customerId}/${cartId}/${product.productId}`
      );
      return response.data;
    } catch (error: any) {
      if (error) {
        toast.error(`Error removing product, please try again.`, {
          position: "top-right",
        });
        initialState.removeCartLoading = false;
      }
      return;
    }
  }
);

export const updateUserItemsInCart = createAsyncThunk(
  "updateUserItemsInCart",
  async (
    {
      customerId,
      product,
      cartId,
    }: { customerId: string; product: Product; cartId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(`${updateCart}`, {
        cartId: cartId,
        productId: product.productId,
        customerId: customerId,
        quantity: product.quantity,
      });
      return response.data;
    } catch (error: any) {
      console.log("error", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    guestAddToCart: (state, action) => {
      const foundItem = state.guestUserCart.findIndex(
        (product: { productId: number }) =>
          product.productId === action.payload.productId
      );

      if (foundItem >= 0) {
        (state.guestUserCart[foundItem] as { quantity: number }).quantity +=
          action.payload.quantity;
        (state.guestUserCart[foundItem] as unknown as { salesPrice: number }).salesPrice +=
          action.payload.salesPrice;
        toast.info(
          `${action.payload.productName} already exist. Quantity updated`,
          {
            position: "top-right",
          }
        );
      } else {
        const temporaryProduct = {
          ...action.payload,
        };
        state.guestUserCart.push(temporaryProduct as never);
        toast.success(`${action.payload.productName} added to cart`, {
          position: "top-right",
        });
      }
      localStorage.setItem(
        "guestUserCart",
        JSON.stringify(state.guestUserCart)
      );
    },
    guestRemoveFromCart: (state, action) => {
      const removeItem = state.guestUserCart.filter(
        (product: { productId: number }) =>
          product.productId !== action.payload.productId
      );
      state.guestUserCart = removeItem;

      toast.success(`${action.payload.productName} removed from cart`, {
        position: "top-right",
      });
      localStorage.setItem(
        "guestUserCart",
        JSON.stringify(state.guestUserCart)
      );
    },
    resetUserCart: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserCart.pending, (state) => {
      state.cartLoading = true;
    });
    builder.addCase(fetchUserCart.fulfilled, (state, action) => {
      state.userCart = action.payload;
      state.cartLoading = false;
      state.cartError = "";
    });
    builder.addCase(fetchUserCart.rejected, (state, action) => {
      state.cartLoading = false;
      state.userCart.cartProducts = [];
      state.cartError = action.error.message || "";
    });

    builder.addCase(addUserItemsToCart.pending, (state) => {
      state.addCartLoading = true;
    });

    builder.addCase(addUserItemsToCart.fulfilled, (state, action) => {
      state.addCartLoading = false;

      const foundItem: { productId: number; quantity: any; price: any }[] = state.userCart.cartProducts || [];
      const alreadyExistingProduct = foundItem.findIndex(
        (item: { productId: number }) =>
          item.productId === action.payload.productId
      );
      if (alreadyExistingProduct >= 0) {
        const updatedItem = {
          productId: foundItem[alreadyExistingProduct].productId,
          quantity: action.payload.quantity,
          price: action.payload.price,
        };
        foundItem[alreadyExistingProduct] = updatedItem;
      } else {
        state.userCart.cartProducts = [action.payload as never, ...foundItem];
      }
      toast.success(
        `${action.payload.productName} ${action.payload.responseMessage}`,
        {
          position: "top-right",
        }
      );
      state.cartError = "";
    });
    builder.addCase(addUserItemsToCart.rejected, (state, action) => {
      state.addCartLoading = false;
      toast.error("Failed to add to cart.", {
        position: "top-right",
      });
      state.cartError = action.error.message || "";
    });

    builder.addCase(updateUserItemsInCart.pending, (state) => {
      state.updateCartLoading = true;
    });

    builder.addCase(updateUserItemsInCart.fulfilled, (state, action) => {
      state.updateCartLoading = false;
      toast.success(`${action.payload.responseMessage}`, {
        position: "top-right",
      });
      state.cartError = "";
    });

    builder.addCase(updateUserItemsInCart.rejected, (state, action) => {
      state.updateCartLoading = false;
      state.cartError = action.error.message || "";
    });

    builder.addCase(removeUserItemsFromCart.pending, (state) => {
      state.removeCartLoading = true;
    });

    builder.addCase(removeUserItemsFromCart.fulfilled, (state, action) => {
      state.removeCartLoading = false;
      state.userCart.cartProducts = state.userCart.cartProducts.filter(
        (product: { productId: number }) =>
          product.productId !== action.payload.productId
      );
      toast.success(`${action.payload.responseMessage}`, {
        position: "top-right",
      });
      state.cartError = "";
    });

    builder.addCase(removeUserItemsFromCart.rejected, (state, action) => {
      state.removeCartLoading = false;
      state.cartError = action.error.message || "";
    });
  },
});

export const { guestAddToCart, guestRemoveFromCart, resetUserCart } =
  cartSlice.actions;

export default cartSlice.reducer;
