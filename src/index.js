import { registerFontClass } from './ZdogFont';
import { registerTextClass } from './ZdogText';
import { registerTextGroupClass } from './ZdogTextGroup';

export default {
  init(Zdog) {
    // Global font list to keep track of all fonts
    Zdog.FontList = [];

    // Helper to wait for all fonts to load
    Zdog.waitForFonts = function() {
      return Promise.all(Zdog.FontList.map(font => font.waitForLoad()));
    };
    
    // Register Zfont classes onto the Zdog object
    registerFontClass(Zdog);
    registerTextClass(Zdog);
    registerTextGroupClass(Zdog);

    return Zdog;
  },
  version: VERSION,
}

// add dev server flag to the window object
// this will be stripped in production builds
if (DEV_SERVER) {
  window.isDevServer = true;
}