import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
const ADMIN_API = `http://192.168.21.32:8000/api/v1/admin`;

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  
  endpoints: (builder) => ({

    // Step 1: Create Profile
    createProfile: builder.mutation({
      query: (formData) => ({
        url: "/profile",
        method: "POST",
        body: formData,
      }),
    }),

  }),
});

export const {
  useCreateProfileMutation
} = adminApi;
