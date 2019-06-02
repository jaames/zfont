export function registerTextClass(Zdog) {

  // Zdog.Text class
  class ZdogText extends Zdog.Shape {
    constructor(props) {
      // Set missing props to default values
      props = Zdog.extend({
        font: null,
        value: '',
        fontSize: 64,
        textAlign: 'left'
      }, props);
      // Split props
      const {
        font,
        value,
        fontSize,
        textAlign,
        ...shapeProps
      } = props;
      // Create shape object
      super({
        ...shapeProps,
        closed: true,
        visible: false, // hide until font is loaded
        path: []
      });
      this._font = null;
      this._value = value;
      this._fontSize = fontSize;
      this._textAlign = textAlign;
      this.font = font;
    }

    updateText() {
      this.path = this.font.getTextPath(this.value, this.fontSize, 0, 0, 0, this.textAlign, 'bottom');
      this.updatePath();
    }

    set font(newFont) {
      this._font = newFont;
      this.font.waitForLoad().then(() => {
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
  }

  ZdogText.optionKeys = ZdogText.optionKeys.concat(['font', 'fontSize', 'value', 'textAlign']);
  Zdog.Text = ZdogText;
  return Zdog;
}