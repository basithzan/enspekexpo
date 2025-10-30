import { configureStore, combineReducers } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import thunk from "redux-thunk";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

store.subscribe(() => {
  const updatedState = store.getState();
  const persist = {
    inspector: updatedState.inspector,
    client: updatedState.client,
  };
  if (window.ReactNativeWebView) {
    const response = {
      type: 'state',
      data: persist,
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(response));
  }
});

export const persistor = persistStore(store);
