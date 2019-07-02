import { version, description } from './package.json';
import filesize from 'rollup-plugin-filesize';
import buble from 'rollup-plugin-buble';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const build = process.env.BUILD || "development";
const devserver = process.env.DEV_SERVER || false;
const esmodule = process.env.ES_MODULE || false;
const prod = build === "production";

const banner = `/*!
 * Zfont v${version}
 * ${description}
 * 2019 James Daniel
 * MIT Licensed 
 * github.com/jaames/zfont
 */
`

module.exports = {
  input: 'src/index.js',
  output: [
    esmodule ? {
      file: 'dist/zfont.es.js',
      format: 'es',
      name: 'Zfont',
      banner: banner,
      sourcemap: true,
      sourcemapFile: 'dist/zfont.es.map'
    } : {
      file: prod ? 'dist/zfont.min.js' : 'dist/zfont.js',
      format: 'umd',
      name: 'Zfont',
      banner: banner,
      sourcemap: true,
      sourcemapFile: prod ? 'dist/zfont.min.js.map' : 'dist/zfont.js.map'
    }
  ].filter(Boolean),
  plugins: [
    alias({
      resolve: ['.jsx', '.js']
    }),
    replace({
      VERSION: JSON.stringify(version),
      PROD: prod ? 'true' : 'false',
      DEV_SERVER: devserver ? 'true' : 'false'
    }),
    buble({
      jsx: 'h',
      objectAssign: 'Object.assign',
      transforms: {
      }
    }),
    nodeResolve(),
    commonjs(),
    !prod && devserver ? serve({
      contentBase: ['dist', 'demo']
    }) : false,
    !prod && devserver ? livereload() : false,
    // show filesize stats when building dist files
    !devserver ? filesize() : false,
    // only minify if we're producing a non-es production build
    prod && !esmodule ? uglify({
      output: {
        comments: function(node, comment) {
          if (comment.type === 'comment2') {
            // preserve banner comment
            return /\!/i.test(comment.value);
          }
          return false;
        }
      }
    }) : false,
  ].filter(Boolean)
};