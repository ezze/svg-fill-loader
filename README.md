# SVG fill loader for Webpack [![Build Status](https://travis-ci.org/kisenka/svg-fill-loader.svg?branch=master)](https://travis-ci.org/kisenka/svg-fill-loader) [![Coverage Status](https://coveralls.io/repos/github/kisenka/svg-fill-loader/badge.svg?branch=master)](https://coveralls.io/github/kisenka/svg-fill-loader?branch=master)

Webpack loader that changes colors in SVG images.
Useful when you embed SVG in CSS as background image and don't want to produce
tons of identical files which only differ in their `fill` attributes.

<a href="https://raw.githubusercontent.com/kisenka/svg-fill-loader/master/preview.gif">
  <img src="https://raw.githubusercontent.com/kisenka/svg-fill-loader/master/preview.gif" width="640">
</a>

Allow to do something like this in CSS:
```css
.icon {
  background-image: url('./image.svg?fill=#fff');
}
```

Or even something like this in SCSS/LESS/Stylus/etc:
```scss
// _config.scss
$icon-color: #fff;

// styles.scss
@import "_config.scss";
.icon {
  background-image: url('./image.svg?fill=#{$icon-color}');
}
```

## Installation

```
npm install svg-fill-loader --save
```

## Configuration

Loader has two settings levels:

1. Webpack config.
2. SVG file import statement.

### `selector` (optional)

CSS selector for nodes to be repainted. Very simple CSS selectors are supported: 
- tag selector: `path`.
- id selector: `#id`.
- class selector: `.class`.
- selectors can be combined via comma: `circle, .path, #id`.

All presentation SVG tags are used as default selector. You can find them in [lib/posthtmlPlugin.js](https://github.com/kisenka/svg-fill-loader/blob/master/lib/posthtmlPlugin.js#L18).

Webpack config example:

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.svg\?fill=/, // match only imports like `url(image.svg?fill=red)`
        loaders: [
          'url', // or file-loader
          'svg-fill?selector=path,circle' // `selector` option will be used for all images processed by loader
        ]
      }
    ]
  }
}
```

### `fill` (required)

Color to repaint with. Specified in the SVG import statement as a required attribute.

```css
.image {
  background-image: url('./image.svg?fill=red');
}
```

This will result in that each of the repainted tags will receive the `fill="red"` attribute;
in case you need other attributes, like `stroke` - feel free to submit an issue about that.

### `raw` (optional, `true` by default)

By default the loader returns the repainted SVG as-is, which is convenient for further processing with
file-loader (e.g. to create a separate file), or url-loader (to embed it in CSS code).
However, sometimes you might need to get the image as a module (like, for rendering with React).
In this case, you'll need to set `raw=false`:

```js
{
  test: /\.svg/,
  loader: 'svg-fill?raw=false'
}
```

This can also be done via import statement, but try avoidig this way:

```js
import icon from './icon.svg?fill=red&raw=false';
```

### `renderOptions` (optional)

Overwrites [render options](https://github.com/posthtml/posthtml-render#options) which by default are the following:

```js
{
    singleTags: [
        'circle',
        'ellipse',
        'line',
        'path',
        'polygon',
        'polyline',
        'rect',
        'use'
    ],
    closingSingleTag: 'slash'
}
```


## Important notes

### Escaping sharp symbol in CSS url() imports

If you're using css-loader to handle CSS, keep in mind that it will [cut away symbols after `#`](https://github.com/webpack/css-loader/blob/master/lib/loader.js#L79)
when handling imports via `url(...)`, which means that the expression `url(image.svg?fill=#f00)` will be treated as `url(image.svg?fill=)`,
and the loader will not be able to handle the file. As a workaround, you can use `%23` instead of sharp (ffffuuuu),
or use the `encodeSharp` loader that is shipped with svg-fill-loader (yey!).
Mind the order in which loaders are used:

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.svg\?fill=/,
        loader: [
          'url',
          'svg-fill'
        ]
      },
      {
        test: /\.css$/,
        loaders: [
          'css',
          'svg-fill/encodeSharp', // <- encodeSharp loader should be defined BEFORE css-loader
          'sass' // but after any other loaders which produces CSS
        ]
      }
    ]
  }
}
```

### Further SVG handling

Don't forget that this loader leaves any further SVG processing to your choice.

You can use:
* url-loader to inline the SVG into CSS.
* file-loader to save SVG as a file.
* gtfo-loader to ooops.
