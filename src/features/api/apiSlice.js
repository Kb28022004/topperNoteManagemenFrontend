import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api", 
  baseQuery: fetchBaseQuery({
    baseUrl: "http://192.168.22.205:9999",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token; 
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({}), 
});
