import React from "react";
import { Stylesheet } from "./utils/Stylesheet";

export const Component = () => {
  return (
    <h3 className={`${styles.greenText} ${styles.redText}`}>
      A development based Css-In-Js Library. This text will always be green even
      if the redText comes last because it respect the classname position in the
      CSS DOM
    </h3>
  );
};

export const stylesheet = new Stylesheet();
const styles = stylesheet.create({
  redText: {
    color: "red"
  },
  greenText: {
    color: "green"
  }
});
