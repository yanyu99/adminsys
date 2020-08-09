var edit = new Vue({
	el: '#vue-editmaterial',
	data: {
		paramModel: {
			id: 0,
			texture: ''
		}
	},
	/**
	 * 属性计算
	 */
	computed: {
	},
	watch: {
	}
});

layui.use(['form'], function() {
	var form = layui.form;

	// form.on('submit(save)', function(data) {
	// 	parent.vueTable.editRow(edit.paramModel);
	// 	var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
	// 	parent.layer.close(index); //再执行关闭   
	// 	return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	// })
	var dtd = $.Deferred(); // 新建一个deferred对象
    var wait = function(dtd){
　　　　var tasks = function(){
　　　　　　dtd.resolve(); // 改变deferred对象的执行状态
　　　　};
　　　　setTimeout(tasks,500);
　　　　return dtd;
    };

	//初始化下拉列表
	$.when(wait(dtd)).then(function() {
		edit.paramModel.id = parent.vueTable.rowparam.id;
		edit.paramModel.texture = parent.vueTable.rowparam.textures;
		console.log("xiaowei ", edit.paramModel.texture);
	});

});