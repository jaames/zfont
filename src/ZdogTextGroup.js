export function registerTextGroupClass(Zdog) {

  // Zdog.TextGroup class
  class ZdogTextGroup extends Zdog.Group {
    
    constructor(props) {
      // Set missing props to default values
      props = Zdog.extend({
        font: null,
        value: '',
        fontSize: 64,
        textAlign: 'left',
        color: '#333',
        fill: false,
        stroke: 1,
      }, props);
      // Split props
      const {
        font,
        value,
        fontSize,
        textAlign,
        color,
        fill,
        stroke,
        ...groupProps
      } = props;
      // Create group object
      super({
        ...groupProps,
        visible: false, // hide until font is loaded
      });
      this._font = null;
      this._value = value;
      this._fontSize = fontSize;
      this._textAlign = textAlign;
      this._color = color;
      this._fill = fill;
      this._stroke = stroke;
      this.font = font;
    }

    updateText() {
      // Remove old children
      while (this.children.length > 0) {
        this.removeChild(this.children[0]);
      }
      // Get text paths for each glyph
      const glyphs = this.font.getTextGlyphs(this.value, this.fontSize, 0, 0, 0, this.textAlign, 'bottom');
      // Convert glyphs to new shapes
      glyphs.forEach(shape => {
        this.addChild(new Zdog.Shape({
          translate: shape.translate,
          path: shape.path,
          color: this.color,
          fill: this.fill,
          stroke: this.stroke,
          closed: true,
        }));
      });
      this.updateFlatGraph();
    }

    set font(newFont) {
      this._font = newFont;
      this._font.waitForLoad().then(() => {
        this.updateText();
        this.visible = true;
        // Update and rerender illustration
        if (this.addTo) { 
          this.addTo.updateRenderGraph();
        }
      });
    }

    get font() {
      return this._font;
    }

    set value(newValue) {
      this._value = newValue;
      this.updateText();
    }
    
    get value() {
      return this._value;
    }

    set fontSize(newSize) {
      this._fontSize = newSize;
      this.updateText();
    }

    get fontSize() {
      return this._fontSize;
    }

    set textAlign(newValue) {
      this._textAlign = newValue;
      this.updateText();
    }

    get textAlign() {
      return this._textAlign;
    }

    set color(newColor) {
      this._color = newColor;
      this.children.forEach(child => child.color = newColor);
    }

    get color() {
      return this._color;
    }

    set fill(newFill) {
      this._fill = newFill;
      this.children.forEach(child => child.fill = newFill);
    }

    get fill() {
      return this._fill;
    }

    set stroke(newStroke) {
      this._stroke = newStroke;
      this.children.forEach(child => child.stroke = newStroke);
    }

    get stroke() {
      return this._stroke;
    }
  }

  ZdogTextGroup.optionKeys = ZdogTextGroup.optionKeys.concat(['color', 'fill', 'stroke', 'font', 'fontSize', 'value', 'textAlign']);
  Zdog.TextGroup = ZdogTextGroup;
  return Zdog;
}