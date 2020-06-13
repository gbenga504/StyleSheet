import * as React from "react";
import "./styles.css";
import Stylesheet from "./utils/Stylesheet";

const stylesheet = new Stylesheet();

export default function App() {
  const [isError, setIsError] = React.useState(false);

  return (
    <div>
      <span className={styles("greenText", isError === true && "redText")}>
        A development based Css-In-Js Library
      </span>
      <button onClick={() => setIsError(prevState => !prevState)}>
        Switch mode
      </button>
    </div>
  );
}

const styles = stylesheet.createAtomicCss({
  redText: {
    color: "red"
  },
  greenText: {
    color: "green",
    marginLeft: 100
  }
}) as any;

function injectStyle() {
  let style: any = document.createElement("style");
  style.textContent = stylesheet.getStyle();
  document.head.appendChild(style);
  console.log(stylesheet.getStyle());
}
injectStyle();
