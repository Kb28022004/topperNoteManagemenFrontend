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
  // Cache time: unused data is kept for 5 minutes before being garbage collected
  keepUnusedDataFor: 300,
  // Global refetch policies
  refetchOnMountOrArgChange: 60,  // refetch if data is older than 60 seconds when component mounts
  refetchOnReconnect: true,        // always refetch when user comes back online
  endpoints: () => ({}),
});
