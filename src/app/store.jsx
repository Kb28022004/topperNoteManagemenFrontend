import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "../features/api/authApi";
import { studentApi } from "../features/api/studentApi";
import { topperApi } from "../features/api/topperApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, studentApi.middleware, topperApi.middleware),
});
