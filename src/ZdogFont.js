import Typr from 'typr.js';

export function registerFontClass(Zdog) {
  // Zdog.Font class
  class ZdogFont {
    constructor(props) {
      // Set missing props to default values
      props = Zdog.extend({
        src: '',
      }, props);
      this.src = props.src;
      this.font = null;
      this._hasLoaded = false;
      this._loadCallbacks = [];
      // Add this font instance to the internal font list
      Zdog.FontList.push(this);
      // Begin loading font file
      this._fetchFontResource(this.src)
        .then(buffer => {
          this.font = Typr.parse(buffer);
          this._hasLoaded = true;
          this._loadCallbacks.forEach(callback => callback());
        })
        .catch(err => {
          throw new Error(`Could not load font from ${this.src}\n${err}`);
        })
    }

    waitForLoad() {
      return new Promise((resolve, reject) => {
        // If the font is loaded, we can resolve right away
        if (this._hasLoaded && this._hasLoaded) {
          resolve();
        }
        // Otherwise, wait for it to load
        else {
          this._loadCallbacks.push(resolve);
        }
      });
    }

    getFontScale(fontSize) {
      if (!this._hasLoaded) {
        return null;
      } else {
        return 1 / this.font.head.unitsPerEm * fontSize;
      }
    }

    measureText(text, fontSize=64) {
      if (!this._hasLoaded) {
        return null;
      }
      const font = this.font;
      const advanceWidthTable = font.hmtx.aWidth;
      const glyphs = Typr.U.stringToGlyphs(this.font, text);
      const fontScale = this.getFontScale(fontSize);
      const descender = font.hhea.descender;
      const ascender = font.hhea.ascender;
      const lineGap = font.hhea.lineGap;
      const lineHeight = (0 - descender) + ascender;
      const width = glyphs.reduce((advanceWidth, glyphId) => {
        // stringToGlyphs returns an array on glyph IDs that is the same length as the text string
        // an ID can sometimes be -1 in cases where multiple characters are merged into a single ligature
        if (glyphId > -1 && glyphId < advanceWidthTable.length) {
          advanceWidth += advanceWidthTable[glyphId];
        }
        return advanceWidth;
      }, 0);
      // Multiply by fontScale to convert from font units to pixels
      return {
        height: lineHeight * fontScale,
        width: width * fontScale,
        descender: descender * fontScale,
        ascender: ascender * fontScale,
      };
    }

    getTextPath(text, fontSize=64, x=0, y=0, z=0, alignX='left', alignY='bottom') {
      if (!this._hasLoaded) {
        return [];
      }
      const glyphs = Typr.U.stringToGlyphs(this.font, text);
      const path = Typr.U.glyphsToPath(this.font, glyphs);
      [x, y, z] = this.getTextOrigin(text, fontSize, x, y, z, alignX, alignY);
      return this._convertPathCommands(path, fontSize, x, y, z);
    }

    getTextGlyphs(text, fontSize=64, x=0, y=0, z=0, alignX='left', alignY='bottom') {
      if (!this._hasLoaded) {
        return [];
      }
      const glyphs = Typr.U.stringToGlyphs(this.font, text);
      const advanceWidthTable = this.font.hmtx.aWidth;
      const fontScale = this.getFontScale(fontSize);
      [x, y, z] = this.getTextOrigin(text, fontSize, x, y, z, alignX, alignY);
      return glyphs.filter(glyph => glyph !== -1).map(glyphId => {
        const path = Typr.U.glyphToPath(this.font, glyphId);
        const shape = {
          translate: {x, y, z},
          path: this._convertPathCommands(path, fontSize, 0, 0, 0)
        };
        x += advanceWidthTable[glyphId] * fontScale;
        return shape;
      })
    }

    getTextOrigin(text, fontSize=64, x=0, y=0, z=0, alignX='left', alignY='bottom') {
      const { width, height, descender } = this.measureText(text, fontSize);
      switch (alignX) {
        case 'right':
          x -= width;
          break;
        case 'center':
          x -= width / 2;
          break;
        case 'left':
        default:
          break;
      }
      switch (alignY) {
        case 'top':
          y += height;
          break;
        case 'middle':
          y += height / 2;
          break;
        case 'bottom':
        default:
          break;
      }
      return [x, y, z];
    }

    // Convert Typr.js path commands to Zdog commands
    // Also apply font size scaling and coordinate adjustment
    // https://github.com/photopea/Typr.js?utm_source=codropscollective#typruglyphtopathfont-gid
    // https://zzz.dog/shapes#shape-path-commands
    _convertPathCommands(path, fontSize, x=0, y=0, z=0) {
      const yDir = -1;
      const xDir = 1;
      const fontScale = this.getFontScale(fontSize);
      const commands = path.cmds;
      // Apply font scale to all coords
      const coords = path.crds.map(coord => coord * fontScale);
      let startCoord = null;
      let coordOffset = 0;
      return commands.map((cmd) => {
        let result = null;
        if (!startCoord) {
          startCoord = {x: x + coords[coordOffset] * xDir, y: y + coords[coordOffset + 1] * yDir, z};
        }
        switch (cmd) {
          case 'M': // moveTo command
            result = {
              move: {x: x + coords[coordOffset] * xDir, y: y + coords[coordOffset + 1] * yDir, z}
            };
            coordOffset += 2;
            return result;
          case 'L': // lineTo command
            result = {
              line: {x: x + coords[coordOffset] * xDir, y: y + coords[coordOffset + 1] * yDir, z}
            };
            coordOffset += 2;
            return result;
          case 'C': // curveTo command
            result = {
              bezier: [
                {x: x + coords[coordOffset]     * xDir, y: y + coords[coordOffset + 1] * yDir, z},
                {x: x + coords[coordOffset + 2] * xDir, y: y + coords[coordOffset + 3] * yDir, z},
                {x: x + coords[coordOffset + 4] * xDir, y: y + coords[coordOffset + 5] * yDir, z},
              ]
            };
            coordOffset += 6;
            return result;
          case 'Q': // arcTo command
            result = {
              arc: [
                {x: x + coords[coordOffset]     * xDir, y: y + coords[coordOffset + 1] * yDir, z},
                {x: x + coords[coordOffset + 2] * xDir, y: y + coords[coordOffset + 3] * yDir, z},
              ]
            };
            coordOffset += 4;
            return result;
          case 'Z': // close path
            if (startCoord) {
              result = {
                line: startCoord
              };
              startCoord = null;
            }
            return result;
          // unhandled type
          // currently, #rrggbb and X types (used in multicolor fonts) aren't supported
          default:
            return result;
        }
      }).filter(cmd => cmd !== null); // filter out unneeded commands
    }

    _fetchFontResource(source) {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        // Fetch as an arrayBuffer for Typr.parse
        request.responseType = 'arraybuffer'; 
        request.open('GET', source, true);
        request.onreadystatechange = e => {
          if (request.readyState === 4) {
            if (request.status >= 200 && request.status < 300) {
              resolve(request.response);
            } else {
              reject(`HTTP Error ${request.status}: ${request.statusText}`);
            }
          }
        };
        request.send(null);
      });
    }
  }

  Zdog.Font = ZdogFont;
  return Zdog;
}