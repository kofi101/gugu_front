import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./features/userSliceFeature";
import productFeature from "./features/productFeature";
import cartFeature from "./features/cartFeature";
import wishListFeature from "./features/wishListFeature";

export const reducers = combineReducers({
  user: userReducer,
  product: productFeature,
  cart: cartFeature,
  wishList: wishListFeature,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
