"use client";

import { createRef, useRef } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { useAppDispatch } from "./store/hooks";
import { loadCharacter } from "./store/characters";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { ReadyState } from "react-use-websocket";
import ChatExample from "./components/chat_example";
import TextMarkdown from "./components/text_markdown";

export default function Home() {
  const characterState = useSelector((state: RootState) => state.character);
  const modelState = useSelector((state: RootState) => state.model);
  const dispatch = useAppDispatch();
  const [textAreaValue, setTextAreaValue] = useState<string>("");
  const [history, setHistory] = useState<Record<any, any>[]>([]);
  const historyBuffer = useRef<Record<any, any>[]>([]);
  const { readyState, sendJsonMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WSS_HOST}/chat-stream`,
    {
      onMessage: (event) => {
        const data = JSON.parse(event.data);

        if (data.event !== "stream_end") {
          historyBuffer.current = historyBuffer.current.concat(data);
        }

        if (data.event === "stream_end" || historyBuffer.current.length >= 1) {
          setHistory(history.concat(historyBuffer.current));
          historyBuffer.current = [];
          textRef.current?.scrollBy({ top: textRef.current?.scrollHeight });
        }
      },
    }
  );
  const textRef = createRef<HTMLDivElement>();

  const onSelectCharacter = useCallback(
    (characterName: string) => {
      dispatch(loadCharacter(characterName));
    },
    [dispatch]
  );

  useEffect(() => {
    setHistory([]);
    setTextAreaValue("");
  }, [characterState.character, modelState.modelSelected]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleClickSendMessage = useCallback(
    (userInput: string, history: Record<any, any>[]) => {
      if (characterState.character !== "None") {
        let hist = {
          internal: [],
          visible: [],
        };

        if (history.length > 0) {
          hist = {
            internal: history[history.length - 1].history.internal,
            visible: history[history.length - 1].history.visible,
          };
        }

        sendJsonMessage({
          user_input: userInput,
          auto_max_new_tokens: false,
          max_tokens_second: 0,
          max_new_tokens: 250,
          history: hist,
          character: characterState.character.name,
          instruction_template: "Vicuna-v1.1",
          your_name: "You",
          regenerate: false,
          _continue: false,
          mode: "chat-instruct",
          stop_at_newline: false,
          chat_generation_attempts: 1,
          "chat-instruct_command": `Continue the chat dialogue below. Write a single reply for the character "<|character|>".\n\n<|prompt|>`,
          preset: "None",
          do_sample: true,
          temperature: 1,
          top_p: 0.1,
          typical_p: 1,
          epsilon_cutoff: 0,
          eta_cutoff: 0,
          tfs: 1,
          top_a: 0,
          repetition_penalty: 1.18,
          repetition_penalty_range: 0,
          top_k: 30,
          min_length: 20,
          no_repeat_ngram_size: 0,
          num_beams: 1,
          penalty_alpha: 0,
          length_penalty: 1,
          early_stopping: false,
          mirostat_mode: 0,
          mirostat_tau: 5,
          mirostat_eta: 0.1,
          grammar_string: "",
          guidance_scale: 1,
          negative_prompt: "",

          seed: -1,
          add_bos_token: true,
          truncation_length: 2048,
          ban_eos_token: false,
          custom_token_bans: "",
          skip_special_tokens: true,
          stopping_strings: [],
        });
      }
    },
    [sendJsonMessage, characterState.character]
  );

  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      setTextAreaValue("");
    }
  };

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleClickSendMessage(textAreaValue, history);
    }
  };

  const clear = () => {
    setHistory([]);
  };

  const characterDom =
    characterState.character !== "None" ? (
      <div className="my-4">
        <div className="avatar">
          <div>
            <Image
              className="w-24 rounded"
              unoptimized={true}
              src={`data:image/jpeg;base64,${characterState.character.image.data}`}
              width={300}
              height={300}
              alt="Character"
            ></Image>
          </div>
        </div>
        <div className="prose my-4">
          <h4>Context:</h4>
          <p>{characterState.character.context}</p>
        </div>
        <div className="prose my-4">
          <h4>Greeting:</h4>
          <p>{characterState.character.greeting}</p>
        </div>
        <div className="prose my-4">
          <h4>Context:</h4>
          <p>{characterState.character.context}</p>
        </div>
        <div className="prose my-4">
          <h4>Example dialogue:</h4>
          <ChatExample
            chat={characterState.character.example_dialogue}
          ></ChatExample>
        </div>
      </div>
    ) : null;

  const greeting =
    characterState.character !== "None" ? (
      <p>{characterState.character.greeting}</p>
    ) : null;

  const text =
    history[history.length - 1] &&
    history[history.length - 1].event &&
    history[history.length - 1].event === "text_stream"
      ? history[history.length - 1].history.visible.map(
          (arr: string[], indx: number) => {
            if (characterState.character !== "None") {
              return (
                <div key={`chat_${indx}`}>
                  <div className="chat chat-end">
                    <div className="chat-bubble chat-bubble-secondary">
                      <TextMarkdown>{arr[0]}</TextMarkdown>
                    </div>
                  </div>
                  <div className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <Image
                          className="w-24 rounded"
                          unoptimized={true}
                          src={`data:image/jpeg;base64,${characterState.character.image.data}`}
                          width={30}
                          height={30}
                          alt="Character"
                        ></Image>
                      </div>
                    </div>
                    <div className="chat-bubble chat-bubble-primary">
                      <TextMarkdown>{arr[1]}</TextMarkdown>
                    </div>
                  </div>
                </div>
              );
            }
          }
        )
      : "";

  return (
    <div className="w-full mx-5 my-2 flex flex-row">
      <div className="justify-center basis-1/5 rounded bg-base-200 m-4 py-4 px-14 body-height overflow-auto">
        <div>
          <label className="label">
            <span className="label-text">Pick Character</span>
          </label>
          <select
            value={
              characterState.character !== "None"
                ? characterState.character.name
                : characterState.character
            }
            onChange={(e) => onSelectCharacter(e.target.value)}
            className="select select-bordered select-sm w-full max-w-xs"
          >
            <option value="None" disabled>
              Pick a character
            </option>
            {characterState.list.map((character) => (
              <option key={`character_${character}`} value={character}>
                {character}
              </option>
            ))}
          </select>
        </div>
        {characterDom}
      </div>
      <div className="basis-4/5 rounded bg-base-200 m-4 p-4 body-height flex flex-col">
        <div>status: {connectionStatus}</div>
        <div
          ref={textRef}
          className="bg-neutral rounded h-96 mx-1 my-4 p-4 flex-auto overflow-auto"
        >
          {greeting}
          {text}
        </div>
        <textarea
          value={textAreaValue}
          onKeyDown={(e) => onKeyDownHandler(e)}
          onKeyUp={(e) => onKeyUpHandler(e)}
          onChange={(e) => setTextAreaValue(e.target.value)}
          className="w-full h-24 textarea textarea-primary"
        ></textarea>
        <div className="my-4 flex">
          <div className="w-2/6 pr-4">
            <button
              className="btn btn-secondary w-full"
              onClick={() => clear()}
            >
              Clear
            </button>
          </div>
          <button
            className="btn btn-primary w-4/6"
            disabled={
              readyState !== ReadyState.OPEN ||
              modelState.modelSelected === "None" ||
              characterState.character === "None" ||
              modelState.modelLoading === "pending" ||
              modelState.listLoading === "pending" ||
              characterState.characterLoading === "pending" ||
              characterState.listLoading === "pending"
            }
            onClick={() => handleClickSendMessage(textAreaValue, history)}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
