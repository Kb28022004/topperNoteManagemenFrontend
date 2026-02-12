import { combineReducers } from "@reduxjs/toolkit";

import { authApi } from "../features/api/authApi";
import { studentApi } from "../features/api/studentApi";
import { topperApi } from "../features/api/topperApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [studentApi.reducerPath]: studentApi.reducer,
  [topperApi.reducerPath]: topperApi.reducer,
});

export default rootReducer;
