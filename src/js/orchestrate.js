/**
 * SVGcode—Convert raster images to SVG vector graphics
 * Copyright (C) 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import {
  preProcessMainCanvas,
  preProcessInputImage,
  supportsOffscreenCanvas,
} from './preprocess.js';
import { colorRadio, svgOutput } from './domrefs.js';
import { convertToMonochromeSVG } from './monochrome.js';
import { convertToColorSVG, intervalID } from './color.js';
import { showToast, MONOCHROME, COLOR } from './ui.js';
import { i18n } from './i18n.js';

import spinnerSVG from '../../public/spinner.svg';

const readableSize = (size) => {
  if (size === 0) return '0B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${['B', 'KB', 'MB'][i]}`;
};

const displayResult = (svg, className) => {
  if (!svg) {
    return;
  }
  // Remove `width` and `height` attributes.
  svg = svg
    .replace(/\s+width="\d+(?:\.\d+)?"/, '')
    .replace(/\s+height="\d+(?:\.\d+)"/, '');
  svgOutput.classList.remove(COLOR);
  svgOutput.classList.remove(MONOCHROME);
  svgOutput.classList.add(className);
  svgOutput.innerHTML = svg;
  showToast(`${i18n.t('svgSize')}: ${readableSize(svg.length)}`, 3000);
};

const startProcessing = async () => {
  svgOutput.innerHTML = '';
  svgOutput.classList.remove(COLOR, MONOCHROME);
  if (intervalID.current) {
    clearInterval(intervalID.current);
    intervalID.current = null;
  }
  const transform = svgOutput.getAttribute('transform');
  svgOutput.innerHTML = spinnerSVG;
  if (transform) {
    svgOutput.dataset.transform = transform;
    svgOutput.setAttribute('transform', '');
  }
  const imageData = supportsOffscreenCanvas
    ? await preProcessInputImage()
    : preProcessMainCanvas();
  if (colorRadio.checked) {
    const svg = await convertToColorSVG(imageData);
    if (transform) {
      svgOutput.setAttribute('transform', transform);
    }
    displayResult(svg, COLOR);
  } else {
    const svg = await convertToMonochromeSVG(imageData);
    if (transform) {
      svgOutput.setAttribute('transform', transform);
    }
    displayResult(svg, MONOCHROME);
  }
};

export { startProcessing };
