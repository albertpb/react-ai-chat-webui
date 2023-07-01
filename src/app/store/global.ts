import { createSlice } from "@reduxjs/toolkit";

interface GlobalState {}

const initialState: GlobalState = {};

export const globalSlice = createSlice({
  name: "Global",
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});
