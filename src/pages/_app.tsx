import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            fontFamily: "Poppins, sans-serif",
            borderRadius: "8px",
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
