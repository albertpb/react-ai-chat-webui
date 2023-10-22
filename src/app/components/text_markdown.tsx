import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import he from "he";

export default function TextMarkdown({
  children,
}: {
  children: React.ReactNode;
}) {
  const text = typeof children === "string" ? he.decode(children) : "";

  return (
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
              {text}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {text}
            </code>
          );
        },
      }}
    >
      {text}
    </Markdown>
  );
}
