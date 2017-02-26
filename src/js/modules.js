window.mae = {
	params: {},
	position: "",
	aget: function( api, onprogress ) {

	},
	onlinktap: function(e){
		var href = $(this).attr("href");

		//after all
		e.preventDefault();
	},
	dark: function(t){
		$("#darkfantasies").fadeIn(t||200);
	},
	undark: function(t){
		$("#darkfantasies").fadeOut(t||200);
	},
	/**
	 * @author AkimotoAkari
	 * @param {String} title 提示框标题
	 * @param {String} html 提示框内容
	 * @param {array} btns 提示框按钮数组。为空时为一个确认。每一个元素：[ 文字 , 点击handler(提示框this) ]，handler为空默认关闭。
	 */
	showAlert: function( title, html, btns ) {
		var closeMe = function(me) {
			me.fadeOut(200);
		};
		title = title || i18n("showalert-title-alert");
		html = html || i18n("showalert-html-hw");
		btns = btns || [ i18n("showalert-btns-ok"), closeMe ];
	}
};

var packageByAction = {
	"*": [],
	"timeline": [ "timeline" ],
	"article": [ "markdown", "article" ],
	"login": [ "login", /*"security"*/ ],
}

//常用模块已经挤成一堆了。
window.modules = {
	init: function(){
		//first get params
		//URL参数在服务器端是不会处理的
		var temp1, i, j;
		var pairs = location.search.slice(1).split("&");
		for( i = 0; i < pairs.length; i++ ) {
			//pairs[i]: "param=value";
			temp1 = pairs[i].split("=");
			temp1[0] = decodeURIComponent( temp1[0] );
			temp1[1] = decodeURIComponent( temp1[1] );
			mae.params[ temp1[0] ] = temp1[1];
		}

		mae.position = location.hash.slice(1);

		modules.dispatch();
	},
	dispatch: function(){
		//首先干掉链接
		$("a").live( "tap", mae.onlinkclick );

		//看看什么鬼动作

	},
};