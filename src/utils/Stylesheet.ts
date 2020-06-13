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
  private generateClassNameHash(str: string, forceUniqueness?: boolean) {
    let value = 5381;
    let len =
      str.length + (!!forceUniqueness === true ? 0 : this.styles.length);
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

  private generateAtomicCss(style: any): any {
    let cssProperties = Object.keys(style);
    let atomicClassnameArray: string[] = [];
    let atomicClassNameMappings: { [key: string]: string } = {};

    for (let key of cssProperties) {
      let property = this.getValidCssProperty(key);
      let value = style[key];
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

      let cssValue = `${property}:${value}${suffix};`;
      let atomicClassnameHash = `s${this.generateClassNameHash(
        cssValue,
        true
      )}`;
      //@todo here we want to not push the classname hash
      //if it exist in the array. Its a means of de-duplication
      atomicClassnameArray.push(atomicClassnameHash);
      atomicClassNameMappings[atomicClassnameHash] = key;
      this.setStyle(atomicClassnameHash, cssValue);
    }
    return { atomicClassnameArray, atomicClassNameMappings };
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
   * This function acts as a getter for the styles property
   */
  public getStyle(): string {
    return this.styles;
  }

  private getAtomicClassNames(
    dictionary: { [key: string]: string[] },
    atomicMappings: any
  ) {
    return function() {
      let atomicClassNames = {} as any;
      for (let i = 0; i < arguments.length; i++) {
        let value = arguments[i];
        if (
          value &&
          typeof value === "string" &&
          !!dictionary[value] === true
        ) {
          for (let className of dictionary[value]) {
            atomicClassNames[atomicMappings[className]] = className;
          }
        }
      }
      //@todo
      //Object.values not available as a property of Object so we use the long approach
      return Object.keys(atomicClassNames)
        .map(k => atomicClassNames[k])
        .join(" ");
    };
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
    return classNames;
  }

  public createAtomicCss(styles: any) {
    let keys: string[] = Object.keys(styles);
    let reformed = {} as { [key: string]: string[] };
    let mappings = {} as any;

    for (let key of keys) {
      let {
        atomicClassnameArray,
        atomicClassNameMappings
      } = this.generateAtomicCss(styles[key]);
      reformed[key] = atomicClassnameArray;
      mappings = { ...mappings, ...atomicClassNameMappings };
    }

    return this.getAtomicClassNames(reformed, mappings);
  }
}
