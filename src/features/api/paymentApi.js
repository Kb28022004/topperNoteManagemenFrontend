import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../../config";

const PAYMENT_API = `${API_BASE_URL}/payments`;

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PAYMENT_API,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (noteId) => ({
        url: "/orders",
        method: "POST",
        body: { noteId },
      }),
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Orders"],
    }),
    getTransactionHistory: builder.query({
      query: (params) => ({
        url: "/history",
        params
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetTransactionHistoryQuery
} = paymentApi;
