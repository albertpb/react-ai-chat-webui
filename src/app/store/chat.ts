import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CharactersState } from "./characters";
import { LoadState } from ".";

export const doChat = createAsyncThunk(
  "chat/doChat",
  async (prompt: string, api): Promise<History> => {
    const state = api.getState() as {
      chat: ChatState;
      character: CharactersState;
    };

    const character =
      state.character.character !== "None"
        ? state.character.character.name
        : "None";

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_HOST}/chat`,
      {
        user_input: prompt,
        max_new_tokens: 400,
        history: state.chat.history,
        character,
        instruction_template: "Vicuna-v1.1",
        your_name: "You",
        regenerate: false,
        _continue: false,
        mode: "chat",
        stop_at_newline: false,
        chat_generation_attempts: 1,
        "chat-instruct_command": "",
        preset: "None",
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9,
        typical_p: 1,
        epsilon_cutoff: 0,
        eta_cutoff: 0,
        tfs: 1,
        top_a: 0,
        repetition_penalty: 1.15,
        repetition_penalty_range: 0,
        top_k: 20,
        min_length: 0,
        no_repeat_ngram_size: 0,
        num_beams: 1,
        penalty_alpha: 0,
        length_penalty: 1,
        early_stopping: false,
        mirostat_mode: 0,
        mirostat_tau: 5,
        mirostat_eta: 0.1,
        seed: -1,
        add_bos_token: true,
        truncation_length: 4096,
        ban_eso_token: false,
        skip_special_tokens: true,
        stopping_strings: [],
      }
    );

    return response.data.results[0].history;
  }
);

export interface History {
  internal: Array<[string, string]>;
  visible: Array<[string, string]>;
}

interface ChatState {
  continue: boolean;
  history: History;
  historyLoading: LoadState;
}

const initialState: ChatState = {
  continue: false,
  history: {
    internal: [],
    visible: [],
  },
  historyLoading: "idle",
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetHistory: (state) => {
      state.history = {
        internal: [],
        visible: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(doChat.rejected, (state) => {
      state.historyLoading = "failed";
    });
    builder.addCase(doChat.pending, (state) => {
      state.historyLoading = "pending";
    });
    builder.addCase(doChat.fulfilled, (state, payload) => {
      state.historyLoading = "succeeded";
      state.history = payload.payload;
      state.continue = true;
    });
  },
});

export const { resetHistory } = chatSlice.actions;
