import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
import { API_BASE_URL } from "../../config";

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
const STUDENT_API = `${API_BASE_URL}/students`;

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
  tagTypes: ["StudentProfile"],
  endpoints: (builder) => ({

    // Create Profile
    createProfile: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    getProfile: builder.query({
      query: () => "/profile",
      transformResponse: (response) => response.data,
      providesTags: ["StudentProfile"],
    }),
  }),
});

export const {
  useCreateProfileMutation,
  useGetProfileQuery,
} = studentApi ;
