export interface CssObject {
    [key: string]: string | CssObject;
}

export class GlobalStyle{
    private readonly cache: { [key: string]: string } = {};
    private readonly rules: string[] = [];
    private readonly sheet?: CSSStyleSheet;

    constructor(private prefix: string = "t") {
        if (typeof document !== "undefined") {
            this.sheet = document.head.appendChild(document.createElement("style")).sheet as CSSStyleSheet;
        }
    }

    private parseCssObject(style: CssObject, childSelector: string = "", mediaQuery: string = ""): string {
        return Object.keys(style)
            .filter((key) => Boolean(style[key]))
            .map((key): string => {
                const styleKey = key.trim().replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
                const value = style[key];
                if (typeof value === "string") {
                    const cacheKey = styleKey + value + childSelector + mediaQuery;
                    if (!this.cache[cacheKey]) {
                        const className = this.prefix + this.rules.length.toString(36);
                        const style = `.${className}${childSelector}{${styleKey}:${value};}`;
                        const rule = mediaQuery ? `${mediaQuery}{${style}}` : style;
                        this.cache[cacheKey] = className;
                        this.rules.push(rule);
                        if (this.sheet) {
                            this.sheet.insertRule(rule, this.sheet.cssRules.length);
                        }
                    }
                    return this.cache[cacheKey];
                } else {
                    if (styleKey.startsWith("@media")) {
                        return this.parseCssObject(value, childSelector, styleKey);
                    } else {
                        const formattedChildKey = styleKey.startsWith("&") ? styleKey.substr(1) : " " + styleKey;
                        return this.parseCssObject(value, childSelector + formattedChildKey, mediaQuery);
                    }
                }
            })
            .join(" ");
    }


    public getClassNames(style: CssObject) {
        return this.parseCssObject(style);
    }

    public getFullCss() {
        return this.rules.sort().join('\n');
    }
}
