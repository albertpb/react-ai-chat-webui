import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { LoadState } from ".";
import { resetHistory } from "./chat";

export const getModelList = createAsyncThunk(
  "model/getModelList",
  async (): Promise<string[]> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_HOST}/model`,
      {
        action: "list",
      }
    );

    return response.data.result;
  }
);

export const getModelInfo = createAsyncThunk(
  "model/getModelInfo",
  async (): Promise<ModelInfo> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_HOST}/model`,
      {
        action: "info",
      }
    );

    return response.data.result;
  }
);

export const loadModel = createAsyncThunk(
  "model/loadModel",
  async (modelName: string, api): Promise<ModelInfo> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_HOST}/model`,
      {
        action: "load",
        model_name: modelName,
        args: {
          gptq_for_llama: false,
          bf16: false,
          load_in_8bit: false,
          groupsize: 0,
          wbits: 0,
          threads: 0,
          n_batch: 512,
          no_mmap: false,
          mlock: false,
          cache_capacity: "None",
          n_gpu_layers: 0,
          n_ctx: 2048,
          rwkv_strategy: "None",
          rwkv_cuda_on: false,
        },
      }
    );

    api.dispatch(resetHistory());

    return response.data.result;
  }
);

export interface ModelState {
  modelSelected: string;
  modelLoading: LoadState;
  modelInfo: ModelInfo | null;
  modelInfoLoading: LoadState;
  list: string[];
  listLoading: LoadState;
  error: string;
}

const initialState: ModelState = {
  modelSelected: "None",
  modelLoading: "idle",
  modelInfo: null,
  modelInfoLoading: "idle",
  list: [],
  listLoading: "idle",
  error: "",
};

interface ModelInfo {
  model_name: string;
  lora_names: string[];
  "shared.settings": {
    dark_theme: boolean;
    autoload_model: boolean;
    max_new_tokens: number;
    max_new_tokens_min: number;
    max_new_tokens_max: number;
    seed: number;
    character: string;
    name1: string;
    context: string;
    greeting: string;
    turn_template: string;
    custom_stopping_strings: string;
    stop_at_newline: boolean;
    add_bos_token: boolean;
    ban_eos_token: boolean;
    skip_special_tokens: boolean;
    truncation_length: number;
    truncation_length_min: number;
    truncation_length_max: number;
    mode: string;
    start_with: string;
    chat_style: string;
    instruction_template: string;
    "chat-instruct_command": string;
    chat_prompt_size: string;
    chat_prompt_size_min: string;
    chat_prompt_size_max: string;
    chat_generation_attempts: number;
    chat_generation_attempts_min: number;
    chat_generation_attempts_max: number;
    default_extensions: string[];
    chat_default_extensions: string[];
    preset: string;
    prompt: string;
    wbits: number;
    model_type: string;
    groupsize: number;
    pre_layer: number;
  };
  "shared.args": {
    notebook: boolean;
    chat: boolean;
    character: string;
    model: string;
    lora: string;
    model_dir: string;
    lora_dir: string;
    model_menu: boolean;
    no_stream: boolean;
    settings: string;
    extensions: string[];
    verbose: boolean;
    loader: string;
    cpu: boolean;
    auto_devices: boolean;
    gpu_memory: string;
    cpu_memory: string;
    disk: boolean;
    disk_cache_dir: string;
    load_in_8bit: boolean;
    bf16: boolean;
    no_cache: boolean;
    xformers: boolean;
    sdp_attention: boolean;
    trust_remote_code: boolean;
    load_in_4bit: boolean;
    compute_dtype: string;
    quant_type: string;
    use_double_quant: boolean;
    threads: number;
    n_batch: number;
    no_mmap: boolean;
    mlock: boolean;
    cache_capacity: string;
    n_gpu_layers: boolean;
    n_ctx: number;
    llama_cpp_seed: number;
    wbits: number;
    model_type: string;
    groupsize: number;
    pre_layer: string;
    checkpoint: string;
    monkey_patch: boolean;
    quant_attn: boolean;
    warmup_autotune: boolean;
    fused_mlp: boolean;
    gptq_for_llama: boolean;
    autogptq: boolean;
    triton: boolean;
    no_inject_fused_attention: boolean;
    no_inject_fused_mlp: boolean;
    no_use_cuda_fp16: boolean;
    desc_act: boolean;
    gpu_split: string;
    flexgen: boolean;
    percent: number[];
    compress_weight: boolean;
    pin_weight: boolean;
    deepspeed: boolean;
    nvme_offload_dir: null;
    local_rank: number;
    rwkv_strategy: string;
    rwkv_cuda_on: boolean;
    listen: boolean;
    listen_host: null;
    listen_port: null;
    share: boolean;
    auto_launch: boolean;
    gradio_auth: null;
    gradio_auth_path: null;
    api: boolean;
    api_blocking_port: number;
    api_streaming_port: number;
    public_api: boolean;
    multimodal_pipeline: string;
  };
}

export const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Load List
    builder.addCase(getModelList.rejected, (state) => {
      state.listLoading = "failed";
      state.error = "Error";
    });
    builder.addCase(getModelList.pending, (state) => {
      state.listLoading = "pending";
      state.error = "";
    });
    builder.addCase(getModelList.fulfilled, (state, payload) => {
      state.list = payload.payload;
      state.listLoading = "succeeded";
      state.error = "";
    });

    // Modal Info
    builder.addCase(getModelInfo.rejected, (state) => {
      state.modelInfoLoading = "failed";
      state.error = "Error";
    });
    builder.addCase(getModelInfo.pending, (state) => {
      state.modelInfoLoading = "pending";
      state.error = "";
    });
    builder.addCase(getModelInfo.fulfilled, (state, payload) => {
      state.modelInfoLoading = "succeeded";
      state.modelInfo = payload.payload;
      state.modelSelected = payload.payload.model_name;
      state.error = "";
    });

    // Load Model
    builder.addCase(loadModel.rejected, (state) => {
      state.modelLoading = "failed";
      state.error = "Error";
    });
    builder.addCase(loadModel.pending, (state) => {
      state.modelLoading = "pending";
      state.error = "";
    });
    builder.addCase(loadModel.fulfilled, (state, payload) => {
      state.modelLoading = "succeeded";
      state.modelSelected = payload.payload.model_name;
      state.error = "";
    });
  },
});
