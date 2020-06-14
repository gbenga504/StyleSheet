import * as React from "react";
import { Component, stylesheet as nonAtomicStylesheet } from "./Component";
import {
  AtomicCssComponent,
  stylesheet as atomicStylesheet
} from "./AtomicCssComponent";
import "./styles.css";

export default function App() {
  const [showAtomicComponent, setShowAtomicComponent] = React.useState(false);

  React.useEffect(() => {
    let style: any = document.createElement("style");
    style.textContent = showAtomicComponent
      ? atomicStylesheet.getStyle()
      : nonAtomicStylesheet.getStyle();
    document.head.appendChild(style);
  }, [showAtomicComponent]);

  return (
    <>
      {showAtomicComponent ? <AtomicCssComponent /> : <Component />}
      <button onClick={() => setShowAtomicComponent(prevState => !prevState)}>
        Switch
      </button>
    </>
  );
}
