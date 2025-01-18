import React from "react";
import ReactDOM from "react-dom/client";
import store from "./store/store";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

const persistor = persistStore(store);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}></PersistGate>
      <App />
    </Provider>
  </React.StrictMode>
);
