import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
const TOPPER_API = `http://192.168.21.32:8000/api/v1/toppers`;

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
  
  endpoints: (builder) => ({

    // Step 1: Save Basic Profile
    saveBasicProfile: builder.mutation({
      query: (formData) => ({
        url: "/profile",
        method: "POST",
        body: formData,
      }),
    }),

    // Step 2: Submit Verification
    submitVerification: builder.mutation({
        query: (formData) => ({
          url: "/verify",
          method: "POST",
          body: formData,
        }),
      }),

  }),
});

export const {
  useSaveBasicProfileMutation,
  useSubmitVerificationMutation
} = topperApi;
