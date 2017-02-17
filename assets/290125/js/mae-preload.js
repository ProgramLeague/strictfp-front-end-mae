var preloadList = {
	"script": [
		"jquery.min",
		"resLoader",
		"modules",
		"device.min",
		"i18n",
	],
	"css": [],
	"assets": []
};

var LDEBUG = (function(){
	try{
		return DEBUG;
	} catch(e) {
		return true;
	}
})();

var buildCssElem = function( assetOnload, url ){
	var elem = document.createElement("link");
	elem.rel = "stylesheet";
	elem.type = "text/css";
	elem.href = url;
	return elem;
};

/**
 *
 * @param {Array} preloadList
 * @param {String|null} filemime
 * @param {String} element
 * @param {Function} onallcomplete
 * @param {boolean} minify
 * @param {String} extname
 * @param {String} assetdir
 * @param {Function} funcCreateElem
 * @returns {Function}
 */
var createPreloader = function( preloadList, filemime, element, onallcomplete, minify, extname, assetdir, funcCreateElem ){
	var preloadingElemsLength = 0;

	var assetsOnload = function(){
		preloadingElemsLength--;
		if( preloadingElemsLength < 1 ) {
			onallcomplete();
		}
	};

	//build script paths
	return function(){
		var o, elem;

		for( var i = 0; i < preloadList.length; i++ ) {
			o = preloadList[i];
			if ( minify && o.indexOf(".min") < 0 && !LDEBUG ) o += ".min";
			o = cAssetRoot + "/" + assetdir + "/" + o + "." + extname;

			if ( funcCreateElem ) 
				elem = funcCreateElem( assetsOnload, o ); 
			else {
				switch( filemime ) {
					case "text/css":
						elem = buildCssElem( assetsOnload, o );
						break;
					case "text/javascript":
					default:
						elem = document.createElement( element );
						elem.onload = assetsOnload;
						elem.type = filemime;
						elem.src = o;
				}
			}
			document.body.appendChild( elem );
			preloadingElemsLength++;
		}
	};
};

createPreloader( preloadList.script, "text/javascript", "script", function(){
	modules.init();
}, true, "js", "js" )();

createPreloader( preloadList.css, "text/css", "link", function(){}, true, "css", "css" )();