import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { LoadState } from ".";
import { resetHistory } from "./chat";

export const getCharacterList = createAsyncThunk(
  "characters/getList",
  async (): Promise<string[]> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_HOST}/characters`
    );

    return response.data.results;
  }
);

export const loadCharacter = createAsyncThunk(
  "character/loadCharacter",
  async (name: string, api): Promise<Character> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_HOST}/characters`,
      {
        params: {
          name,
        },
      }
    );

    api.dispatch(resetHistory());

    return {
      ...response.data.results.data,
      image: response.data.results.picture,
    };
  }
);

export interface Character {
  name: string;
  context: string;
  greeting: string;
  example_dialogue: string;
  image: {
    filename: string;
    encoding: string;
    data: string;
  };
}

export interface CharactersState {
  list: string[];
  listLoading: LoadState;
  character: Character | "None";
  characterLoading: LoadState;
  error: string;
}

const initialState: CharactersState = {
  list: [],
  listLoading: "idle",
  character: "None",
  characterLoading: "idle",
  error: "",
};

export const characterSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCharacterList.rejected, (state) => {
      state.listLoading = "failed";
      state.error = "Error";
    });
    builder.addCase(getCharacterList.pending, (state) => {
      state.listLoading = "pending";
      state.error = "";
    });
    builder.addCase(getCharacterList.fulfilled, (state, payload) => {
      state.listLoading = "succeeded";
      state.error = "";
      state.list = payload.payload;
    });

    builder.addCase(loadCharacter.rejected, (state) => {
      state.characterLoading = "failed";
      state.error = "Error";
    });
    builder.addCase(loadCharacter.pending, (state) => {
      state.characterLoading = "pending";
      state.error = "";
    });
    builder.addCase(loadCharacter.fulfilled, (state, payload) => {
      state.character = payload.payload;
      state.characterLoading = "succeeded";
      state.error = "";
    });
  },
});
