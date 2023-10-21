"use client";

import Image from "next/image";
import React, { createRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { useAppDispatch } from "./store/hooks";
import { loadCharacter } from "./store/characters";
import { useCallback, useEffect, useState } from "react";
import { doChat, resetHistory } from "./store/chat";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ChatExample from "./components/chat_example";

export default function Home() {
  const characterState = useSelector((state: RootState) => state.character);
  const modelState = useSelector((state: RootState) => state.model);
  const chatState = useSelector((state: RootState) => state.chat);
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>("");

  const textRef = createRef<HTMLDivElement>();

  const onSelectCharacter = useCallback(
    (characterName: string) => {
      dispatch(loadCharacter(characterName));
    },
    [dispatch]
  );

  useEffect(() => {
    setInput("");
  }, [characterState.character, modelState.modelSelected]);

  const handleClickSendMessage = async () => {
    setInput("");
    await dispatch(doChat(input));
  };

  useEffect(() => {
    textRef.current?.scrollBy({ top: textRef.current?.scrollHeight });
  }, [textRef, chatState.history, chatState.historyLoading]);

  const onInputEnterHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleClickSendMessage();
    }
  };

  const clearChat = () => {
    dispatch(resetHistory());
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

  const text = chatState.history.visible.map((arr: string[], indx: number) => {
    if (characterState.character !== "None") {
      return (
        <div key={`chat_${indx}`}>
          <div className="chat chat-end">
            <div className="chat-bubble chat-bubble-secondary">{arr[0]}</div>
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {arr[1]}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }
  });

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
        <div
          ref={textRef}
          className="bg-neutral rounded h-96 mx-1 my-4 p-4 flex-auto overflow-auto"
        >
          {greeting}
          {text}
          {chatState.historyLoading === "pending" ? (
            <span className="mt-4 loading loading-dots loading-md"></span>
          ) : null}
        </div>
        <textarea
          value={input}
          onKeyUp={onInputEnterHandler}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-24 textarea textarea-primary"
        ></textarea>
        <div className="my-4 flex flex-row">
          <div className="w-2/12">
            <button
              className="btn btn-secondary w-full"
              onClick={() => clearChat()}
            >
              Clear
            </button>
          </div>
          <div className="w-10/12 pl-4">
            <button
              className="btn btn-primary w-full"
              disabled={
                chatState.historyLoading === "pending" ||
                modelState.modelSelected === "None" ||
                characterState.character === "None" ||
                modelState.modelLoading === "pending" ||
                modelState.listLoading === "pending" ||
                characterState.characterLoading === "pending" ||
                characterState.listLoading === "pending"
              }
              onClick={() => handleClickSendMessage()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
