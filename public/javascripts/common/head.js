/**
 * 获取当前项目路径
 */
function getHostPath() {
	//获取当前网址，如： http://localhost:8083/myproj/view/my.jsp
	var curWwwPath = window.document.location.href;
	
	//获取主机地址之后的目录，如： myproj/view/my.jsp
	var pathName = window.document.location.pathname;
	
	var pos = curWwwPath.lastIndexOf(pathName);
	//获取主机地址，如： http://localhost:8083
	var localhostPaht = curWwwPath.substring(0, pos);
	return localhostPaht;
}

var host = getHostPath();
var config = [{
		type: 'style',
		url: '/lib/layui/css/layui.css'
	},
	{
		type: 'style',
		url: '/stylesheets/style.css'
	},
	{
		type: 'style',
		url: '/lib/icons-custom/iconfont.css'
	},
	{
		type: 'script',
		url: '/lib/jquery/jquery-3.2.1.min.js'
	},
	{
		type: 'script',
		url: '/lib/layui/layui.js'
	},
	{
		type: 'script',
		url: '/lib/frame/js/fsDict.js?v=1.6.2'
	},
	{
		type: 'script',
		url: '/lib/frame/js/fs.js?v=1.6.2'
	},
	{
		type: 'script',
		url: '/lib/frame/js/frame.js?v=1.5.0'
	}
];
var str = "";
str += '<meta charset="UTF-8">';
str += '<meta content="text/html;charset=UTF-8"/>';
str += '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>';
str += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>';

for(var i = 0; i < config.length; i++) {
	if(config[i].type == "style") {
		str += '<link rel="stylesheet" type="text/css" href="' + host + config[i].url + '" media="all" />';
	} else {
		str += '<script type="text/javascript" src="' + host + config[i].url + '"></script>';
	}
}

document.write(str);