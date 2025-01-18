
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import API, {
  addToWishList,
  getUserWishList,
  moveItemFromWishListToCart,
  removeFromWishList,
} from "../../endpoint/index";
import store from "../store";

interface Product {
  productId: number;
  productName: string;
  quantity?: number;
  price?: number;
  responseMessage?: string;
}

const initialState = {
  userWishList: {
    wishListProducts: [] as Product[],
  },
  guestWishList: [] as Product[],
  moveWishListToCartLoading: false,
  wishlistLoading: false,
  addToWishListLoading: false,
  removeWishListLoading: false,
  migrateToCartLoading: false,
  wishListError: "",
};

export const fetchWishListFromServer = createAsyncThunk(
  "userWishList",
  async () => {
    const customerId = store.getState().user.currentUser?.uid;
    try {
      const response = await API.get(`${getUserWishList}${customerId}`);
      return response.data;
    } catch (error) {
      console.log("wish list error", error);
      throw error;
    }
  }
);

export const addItemToUserWishList = createAsyncThunk(
  "addItemToUserWishList",
  async ({ customerId, productId, quantity, wishListId }: { customerId: string, productId: number, quantity: number, wishListId: string }) => {
    try {
      const response = await API.post(`${addToWishList}`, {
        wishListId,
        customerId,
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.log("add item error", error);
      throw error;
    }
  }
);

export const removeItemsFromUserWishList = createAsyncThunk(
  "removeItemsFromUserWishList",
  async (product: { productId: number }) => {
    const wishListId = store.getState().user.wishListId;
    const customerId = store.getState().user.currentUser?.uid || "";
    try {
      const response = await API.delete(
        `${removeFromWishList}/${customerId}/${wishListId}/${product.productId}`
      );
      return response.data;
    } catch (error) {
      console.log("remove item error", error);
      toast.error(`Error removing product, please try again.`, {
        position: "top-right",
      });
      throw error;
    }
  }
);

export const moveWishListToCart = createAsyncThunk(
  "moveWishListToCart",
  async ({customerId, productId, cartId, wishListId}: { customerId: string, productId: number, cartId: string, wishListId: string }) => {
    try {
      const response = await API.post(`${moveItemFromWishListToCart}`, {
        customerId,
        productId,
        cartId,
        wishListId,
      });
      return response.data;
    } catch (error) {
      console.log("move to cart error", error);
      throw error;
    }
  }
);

export const wishListSlice = createSlice({
  name: "wishList",
  initialState,
  reducers: {
    guestAddToWishList: (state, action) => {
      const foundWishListItem = state.guestWishList.findIndex(
        (product: { productId: number }) => product.productId === action.payload.productId
      );

      if (foundWishListItem >= 0) {
        toast.info(
          `${action.payload.productName} already exists in wish list`,
          {
            position: "top-right",
          }
        );
      } else {
        state.guestWishList.push(action.payload);
        toast.success(`${action.payload.productName} added to wish list`, {
          position: "top-right",
        });
      }

      localStorage.setItem(
        "guestWishList",
        JSON.stringify(state.guestWishList)
      );
    },
    guestRemoveFromWishList: (state, action) => {
      state.guestWishList = state.guestWishList.filter(
        (product) => product.productId !== action.payload.productId
      );

      toast.success(`${action.payload.productName} removed from wish list`, {
        position: "top-right",
      });
      localStorage.setItem(
        "guestWishList",
        JSON.stringify(state.guestWishList)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishListFromServer.pending, (state) => {
      state.wishlistLoading = true;
    });
    builder.addCase(fetchWishListFromServer.fulfilled, (state, action) => {
      state.userWishList = action.payload;
      state.wishlistLoading = false;
      state.wishListError = "";
    });
    builder.addCase(fetchWishListFromServer.rejected, (state, action) => {
      state.wishlistLoading = false;
      state.userWishList.wishListProducts = [];
      state.wishListError = action.error.message || "";
    });

    builder.addCase(addItemToUserWishList.pending, (state) => {
      state.addToWishListLoading = true;
    });
    builder.addCase(addItemToUserWishList.fulfilled, (state, action) => {
      // state.userWishList.wishListProducts.push(action.payload);
      state.addToWishListLoading = false;
      const foundItem = state.userWishList.wishListProducts || [];
      const alreadyExistingProduct = foundItem.findIndex(
        (item: { productId: number }) =>
          item.productId === action.payload.productId
      );
      if (alreadyExistingProduct >= 0) {
        const updatedItem = {
          ...foundItem[alreadyExistingProduct],
          quantity: action.payload.quantity,
          price: action.payload.price,
        };
        foundItem[alreadyExistingProduct] = updatedItem;
      } else {
        state.userWishList.wishListProducts = [
          action.payload as never,
          ...foundItem,
        ];
      }
      toast.success(
        `${action.payload.productName} ${action.payload.responseMessage}`,
        {
          position: "top-right",
        }
      );
      state.wishListError = "";
    });
    builder.addCase(addItemToUserWishList.rejected, (state, action) => {
      state.addToWishListLoading = false;
      state.wishListError = action.error.message || "";
    });

    builder.addCase(removeItemsFromUserWishList.pending, (state) => {
      state.removeWishListLoading = true;
    });
    builder.addCase(removeItemsFromUserWishList.fulfilled, (state, action) => {
      state.userWishList.wishListProducts =
        state.userWishList.wishListProducts.filter(
          (product) => product.productId !== action.payload.productId
        );
      state.removeWishListLoading = false;
      state.wishListError = "";
      toast.success(`${action.payload.responseMessage}`, {
        position: "top-right",
      });
    });
    builder.addCase(removeItemsFromUserWishList.rejected, (state, action) => {
      state.removeWishListLoading = false;
      state.wishListError = action.error.message || "";
    });

    builder.addCase(moveWishListToCart.pending, (state) => {
      state.migrateToCartLoading = true;
    });
    builder.addCase(moveWishListToCart.fulfilled, (state) => {
      state.migrateToCartLoading = false;
      state.wishListError = "";
      toast.success(`Product moved added to cart.`, {
        position: "top-right",
      });
    });
    builder.addCase(moveWishListToCart.rejected, (state, action) => {
      state.migrateToCartLoading = false;
      state.wishListError = action.error.message || "";
    });
  },
});

export const { guestAddToWishList, guestRemoveFromWishList } =
  wishListSlice.actions;

export default wishListSlice.reducer;
