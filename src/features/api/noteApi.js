import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use host IP for Android Emulator
import { API_BASE_URL } from "../../config";

// Use host IP for Android Emulator
const NOTE_API = `${API_BASE_URL}/notes`;

export const noteApi = createApi({
  reducerPath: "noteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
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
        url: "/notes",
        params: {
            ...params,
            page: params?.page || 1,
            limit: params?.limit || 10
        },
      }),
      // Unified cache key across pages for the same subject/search
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, limit, ...rest } = queryArgs || {};
        return { endpointName, ...rest };
      },
      // Deduplicate when merging new pages
      merge: (currentCache, newResponse, { arg }) => {
        if (arg?.page === 1 || !currentCache) {
          return newResponse;
        }
        
        // Use Map to ensure unique notes by _id
        const existingNotes = new Map(currentCache.notes.map(n => [n._id || n.id, n]));
        newResponse.notes.forEach(n => {
          existingNotes.set(n._id || n.id, n);
        });

        return {
          ...newResponse,
          notes: Array.from(existingNotes.values())
        };
      },
      // Refetch when any param (including page) changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      transformResponse: (response) => ({
        notes: response.data || [],
        pagination: response.pagination || {}
      }),
      providesTags: (result) =>
        result?.notes
          ? [
              ...result.notes.map(({ _id }) => ({ type: "Notes", id: _id })),
              { type: "Notes", id: "LIST" },
            ]
          : [{ type: "Notes", id: "LIST" }],
    }),
    getNoteDetails: builder.query({
      query: (noteId) => `/notes/${noteId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: "Notes", id }],
    }),
    uploadNote: builder.mutation({
      query: (formData) => ({
        url: "/notes",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Notes"],
    }),
    getMyNotes: builder.query({
      query: () => "/notes/me",
      transformResponse: (response) => response.data,
      providesTags: ["Notes"],
    }),
    getPurchasedNotes: builder.query({
      query: (params) => ({
        url: "/notes/purchased/me",
        params: {
          search: params?.search,
          page: params?.page || 1,
          limit: params?.limit || 10
        }
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Notes"],
    }),
    addReview: builder.mutation({
      query: ({ noteId, review }) => ({
        url: `/reviews/${noteId}`,
        method: "POST",
        body: review,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: "Notes", id: noteId },
        { type: "Notes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteDetailsQuery,
  useUploadNoteMutation,
  useGetMyNotesQuery,
  useGetPurchasedNotesQuery,
  useAddReviewMutation
} = noteApi;
