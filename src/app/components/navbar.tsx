"use client";

import { useCallback } from "react";
import classnames from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useAppDispatch } from "../store/hooks";
import { loadModel } from "../store/model";
import { useRouter } from "next/navigation";
import useMode, { Mode, modes } from "../hooks/mode";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const modelState = useSelector((state: RootState) => state.model);
  const mode = useMode();
  const router = useRouter();

  const onModeChange = useCallback(
    (mode: Mode) => {
      if (mode === "Chat") {
        router.push("/");
      } else {
        router.push(mode.toLowerCase());
      }
    },
    [router]
  );

  return (
    <div className="navbar bg-base-200">
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
      <div className="">
        <a className="normal-case text-xl">ChatUI</a>
      </div>
      <div className="mx-4">
        <select
          value={modelState.modelSelected}
          className="select select-bordered select-sm w-full max-w-xs"
          onChange={(e) => dispatch(loadModel(e.target.value))}
        >
          {modelState.list.map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>
        {modelState.listLoading === "pending" ||
        modelState.modelLoading === "pending" ? (
          <span className="loading loading-spinner loading-md m-4"></span>
        ) : null}
      </div>
      <div className="tabs tabs-boxed m-2">
        {modes.map((m) => (
          <a
            key={m}
            className={classnames("tab", {
              "tab-active": mode === m,
            })}
            onClick={() => onModeChange(m)}
          >
            {m}
          </a>
        ))}
      </div>
    </div>
  );
}
