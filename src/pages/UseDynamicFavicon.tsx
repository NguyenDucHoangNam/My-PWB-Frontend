import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import LogoComponent from "../component/logo/LogoComponent";

export const useDynamicFavicon = () => {
  useEffect(() => {
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.top = "-9999px";
    document.body.appendChild(temp);

    const root = createRoot(temp);
    root.render(<LogoComponent />);

    const interval = setInterval(() => {
      html2canvas(temp).then((canvas: HTMLCanvasElement) => {
        const dataUrl = canvas.toDataURL("image/png");
        const link =
          (document.querySelector(
            "link[rel~='icon']"
          ) as HTMLLinkElement | null) || document.createElement("link");

        link.rel = "icon";
        link.href = dataUrl;
        document.head.appendChild(link);
      });
    }, 1000); // update mỗi 1 giây

    return () => {
      clearInterval(interval);
      root.unmount();
      temp.remove();
    };
  }, []);
};
