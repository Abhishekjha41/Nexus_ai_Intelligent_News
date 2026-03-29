import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

setBaseUrl("https://nexus-ai-intelligent-news-api-serve.vercel.app");
createRoot(document.getElementById("root")!).render(<App />);
