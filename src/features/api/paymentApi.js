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
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, limit, ...rest } = queryArgs || {};
        return { endpointName, ...rest };
      },
      merge: (currentCache, newResponse, { arg }) => {
        if (!arg?.page || arg.page === 1 || !currentCache) return newResponse;
        const existingMap = new Map(
          currentCache.transactions.map(t => [t.id || t._id, t])
        );
        newResponse.transactions.forEach(t => existingMap.set(t.id || t._id, t));
        return { ...newResponse, transactions: Array.from(existingMap.values()) };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      transformResponse: (response) => ({
        transactions: response.data?.transactions || [],
        pagination: response.data?.pagination || {}
      }),
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetTransactionHistoryQuery
} = paymentApi;
