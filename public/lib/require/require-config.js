require.config({　　　　
	paths: {　　　　　　
		jquery:  "lib/jquery/jquery-3.2.1.min",
		layer:'lib/layui/layui',
        contextMenu:'lib/contextMenu/jquery.contextMenu.min',
        frame:['lib/frame/js/fsDict','lib/frame/js/fs','lib/frame/js/main','js/main'],
        
	},
	 shim: {
        layer: {
            deps: [ 'css!lib/layui/css/layui.css']
        },
        contextMenu: {
            deps: ['css!lib/contextMenu/jquery.contextMenu.min.css']
        },
        frame:['css!css/fs.css']
    },　　
});

require(["jquery","layer","contextMenu","frame"], function(util) {
    // todo
});