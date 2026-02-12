import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
const STUDENT_API = `http://192.168.21.32:8000/api/v1/students`;

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: STUDENT_API,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  

  endpoints: (builder) => ({

    // Create Profile
    createProfile: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useCreateProfileMutation,
} = studentApi ;
