import { configureStore } from '@reduxjs/toolkit';
import masterDataReducer from './masterDataSlice.ts';

export const store = configureStore({
  reducer: {
    masterData: masterDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
