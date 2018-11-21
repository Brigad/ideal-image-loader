# @brigad/ideal-image-loader

🖼️ A loader for webpack which handles 2x/3x/webp and works well with gatsby-image and react-ideal-image

[Release article][release-article] (TODO)

[![CircleCI][circle-ci-badge]][circle-ci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][package]
[![MIT License][license-badge]][license]
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
[![code style: prettier][prettier-badge]][prettier]
[![semantic-release][semantic-release-badge]][semantic-release]
[![Star on GitHub][github-star-badge]][github-star]

## Installation

```bash
yarn add @brigad/ideal-image-loader
```

Or, if you are using npm:

```bash
npm install --save @brigad/ideal-image-loader
```

## Usage

`ideal-image-loader` works like
[file-loader][file-loader], but will also load @2x, @3x and .webp variations of the file.

```js
// Will also try to resolve:
// - ./image@2x.png
// - ./image@3x.png
// - and try to generate:
// - ./image.webp
// - ./image@2x.webp
// - ./image@3x.webp
import img from './image.png';
```

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|svg|gif)$/i,
        use: [
          {
            loader: '@brigad/ideal-image-loader',
            options: {
              name: 'images/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
};
```

```json
// output
{
  "x1": {
    "src": "...",
    "preSrc": "data:...",
    "webp": "..."
  },
  "x2": {
    "src": "...",
    "preSrc": "data:...",
    "webp": "..."
  },
  "x3": {
    "src": "...",
    "preSrc": "data:...",
    "webp": "..."
  }
}
```

And run `webpack` via your preferred method.

A fully-working component example is available [here](./examples/Image.js), feel free to copy it and to adapt it to your needs!

## Problem

At Brigad, we have been looking for a solution to lazy-load images in a way that would feel good for the user and the developer. We also wanted our images to be as lightweight as possible for a given screen resolution. We tried to use [gatsby-image][gatsby-image] (but without using Gatsby) and [react-ideal-image][react-ideal-image], but we needed a loader to help us load our images without manually converting all of them to Webp, and manually importing each variation.

## Solution

To solve the problems listed above, `ideal-image-loader` will, _based on one imported image_, resolve the `@2x` and `@3x` formats, and generate the `.webp` alternatives.

And the cherry on the top: it works seamlessly with [gatsby-image][gatsby-image] without the need to use Gatsby, and also with [react-ideal-image][react-ideal-image]!

[Browse the documentation](#options) to get started! To learn more about the problem and solution, you can also read the [release article][release-article].

## Options

Sensible configuration:

```js
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

options: {
  name: 'images/[name].[hash].[ext]',
  base64: IS_PRODUCTION,
  webp: IS_PRODUCTION ? undefined : false,
  warnOnMissingSrcset: !IS_PRODUCTION,
},
```

This loader forwards all additional options (such as `name`) to [file-loader][file-loader].

### base64

Type: `boolean`, Default: `true`

Specifies whether a low quality image placeholder (lqip) should be generated under the key `preSrc`.

### palette

Type: `boolean`, Default: `false`

Specifies whether a color palette should be generated under the key `palette`.

### webp

Type: `object`, Default: `undefined`

Specifies the configuration object passed to [imagemin-webp][imagemin-webp] to generate `.webp` images, under the key `webp`.

`undefined` is the default configuration, `null` deactivates this feature, and any other option will be passed to imagemin-webp.

### srcset

Type: `boolean`, Default: `true`

Specifies whether `@2x` and `@3x` images should be resolved, and new objects `x2` and `x3` should be put alongside `x1`.

### warnOnMissingSrcset

Type: `boolean`, Default: `false`

Specifies whether the loader should warn when there are missing `@2x` and `@3x` images.

## Peer dependencies

Ideal-image-loader assumes you are using >=Node 6.9.0, Webpack >=4.0.0 and File-loader >=2.0.0.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/15089053?v=4" width="100px;"/><br /><sub><b>Adrien HARNAY</b></sub>](https://adrien.harnay.me)<br />[📝](#blog-adrienharnay "Blogposts") [💻](https://github.com/adrienharnay/@brigad/ideal-image-loader/commits?author=adrienharnay "Code") [🎨](#design-adrienharnay "Design") [📖](https://github.com/adrienharnay/@brigad/ideal-image-loader/commits?author=adrienharnay "Documentation") [💡](#example-adrienharnay "Examples") [🤔](#ideas-adrienharnay "Ideas, Planning, & Feedback") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

[release-article]: https://engineering.brigad.co/
[circle-ci-badge]: https://img.shields.io/circleci/token/75524c993d9de495223af8fa371cf086aa69793d/project/github/Brigad/ideal-image-loader/master.svg?style=flat-square&label=build
[circle-ci]: https://circleci.com/gh/Brigad/ideal-image-loader
[version-badge]: https://img.shields.io/npm/v/@brigad/ideal-image-loader.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dt/@brigad/ideal-image-loader.svg?style=flat-square
[package]: https://www.npmjs.com/package/@brigad/ideal-image-loader
[license-badge]: https://img.shields.io/npm/l/@brigad/ideal-image-loader.svg?style=flat-square
[license]: https://github.com/Brigad/ideal-image-loader/blob/master/LICENSE.md
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/Brigad/ideal-image-loader/blob/master/CODE_OF_CONDUCT.md
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[prettier]: https://github.com/prettier/prettier
[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release]: https://github.com/semantic-release/semantic-release
[github-star-badge]: https://img.shields.io/github/stars/Brigad/ideal-image-loader.svg?style=social
[github-star]: https://github.com/Brigad/ideal-image-loader/stargazers
[file-loader]: https://github.com/webpack-contrib/file-loader
[imagemin-webp]: https://github.com/imagemin/imagemin-webp
[gatsby-image]: https://www.gatsbyjs.org/packages/gatsby-image/
[react-ideal-image]: https://github.com/stereobooster/react-ideal-image
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
