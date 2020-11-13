# global-style

This library was strongly inspired by [CXS](https://github.com/cxs-css/cxs),

But it is not a fork,

It is a complete new implementation

And there are some key differences on how it works compared to CXS.


Object Oriented
```js
import { GlobalStyle } from "g-style";
const globalStyle = new GlobalStyle({});
const className = globalStyle.getClassNames({ color: "gold" });
// this would have more configurations available
```

Functional
```js
import { css } from "g-style";
const className = css({ color: "gold" });
// this way it is the simpler, it just works
```

## Features

- Small
- Typescript Support
- 100% Unit tested
- Zero dependencies
- High performance
- Deduplicates repeated styles
- Dead-code elimination
- Framework independent
- Media queries
- Pseudoclasses
- Nesting
- No CSS files
- CSP
- Run from CDN
- Auto append "px" (similar to react)


## Install

```sh
npm install g-style
```
```sh
yarn add g-style
```

### CDN

Run from CDN

```html
<script src="https://unpkg.com/g-style@1.2.1/dist/index.umd.js"></script>
<script>
const {css} = GlobalStyle;
const className = css({margin: 0});
</script>
```

Run from CDN with webpack

```js
webpack.config.js

export default {
  ...
  externals: {"g-style": "GlobalStyle"}
  ...
};

```


## Usage

Example with React

```js
import React from "react"
import { GlobalStyle } from "g-style";
const globalStyle = new GlobalStyle();
const className = globalStyle.getClassNames({ color: "gold" });

export const Box = (props) => <div {...props} className={className} />

```

```js
import React from "react"
import { css } from "g-style";
const className = css({ color: "gold" });

export const Box = (props) => <div {...props} className={className} />

```


### Pseudo-classes

####This is one of the main differences comparing to CXS, pseudo-classes should have the `&` symbol similar to SCSS/SASS

```js
const className = globalStyle.getClassNames({
  color: "gold",
  "&:hover": {
    border: "1px solid #ccc"
  }
})
```

### Media Queries
```js
const className = globalStyle.getClassNames({
  fontSize: 32,
  "@media screen and (min-width: 40em)": {
    fontSize: 48
  }
})
```

### Multi value Array for vendor prefixing
```js
const className = globalStyle.getClassNames({
  display: ["flex", "-webkit-flex"]
})
```

### Child Selectors

####One more difference comparing to CXS, child selectors don't need to start with a space symbol.

```js
const className = globalStyle.getClassNames({
  color: "gold",
  ".link": {
    color: "red"
  }
})
```

### Static/Server-Side Rendering

For Node.js environments, use the `globalStyle.getFullCss()` method to return the static CSS string *after* rendering a view.

```js
import React from "react";
import ReactDOMServer from "react-dom/server";
import { GlobalStyle } from "g-style";
import App from "./App";

...
// Create a new instance of globalStyle for each render
const globalStyle = new GlobalStyle();
...

const html = ReactDOMServer.renderToString(<App />);
const css = globalStyle.getFullCss();

const doc = `<!DOCTYPE html>
<style>${css}</style>
${html}
`
```


### Keyframe support

```js
const className = globalStyle.getClassNames({
    "@keyframes spin": {
        "0%": {
            transform: "rotate(0deg)"
        },
        "100%": {
            transform: "rotate(360deg)"
        }
    },
    animation: "spin 5s infinite",
})
```

### Support comma separated style key

```js
const globalStyle = new GlobalStyle();
const className = globalStyle.getClassNames({
    "code,kbd,samp": { fontSize: "1em" },
});
```
Will create all style rules
```css
.t0 code{font-size:1em;}
.t1 kbd{font-size:1em;}
.t2 samp{font-size:1em;}
```


### Security

Global Style will read the csp nonce from meta tag automatically

```html
<meta property="csp-nonce" content="random-nonce">
```

You can optionally provide a nonce when creating the instance

```js
const globalStyle = new GlobalStyle({nonce:"random-nonce"});
```

### Auto append px to numeric size rules
```js
const globalStyle = new GlobalStyle();
const className = globalStyle.getClassNames({
  margin: 10
})

// will create a margin: 10px

```



## API

### `const globalStyle = new GlobalStyle()`

Create a new globalStyle instance

### `const globalStyle = new GlobalStyle({prefix:"prefix", nonce:"random", debug: true})`

Create a new globalStyle instance with custom prefix

### `globalStyle.getClassNames(styleObject)`

Accepts one style object a className string.

### `globalStyle.getFullCss()`

Returns the rendered CSS string for static and server-side rendering.

### `css(styleObject)`

Returns the rendered CSS string for static and server-side rendering.

[MIT License](LICENSE.md)
