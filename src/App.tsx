import * as React from "react";
import "./styles.css";
import Stylesheet from "./utils/Stylesheet";

const stylesheet = new Stylesheet();

export default function App() {
  return (
    <div className={styles.container}>
      <span className={`${styles.blueText} ${styles.redText}`}>
        A development based Css-In-Js Library
      </span>
    </div>
  );
}

const styles = stylesheet.create({
  container: {
    background: "black",
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  redText: {
    color: "red"
  },
  blueText: {
    color: "green"
  }
}) as any;
