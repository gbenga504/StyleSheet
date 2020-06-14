import { UNITLESS_CSS_KEYS } from "./UnitlessCssKeys";

interface IProps {
  rootFontSize?: number;
}

/**
 * In a production based environment we will either
 * want each Stylesheet.create function to maintain its own instance
 * of the styles object and if we choose to perform some
 * static analysis to further optimise css, then we can go further with this approach
 *
 * This is also for development purposes. Its not intended to be production ready
 */
export class Stylesheet {
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
   * When forceUniqueness is true, then the same hash is generated for
   * 2 or more str with the same value
   * This is useful in case you want to eliminate duplicates
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
   * @return {Object}
   * @param style
   * @param key
   * This function takes a js defined css key and value and returns the
   * equivalent css meta data. The meta data consist of a valid css property,
   * value , suffix and css value
   */
  private getCssMetaData(
    key: string,
    value: string
  ): { property: string; value: string; suffix: string; cssValue: string } {
    let property = this.getValidCssProperty(key);
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

    return {
      property,
      value,
      suffix,
      cssValue: `${property}:${value}${suffix};`
    };
  }

  /**
   * @return string
   * @param param
   * This function converts a Js class definition to a valid css string
   */
  private convertClassDefToValidCss(style: any): string {
    let cssProperties = Object.keys(style);
    let result = "";

    for (let key of cssProperties) {
      let { cssValue } = this.getCssMetaData(key, style[key]);
      result += cssValue;
    }
    return result;
  }

  /**
   *
   * @param style
   * This function generates atomic css and returns a
   * mapping representing { atomicClassname : cssProperty }
   */
  private generateAtomicCss(style: any): { [key: string]: string } {
    let cssProperties = Object.keys(style);
    let atomicClassNameMappings: { [key: string]: string } = {};

    for (let key of cssProperties) {
      let { cssValue } = this.getCssMetaData(key, style[key]);
      let atomicClassnameHash = `s${this.generateClassNameHash(
        cssValue,
        true
      )}`;
      atomicClassNameMappings[atomicClassnameHash] = key;
      this.setStyle(atomicClassnameHash, cssValue);
    }
    return atomicClassNameMappings;
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

  /**
   * @return {String}
   * @param atomicClassNamesByClassDef {Object}
   * @param atomicClassNamesDictionary {Object}
   * This function returns a function that returns
   * the atomic classnames generated based on the js classnames arguments
   * Here we also respect the order in which classnames are applied
   */
  private getAtomicClassNames(
    atomicClassNamesByClassDef: { [key: string]: string[] },
    atomicClassNamesDictionary: { [key: string]: string }
  ): Function {
    return function(): string {
      let atomicClassNames = {} as any;
      for (let i = 0; i < arguments.length; i++) {
        let className = arguments[i];
        //check if the className passed has a list of atomic classnames
        if (
          className &&
          typeof className === "string" &&
          !!atomicClassNamesByClassDef[className] === true
        ) {
          //Map css properties to their atomicClassName
          for (let atomicClassName of atomicClassNamesByClassDef[className]) {
            atomicClassNames[
              atomicClassNamesDictionary[atomicClassName]
            ] = atomicClassName;
          }
        }
      }
      //@todo
      //Object.values not available as a property of Object so we use the long approach
      //return a string of valid atomic classnames
      return Object.keys(atomicClassNames)
        .map(k => atomicClassNames[k])
        .join(" ");
    };
  }

  /**
   * @return {Object}
   * @param styles
   * This function is an entry point.
   * It returns an object. The key which corresponds to the user defined classname
   * and value which corresponds to the classname hash
   * Use this if you do not want to harness the power of atomic css
   */
  public create(styles: any) {
    let classNames: string[] = Object.keys(styles);
    let result: { [key: string]: string } = {};

    for (let className of classNames) {
      let cssValue: string = this.convertClassDefToValidCss(styles[className]);
      let classnameHash = `s${this.generateClassNameHash(cssValue)}`;
      result[className] = classnameHash;
      this.setStyle(classnameHash, cssValue);
    }
    return result;
  }

  /**
   * @return {Function}
   * @param styles
   * This function is an entry point
   * With atomic css, we can take advantage of static analysis to precompile css
   * and generate a relatively small output
   * Also the order of css in the CSSDOM do not matter, this function makes sure
   * that we respect the order of classname as defined in our JSX
   * i.e className={styles("greenText", "redText")} , we are always certain that
   * red color is applied no matter where it sits in our CSSDOM
   */
  public createAtomicCss(styles: any) {
    let classNames: string[] = Object.keys(styles);
    let atomicClassNamesByClassDef = {} as { [key: string]: string[] }; //each classname is mapped to a list of generated atomic classnames based on its class def
    let atomicClassNamesDictionary = {} as { [key: string]: string }; //each atomic classname is mapped to its corresponding css property

    for (let className of classNames) {
      let atomicClassNameMappings = this.generateAtomicCss(styles[className]);
      atomicClassNamesByClassDef[className] = Object.keys(
        atomicClassNameMappings
      );
      atomicClassNamesDictionary = {
        ...atomicClassNamesDictionary,
        ...atomicClassNameMappings
      };
    }

    return this.getAtomicClassNames(
      atomicClassNamesByClassDef,
      atomicClassNamesDictionary
    );
  }
}
