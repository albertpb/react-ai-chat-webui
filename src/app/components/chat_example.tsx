import Image from "next/image";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatExampleProps {
  chat: string;
}

export default function ChatExample({ chat }: ChatExampleProps) {
  const chats = chat.split("\n");
  const text = chats.map((chat, idx) => {
    if (chat.startsWith("{{user}}")) {
      return (
        <div key={`chat_example_${idx}`} className="text-sm">
          {chat}
        </div>
      );
    }
    if (chat.startsWith("{{char}}")) {
      return (
        <div key={`chat_example_${idx}`} className="text-sm">
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
            {chat}
          </ReactMarkdown>
        </div>
      );
    }
  });

  return <>{text}</>;
}
