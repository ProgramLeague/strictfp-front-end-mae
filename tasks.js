let path = require('path');

let through2 = require('through2'),
    less = require('gulp-less'),
    Autoprefix = require('less-plugin-autoprefix');


function tpl(props) {
    return `
    (function(){
        var props = ${JSON.stringify(props)};
        var defaultLang = 'ja-jp';
        var userLang = navigator.language.toLowerCase();
        window.i18n = function(key,lang){
            lang = lang || defaultLang;
            var value = props[lang][key];
            return value ? value : key;
        }
    })();
    `;
}

exports.i18n = function () {
    let trans = {};
    let last;
    return through2.obj(
        function (chunk, encoding, cb) {
            last = chunk;
            let lines = chunk.contents.toString(encoding).split(/\r?\n/);
            let lang, props = {};
            for (let line of lines) {
                if (/^\$language:/.test(line)) {
                    lang = line.substring(10);
                } else {
                    let index = line.indexOf(':');
                    if (index > 0) {
                        props[line.substr(0, index)] = line.substring(index + 1).trim();
                    }
                }
            }
            trans[lang] = props;
            cb();
        },
        function (cb) {
            if (last) {
                let f = last.clone({ contents: false });
                f.path = path.join(last.base, 'i18n.js');
                f.contents = Buffer.from(tpl(trans));
                this.push(f);
            }
            cb();
        }
    );
}

exports.style = function () {
    let gulpLess = less({
        paths: path.join(__dirname, 'src', 'less'),
        plugins: [new Autoprefix({ browsers: ['last 5 versions'] })]
    });
    let proxy = through2.obj(function (chunk, encoding, cb) {
        if (/\.less$/.test(chunk.path)) {
            gulpLess.write(chunk);
            gulpLess.once('data', (v) => {
                this.push(v);
            })
        } else {
            this.push(chunk);
        }
        cb();
    });
    return proxy;
}

exports.addLicHead = function () {
    // i'm going to add a string to each file's beginning.
    let str = `/**
*  strictly-mae.
*  Copyright (C) 2017  AkimotoAkari
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/`;
    //Now let's do it. Where are the codes?
}