const fs = require('fs');
const nodePath = require('path');

const fastStableStringify = require('fast-stable-stringify');
// eslint-disable-next-line import/no-unresolved
const fileLoader = require('file-loader');
const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');
const loaderUtils = require('loader-utils');
const lqip = require('lqip');
const xxHash = require('xxhashjs');

const defaultOptions = {
  base64: true,
  palette: false,
  webp: undefined,
  srcset: true,
  svgoCleanUpIds: false,
  warnOnMissingSrcset: false,
};

const readFileAsync = (context, filename, warnOnMissingSrcset) =>
  new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        if (warnOnMissingSrcset) {
          context.emitWarning(
            new Error(`[ideal-image-loader] Missing srcset: ${filename}`),
          );
        }
        resolve(null);
      } else {
        resolve(data);
      }
    });
  });

const getSource = (context, contentBuffer) => {
  const content = contentBuffer.toString('utf8');

  const contentIsUrlExport = /^module.exports = "data:[^;]*;base64,/.test(
    content,
  );
  if (contentIsUrlExport) {
    return content.replace('module.exports = ', '');
  }

  const contentIsFileExport = content.startsWith('module.exports = ');
  const loadedContent = contentIsFileExport
    ? content
    : fileLoader.call(context, contentBuffer);
  return loadedContent.replace('module.exports = ', '');
};

const getExtensionFromPath = filepath =>
  nodePath.extname(filepath).toLowerCase();

const hash = str => xxHash.h32(fastStableStringify(str), 0).toString(16);

const processOtherFormats = (context, contentBuffer) => {
  const callback = context.async();
  const result = `module.exports = ${getSource(context, contentBuffer)}`;

  callback(null, result);
};

const processJPGPNG = (context, contentBuffer) => {
  const callback = context.async();
  const path = context.resourcePath;
  const extension = getExtensionFromPath(path);
  const options = {
    ...defaultOptions,
    ...(loaderUtils.getOptions(context) || {}),
  };

  const enableLqip = ['.jpg', '.jpeg'].includes(extension);
  const enableBase64 = enableLqip && options.base64;
  const enablePalette = enableLqip && options.palette;
  const enableWebp = typeof options.webp === 'undefined' || !!options.webp;
  const enableSrcset = !!options.srcset;

  const paths = [
    path,
    path.replace(`${extension}`, `@2x${extension}`),
    path.replace(`${extension}`, `@3x${extension}`),
  ];

  const srcsetPromises = [
    contentBuffer,
    enableSrcset
      ? readFileAsync(context, paths[1], options.warnOnMissingSrcset)
      : null,
    enableSrcset
      ? readFileAsync(context, paths[2], options.warnOnMissingSrcset)
      : null,
  ];

  Promise.all(srcsetPromises)
    .then((srcsetData) => {
      const lqipWebpPromises = srcsetData.reduce(
        (result, data, index) => [
          ...result,
          !index && enableBase64 ? lqip.base64(paths[index]) : null,
          !index && enablePalette ? lqip.palette(paths[index]) : null,
          data && enableWebp
            ? imagemin.buffer(data, {
                plugins: imageminWebp(options.webp),
              })
            : null,
        ],
        [],
      );

      Promise.all(lqipWebpPromises)
        .then((lqipWebpData) => {
          const srcset = paths.map((_, index) => {
            const lqipWebpIndex = index * 3;

            if (!srcsetData[index]) {
              return null;
            }

            const dataContext = {
              ...context,
              resourcePath: paths[index],
            };

            const src = getSource(dataContext, srcsetData[index]);
            const preSrc = lqipWebpData[lqipWebpIndex]
              ? JSON.stringify(lqipWebpData[lqipWebpIndex])
              : null;
            const palette = lqipWebpData[lqipWebpIndex + 1]
              ? JSON.stringify(lqipWebpData[lqipWebpIndex + 1])
              : null;
            const webp = lqipWebpData[lqipWebpIndex + 2]
              ? getSource(
                  {
                    ...dataContext,
                    resourcePath: dataContext.resourcePath.replace(
                      /jpe?g|png/i,
                      'webp',
                    ),
                  },
                  lqipWebpData[lqipWebpIndex + 2],
                )
              : null;

            return {
              src,
              preSrc,
              palette,
              webp,
            };
          });

          const result = `module.exports = {${srcset
            .map((data, index) =>
              data
                ? `x${index + 1}: { ${Object.entries(data)
                    .map(([key, value]) => (value ? `"${key}": ${value}` : ''))
                    .filter(Boolean)
                    .join(',')} }`
                : null,
            )
            .filter(Boolean)
            .join(',')}}`;

          callback(null, result);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          callback(error);
        });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      callback(error);
    });
};

const processSVG = (context, contentBuffer) => {
  const options = {
    ...defaultOptions,
    ...(loaderUtils.getOptions(context) || {}),
  };

  if (!options.svgoCleanUpIds) {
    processOtherFormats(context, contentBuffer);
    return;
  }

  const callback = context.async();

  imagemin
    .buffer(contentBuffer, {
      plugins: imageminSvgo({
        plugins: [
          {
            cleanupIDs: {
              prefix: hash(context.resource),
              minify: true,
              remove: true,
            },
          },
          { removeViewBox: false },
        ],
      }),
    })
    .then((data) => {
      const result = `module.exports = ${getSource(context, data)}`;

      callback(null, result);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      callback(error);
    });
};

// eslint-disable-next-line func-names
module.exports = function(contentBuffer) {
  const context = this;
  if (context.cacheable) {
    context.cacheable();
  }
  const path = context.resourcePath;
  const extension = getExtensionFromPath(path);

  switch (extension) {
    case '.jpg':
    case '.jpeg':
    case '.png':
      return processJPGPNG(context, contentBuffer);
    case '.svg':
      return processSVG(context, contentBuffer);
    default:
      return processOtherFormats(context, contentBuffer);
  }
};

module.exports.raw = true;
