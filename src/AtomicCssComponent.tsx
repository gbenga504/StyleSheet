import React from "react";
import { Stylesheet } from "./utils/Stylesheet";

export const AtomicCssComponent = () => {
  return (
    <h3 className={styles("greenText", "redText")}>
      A development based Css-In-Js Library. Built with Love using atomic css.
      This text will always be red
    </h3>
  );
};

export const stylesheet = new Stylesheet();
const styles = stylesheet.createAtomicCss({
  redText: {
    color: "red"
  },
  greenText: {
    color: "green"
  }
});
