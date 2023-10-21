import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    {...rest}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {chat}
          </Markdown>
        </div>
      );
    }
  });

  return <>{text}</>;
}
