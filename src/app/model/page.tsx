"use client";

import { useSelector } from "react-redux";
import { RootState } from "../store";

export default function Characters() {
  const modelState = useSelector((state: RootState) => state.model);

  return (
    <div className="w-full mx-5 my-2 flex flex-row">
      <div className="justify-center basis-1/5 rounded bg-base-200 m-4 py-4 px-14 body-height overflow-auto">
        <h3>{modelState.modelInfo?.model_name}</h3>
        <p>
          <span>dark_theme</span>{" "}
          {modelState.modelInfo?.["shared.settings"].dark_theme
            ? "True"
            : "False"}
        </p>
      </div>
      <div className="basis-4/5 rounded bg-base-200 m-4 p-4 body-height flex flex-col"></div>
    </div>
  );
}
