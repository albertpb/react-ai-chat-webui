"use client";

import { useEffect } from "react";
import Navbar from "./components/navbar";
import { useAppDispatch } from "./store/hooks";
import { getModelList, getModelInfo } from "./store/model";
import { getCharacterList } from "./store/characters";

export default function Main({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getModelState = async () => {
      await dispatch(getModelList());
      await Promise.all([
        dispatch(getModelInfo()),
        dispatch(getCharacterList()),
      ]);
    };
    getModelState();
  }, [dispatch]);

  return (
    <>
      <Navbar></Navbar>
      <div className="w-screen flex justify-center">{children}</div>
    </>
  );
}
