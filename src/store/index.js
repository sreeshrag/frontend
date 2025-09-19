import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import companySlice from './slices/companySlice';
import superAdminSlice from './slices/superAdminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    company: companySlice,
    superAdmin: superAdminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

window.__REDUX_STORE__ = store;

export default store;
// Remove these TypeScript lines:
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
