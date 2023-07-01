import "./globals.scss";
import { Montserrat } from "next/font/google";
import { ReduxProvider } from "./store/provider";
import Main from "./main";

const inter = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Chat UI",
  description: "Oobabooga web ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="coffee" className="bg-base-100">
      <body className={inter.className}>
        <ReduxProvider>
          <Main>{children}</Main>
        </ReduxProvider>
      </body>
    </html>
  );
}
