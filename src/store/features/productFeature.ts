/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { productBrands } from "../../endpoint";
import { productsEndpoint } from "../../endpoint";
import { toast } from "react-toastify";

const initialState = {
  product: [],
  brands: [],
  productLoading: false,
  brandsLoading: false,
  error: "",
};

export const fetchProductToStore = createAsyncThunk(
  "all products",
  async () => {
    const response = await API.get(`${productsEndpoint}`);

    return response.data;
  }
);

export const productBrandsToStore = createAsyncThunk(
  "brands",
  async ({ categoryId }: { categoryId: string }, { rejectWithValue }) => {
    try {
      const response = await API.get(`${productBrands}/${categoryId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProductToStore.pending, (state) => {
      state.productLoading = true;
    });
    builder.addCase(fetchProductToStore.fulfilled, (state, { payload }) => {
      state.product = payload;
      state.productLoading = false;
      state.error = "";
    });
    builder.addCase(fetchProductToStore.rejected, (state, payload) => {
      state.productLoading = false;
      if (payload.error) {
        toast.error(`Failed to get products`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      state.error = payload.error.message || "";
    });

    builder.addCase(productBrandsToStore.pending, (state) => {
      state.brandsLoading = true;
    });
    builder.addCase(productBrandsToStore.fulfilled, (state, { payload }) => {
      state.brands = payload;
      state.brandsLoading = false;
      state.error = "";
    });
    builder.addCase(productBrandsToStore.rejected, (state, payload) => {
      state.brandsLoading = false;
      if (payload.error) {
        toast.error(`Failed to get brands`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      state.error = payload.error.message || "";
    });
  },
});

export default productSlice.reducer;
