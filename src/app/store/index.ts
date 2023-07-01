import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { modelSlice } from "./model";
import { globalSlice } from "./global";
import { characterSlice } from "./characters";
import { chatSlice } from "./chat";

export const store = configureStore({
  reducer: {
    global: globalSlice.reducer,
    model: modelSlice.reducer,
    character: characterSlice.reducer,
    chat: chatSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type LoadState = "idle" | "pending" | "succeeded" | "failed";
