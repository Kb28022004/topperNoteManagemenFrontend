import { combineReducers } from "@reduxjs/toolkit";

import { authApi } from "../features/api/authApi";
import { studentApi } from "../features/api/studentApi";
import { topperApi } from "../features/api/topperApi";
import { adminApi } from "../features/api/adminApi";
import { noteApi } from "../features/api/noteApi";
import { paymentApi } from "../features/api/paymentApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [studentApi.reducerPath]: studentApi.reducer,
  [topperApi.reducerPath]: topperApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [noteApi.reducerPath]: noteApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
});

export default rootReducer;
