"use client";

import { createRef, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { ReadyState } from "react-use-websocket";
import TextMarkdown from "../components/text_markdown";

export default function Prompt() {
  const characterState = useSelector((state: RootState) => state.character);
  const modelState = useSelector((state: RootState) => state.model);
  const [responseText, setResponseText] = useState<string>("");
  const buffer = useRef<string>("");
  const [textAreaValue, setTextAreaValue] = useState<string>("");
  const { readyState, sendJsonMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WSS_HOST}/stream`,
    {
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        if (data.event !== "stream_end") {
          buffer.current = buffer.current + data.text;
        }

        if (data.event === "stream_end" || buffer.current.length >= 1) {
          setResponseText(responseText + buffer.current);
          buffer.current = "";
          textRef.current?.scrollBy({ top: textRef.current?.scrollHeight });
        }
      },
    }
  );
  const textRef = createRef<HTMLDivElement>();

  useEffect(() => {
    setTextAreaValue("");
  }, [modelState.modelSelected]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleClickSendMessage = (prompt: string) => {
    setResponseText(prompt);

    sendJsonMessage({
      prompt: prompt,
      max_new_tokens: 200,
      preset: "Simple-1",
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
      min_length: 20,
      num_beams: 1,
      penalty_alpha: 0,
      length_penalty: 0,
      early_stopping: false,
      mirostat_mode: 0,
      mirostat_tau: 5,
      mirostat_eta: 0.1,
      grammar_string: "",
      guidance_scale: 1,
      negative_prompt: "",
      seed: -1,
      add_bos_token: true,
      truncation_length: 4096,
      ban_eos_token: false,
      custom_token_bans: "",
      skip_special_tokens: true,
      stopping_strings: [],
    });
  };

  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      setTextAreaValue("");
    }
  };

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleClickSendMessage(textAreaValue);
    }
  };

  const text = (
    <div>{responseText && <TextMarkdown>{responseText}</TextMarkdown>}</div>
  );

  return (
    <div className="w-full mx-5 my-2 flex flex-row">
      <div className="w-full rounded bg-base-200 m-4 p-4 body-height flex flex-col">
        <div>status: {connectionStatus}</div>
        <div
          ref={textRef}
          className="bg-neutral rounded h-96 mx-1 my-4 p-4 flex-auto overflow-auto"
        >
          {text}
        </div>
        <textarea
          value={textAreaValue}
          onKeyUp={(e) => onKeyUpHandler(e)}
          onKeyDown={(e) => onKeyDownHandler(e)}
          onChange={(e) => setTextAreaValue(e.target.value)}
          className="w-full h-24 textarea textarea-primary whitespace-pre-line"
        ></textarea>
        <div className="my-4 flex">
          <button
            className="btn btn-primary w-full"
            disabled={
              readyState !== ReadyState.OPEN ||
              modelState.modelSelected === "None" ||
              modelState.modelLoading === "pending" ||
              modelState.listLoading === "pending" ||
              characterState.listLoading === "pending"
            }
            onClick={() => handleClickSendMessage(textAreaValue)}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
