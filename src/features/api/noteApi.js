import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use host IP for Android Emulator
const NOTE_API = `http://192.168.21.32:8000/api/v1/notes`;

export const noteApi = createApi({
  reducerPath: "noteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: NOTE_API,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notes"],
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: (params) => ({
        url: "/",
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Notes"],
    }),
    getNoteDetails: builder.query({
      query: (noteId) => `/${noteId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: "Notes", id }],
    }),
    uploadNote: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Notes"],
    }),
    getMyNotes: builder.query({
      query: () => "/me",
      transformResponse: (response) => response.data,
      providesTags: ["Notes"],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteDetailsQuery,
  useUploadNoteMutation,
  useGetMyNotesQuery,
} = noteApi;
