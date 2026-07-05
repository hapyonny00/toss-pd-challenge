import { createRoot } from "react-dom/client";
import { TDSMobileProvider, useUserAgent } from "@toss/tds-mobile";
import App from "./App";
import "./shell.css";

/** 웹 브라우저 컨텍스트: useUserAgent()가 navigator 기반으로 값을 채워준다. */
function Root() {
  const userAgent = useUserAgent();
  return (
    <TDSMobileProvider userAgent={userAgent}>
      <App />
    </TDSMobileProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
