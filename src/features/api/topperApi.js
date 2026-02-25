import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
import { API_BASE_URL } from "../../config";

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
const TOPPER_API = `${API_BASE_URL}/toppers`;

export const topperApi = createApi({
  reducerPath: "topperApi",
  baseQuery: fetchBaseQuery({
    baseUrl: TOPPER_API,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['TopperProfile', 'PublicTopper', 'TopperFollowers', 'EarningsSummary', 'PayoutHistory', 'Transactions'],
  
  endpoints: (builder) => ({

    // Step 1: Save Basic Profile
    saveBasicProfile: builder.mutation({
      query: (formData) => ({
        url: "/profile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['TopperProfile'],
    }),

    // Step 2: Submit Verification
    submitVerification: builder.mutation({
      query: (formData) => ({
        url: "/verify",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['TopperProfile'],
    }),

    // Get My Profile
    getProfile: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ['TopperProfile'],
    }),

    // Follow Topper
    followTopper: builder.mutation({
      query: (topperId) => ({
        url: `/${topperId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'PublicTopper', id: arg }],
    }),

    // Get Public Profile
    getPublicProfile: builder.query({
      query: (userId) => ({
        url: `/${userId}/public`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [{ type: 'PublicTopper', id: arg }],
    }),

    // Get All Toppers
    getAllToppers: builder.query({
      query: (params) => ({
        url: "/",
        method: "GET",
        params: {
          search: params?.search || undefined,
          class: params?.class || undefined,
          board: params?.board || undefined,
          stream: params?.stream || undefined,
          sortBy: params?.sortBy || undefined,
          page: params?.page || 1,
          limit: params?.limit || 15,
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, limit, ...rest } = queryArgs || {};
        return { endpointName, ...rest };
      },
      merge: (currentCache, newResponse, { arg }) => {
        if (!arg?.page || arg.page === 1 || !currentCache) return newResponse;
        const existingMap = new Map(currentCache.toppers.map(t => [t.userId?.toString(), t]));
        newResponse.toppers.forEach(t => existingMap.set(t.userId?.toString(), t));
        return { ...newResponse, toppers: Array.from(existingMap.values()) };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      transformResponse: (response) => ({
        toppers: response.data?.toppers || [],
        pagination: response.data?.pagination || {}
      }),
      providesTags: ['PublicTopper'],
    }),

    // Get Followers
    getTopperFollowers: builder.query({
      query: ({ userId, params }) => ({
        url: `/${userId}/followers`,
        method: "GET",
        params: {
          search: params?.search,
          class: params?.class,
          page: params?.page || 1,
          limit: params?.limit || 20,
          sortBy: params?.sortBy,
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { userId }) => [{ type: 'TopperFollowers', id: userId }],
    }),
    
    // Earnings & Payouts
    getEarningsSummary: builder.query({
      query: () => ({
        url: `${API_BASE_URL}/earnings/summary`,
        method: "GET",
      }),
      providesTags: ['EarningsSummary'],
    }),

    getTransactions: builder.query({
      query: (params) => ({
        url: `${API_BASE_URL}/earnings/transactions`,
        method: "GET",
        params,
      }),
      providesTags: ['Transactions'],
    }),

    getPayoutHistory: builder.query({
      query: (params) => ({
        url: `${API_BASE_URL}/earnings/payouts`,
        method: "GET",
        params,
      }),
      providesTags: ['PayoutHistory'],
    }),

    requestPayout: builder.mutation({
      query: (data) => ({
        url: `${API_BASE_URL}/earnings/payout-request`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['EarningsSummary', 'PayoutHistory'],
    }),

    updatePayoutSettings: builder.mutation({
      query: (data) => ({
        url: `${API_BASE_URL}/earnings/payout-settings`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['TopperProfile'],
    }),
    updateProfilePicture: builder.mutation({
      query: (formData) => ({
        url: "/profile-picture",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ['TopperProfile'],
    }),

  }),
});

export const {
  useSaveBasicProfileMutation,
  useSubmitVerificationMutation,
  useGetProfileQuery,
  useFollowTopperMutation,
  useGetPublicProfileQuery,
  useGetAllToppersQuery,
  useGetTopperFollowersQuery,
  useUpdateProfilePictureMutation,
  useGetEarningsSummaryQuery,
  useGetTransactionsQuery,
  useGetPayoutHistoryQuery,
  useRequestPayoutMutation,
  useUpdatePayoutSettingsMutation,
} = topperApi;
