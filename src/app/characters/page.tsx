"use client";

import { useState } from "react";

export default function Characters() {
  const [text, setText] = useState("");

  return (
    <div>
      <textarea
        onChange={(e) => setText(e.target.value)}
        value={text}
      ></textarea>
    </div>
  );
}
