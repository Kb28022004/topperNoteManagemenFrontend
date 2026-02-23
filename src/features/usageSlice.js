import { createSlice } from '@reduxjs/toolkit';

const usageSlice = createSlice({
  name: 'usage',
  initialState: {
    sessionSeconds: 0,
    startTime: Date.now(),
  },
  reducers: {
    updateSessionSeconds: (state) => {
      state.sessionSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    },
    resetSession: (state) => {
      state.startTime = Date.now();
      state.sessionSeconds = 0;
    },
  },
});

export const { updateSessionSeconds, resetSession } = usageSlice.actions;
export default usageSlice.reducer;
