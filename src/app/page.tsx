"use client";

import { createRef } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { useAppDispatch } from "./store/hooks";
import { loadCharacter } from "./store/characters";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { ReadyState } from "react-use-websocket";

export default function Home() {
  const characterState = useSelector((state: RootState) => state.character);
  const modelState = useSelector((state: RootState) => state.model);
  const chatState = useSelector((state: RootState) => state.chat);
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<Record<any, any>[]>([]);
  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WSS_HOST}`
  );
  const textRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.event !== "stream_end") {
        setHistory((prev) => prev.concat(data));
        textRef.current?.scrollBy({ top: textRef.current?.scrollHeight });
      }
    }
  }, [lastMessage, setHistory, textRef]);

  const onSelectCharacter = useCallback(
    (characterName: string) => {
      dispatch(loadCharacter(characterName));
    },
    [dispatch]
  );

  useEffect(() => {
    setHistory([]);
    setInput("");
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
          max_new_tokens: 250,
          history: hist,
          character: characterState.character.name,
          instruction_template: "Vicuna-v1.1",
          your_name: "You",
          regenerate: false,
          _continue: false,
          mode: "chat",
          stop_at_newline: false,
          chat_generation_attempts: 1,
          "chat-instruct_command": ``,
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
          truncation_length: 2048,
          ban_eso_token: false,
          skip_special_tokens: true,
          stopping_strings: [],
        });
      }

      setInput("");
    },
    [sendJsonMessage, characterState.character]
  );

  const onInputEnterHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleClickSendMessage(input, history);
    }
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
          <p>{characterState.character.example_dialogue}</p>
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
                      {arr[0]}
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
                      {arr[1]}
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
            {characterState.list.map((character) => (
              <option key={`character_${character}`}>{character}</option>
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
          value={input}
          onKeyUp={onInputEnterHandler}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-24 textarea textarea-primary"
        ></textarea>
        <div className="my-4">
          <button
            className="btn btn-primary w-full"
            disabled={
              readyState !== ReadyState.OPEN ||
              modelState.modelSelected === "None" ||
              characterState.character === "None" ||
              modelState.modelLoading === "pending" ||
              modelState.listLoading === "pending" ||
              characterState.characterLoading === "pending" ||
              characterState.listLoading === "pending"
            }
            onClick={() => handleClickSendMessage(input, history)}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
