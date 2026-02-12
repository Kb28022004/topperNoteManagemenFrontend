import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// Use 10.0.2.2 for Android Emulator to access host machine
const AUTH_API = `http://192.168.21.32:8000/api/v1/auth`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_API,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: ({phone,role}) => ({
        url: "/send-otp",
        method: "POST",
        body: {phone,role},
      }),
    }),

    // Login user
    verifyOtp: builder.mutation({
      query: ({phone,otp}) => ({
        url: "/verify-otp",
        method: "POST",
        body: {phone,otp},
      }),
    }),

    // Update Profile
    updateProfile: builder.mutation({
      query: ({userId,data}) => ({
        url: "/update-profile",
        method: "PUT",
        body: {userId,data},
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useUpdateProfileMutation,
} = authApi;
