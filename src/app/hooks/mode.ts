import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const modes = ["Chat", "Characters"] as const;
export type Mode = (typeof modes)[number];

export default function useMode() {
  const [mode, setMode] = useState<Mode>("Chat");

  const pathName = usePathname();

  useEffect(() => {
    if (pathName.includes("chat") || pathName === "/") {
      setMode("Chat");
    }
    if (pathName.includes("characters")) {
      setMode("Characters");
    }
  }, [pathName]);

  return mode;
}
