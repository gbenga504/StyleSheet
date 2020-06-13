import { UNITLESS_CSS_KEYS } from "./UnitlessCssKeys";

interface IProps {
  rootFontSize?: number;
}

export default class Stylesheet {
  private styles: string = ``;
  private rootFontSize: number = 16;

  constructor(props?: IProps) {
    if (props && props.rootFontSize) {
      if (typeof props.rootFontSize === "number")
        this.rootFontSize = props.rootFontSize;
      else throw new Error("rootFontSize must be a primitive of type number");
    }
  }

  /**
   * @returns string
   * @param str {string}
   * This funcion generates a hash of the css classname
   */
  private generateClassNameHash(str: string) {
    let value = 5381;
    let len = str.length + this.styles.length;
    while (len--) value = (value * 33) ^ str.charCodeAt(len);
    return (value >>> 0).toString(36);
  }

  /**
   * @return string
   * @param name {string}
   * This function returns a valid css property e.g fontSize = font-size
   */
  private getValidCssProperty(name: string) {
    if (/[A-Z]/g.test(name) === false) return name;
    return name.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`);
  }

  /**
   * @return string
   * @param value {number}
   * This function converts font-sizes to rems
   */
  private convertFontSizeToRem(value: number): string {
    return `${value / this.rootFontSize}rem`;
  }

  /**
   * @return string
   * @param param
   * This function converts a Js Object to a valid css string
   */
  private convertToCss(param: any): string {
    let keys = Object.keys(param);
    let stringHash = "";

    for (let key of keys) {
      let property = this.getValidCssProperty(key);
      let value = param[key];
      let suffix =
        value &&
        typeof value === "number" &&
        property !== "font-size" &&
        !UNITLESS_CSS_KEYS[value]
          ? "px"
          : "";
      value =
        property === "font-size" && value && typeof value === "number"
          ? this.convertFontSizeToRem(value)
          : value;
      stringHash += `${property}:${value}${suffix};`;
    }
    return stringHash;
  }

  /**
   * @return string
   * @param classname {string}
   * @param value {string}
   * This function sets the style based on key : value pair
   */
  private setStyle(classname: string, value: string) {
    this.styles += `.${classname}{${value}}`;
  }

  /**
   * This function inject the style to the head of the document
   */
  private injectStyle() {
    let style: any = document.createElement("style");
    if (!!style.sheet === true) {
      let index = style.sheet.cssRules.length;
      style.sheet.insertRule(this.styles, index);
    } else {
      style.textContent = this.styles;
    }
    document.head.appendChild(style);
    console.log(this.styles);
  }

  /**
   * This function acts as a getter for the styles property
   */
  public getStyle(): string {
    return this.styles;
  }

  /**
   * @return {Object}
   * @param styles
   * This function is the entry point.
   * It returns an object. The key which corresponds to the user defined classname
   * and value which corresponds to the classname hash generated and used for our css
   */
  public create(styles: any) {
    let keys: string[] = Object.keys(styles);
    let classNames: { [key: string]: string } = {};

    for (let key of keys) {
      let cssValue: string = this.convertToCss(styles[key]);
      let classnameHash = `s${this.generateClassNameHash(cssValue)}`;
      classNames[key] = classnameHash;
      this.setStyle(classnameHash, cssValue);
    }

    this.injectStyle();
    return classNames;
  }
}
