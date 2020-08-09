const url = "http://" + location.host + "/";
var layer = null;
var vueTable = new Vue({
	el: '#lay-table',
	data: {
		rowparam: {}
	},
	methods: {
		addRow: function(param) {
			if(param.isRangeCalc === true) {
				var range = param.startLen + 'L' + param.endLen + '_' + param.startWid + 'W' + param.endWid + '_' + param.startDeep + 'D' + param.endDeep;
				var singlePrice = range + ":" + param.singlePrice;
				param.singlePrice = singlePrice;
			}
			console.log("enter the addRow");
			var match = $(".layui-laypage-count").text().match(/\d+/g);
			var model = {
				self: {
					material: param.curMaterial,
					name: param.curName,
					style: param.style,
					textures: [param.texture + "/" + param.singlePrice]
				},
				common: {
					types: [param.type + "/" + param.baseMulti],
					length: param.normalLen,
					width: param.normalWid,
					Deep: param.normalDeep,
					outLenBase: param.normalUpLen,
					outWidBase: param.normalUpWid,
					outDeepBase: param.normalUpDeep,
					outPriceBase: param.normalUpToPrice,
					unitmeas: param.curUnitmeas
				}
			};
			$.post(url + "addDatabase", model, function(data, status) {
				 console.log(`status is ${status}, and data is ${data.response}`);
				 if(match === null) {
					location.reload();
				} else {
					$(".layui-laypage-btn").click();
				}
				 layer.msg('添加成功！', {
					icon: 6
				  });
			});
		}
	}

});

layui.use(['layer','table'], function(){
	layer = layui.layer;
	var table = layui.table;

	//监听表格复选框选择
	table.on('checkbox(demo)', function(obj){
	  console.log(obj)
	});
	//监听工具条
	table.on('tool(demo)', function(obj){
	  var data = obj.data;
	  console.log(obj);
	  if(obj.event === 'del'){
		layer.confirm('真的删除行么', function(index){
			$.post(url + "delStyles", {ids: [data.id]}, function(data, status) {
				console.log(`status is ${status}, and data is ${data.response}`);
				var curPage = $($(".layui-laypage-curr").find('em[class!="layui-laypage-em"]')).text();
				console.log("curpage: ", curPage);
				if($(".layui-table").find('tr[data-index]').length === 0) {
					location.reload();
				} else {
					$(".layui-laypage-btn").click();
				}
			});
			obj.del();
			layer.close(index);
		});
	  } else if(obj.event === 'edit'){
		vueTable.rowparam = data;
		layer.open({
			type: 2,
			maxmin: true,
			btn:['保存'],
			anim: 1,
			title: "编辑材料",
			area: ['550px', '330px'],
			zIndex: layer.zIndex, //重点1
			content: '/common/editmaterial.html',
			success: function(layero, index) {
				console.log("enter the success");
			},
			yes: function(index, layero) {
				var param = {
					"id": $(layero).find('iframe')[0].contentWindow.textureId.value,
					"texture": $(layero).find('iframe')[0].contentWindow.texture.value
				};
				console.log("enter the editRow, id: ", param.id, " texture: ", param.texture);
				$.post(url + "updatetexture", param, function(data, status) {
					console.log(`status is ${status}, and data is ${data.response}`);
					$(".layui-laypage-btn").click();
					//location.reload();
				});
				layer.close(index);
			},
			cancel: function(layero, index) {
				console.log("enter the cancel");
			},
			end: function() {
				console.log("enter the end");
			}
		});
	  }
	});
	
	var $ = layui.$, active = {
	  delselected: function(){ //获取选中数据
		var checkStatus = table.checkStatus('idTest')
		var data = checkStatus.data;
		var indexs = (data.map(value => { return value.id;}));
		layer.confirm('删除所选行吗', function(index){
			$.post(url + "delStyles", {ids: indexs}, function(data, status) {
				console.log(`status is ${status}, and data is ${data.response}`);
				var curPage = $($(".layui-laypage-curr").find('em[class!="layui-laypage-em"]')).text();
				console.log("curpage: ", curPage);
				if($(".layui-table").find('tr[data-index]').length === 0) {
					location.reload();
				} else {
					$(".layui-laypage-btn").click();
				}
			});
		});
	  }
	  ,addDatabase: function(){ //获取选中数目
		//点击事件
		layer.open({
			type: 2,
			maxmin: true,
			anim: 1,
			title: "添加材料",
			area: ['1050px', '430px'],
			zIndex: layer.zIndex, //重点1
			content: '/common/addmaterial.html'
		});
	  }
	  ,save: function(){ //验证是否全选
		layer.open({
			type: 2,
			maxmin: true,
			btn:['保存'],
			anim: 1,
			title: "保存",
			area: ['550px', '330px'],
			zIndex: layer.zIndex, //重点1
			content: '/common/password.html',
			success: function(layero, index) {
				console.log("enter the success");
			},
			yes: function(index, layero) {
				var param = {
					"password": $(layero).find('iframe')[0].contentWindow.password.value
				};
				console.log("enter the password: ", param.password);
				if(param.password === "123456") {
					$.get(url + "save", function(data, status) {
						console.log(`${data.response} and status is ${status}`);
						$(".layui-laypage-btn").click();
						layer.msg('保存成功！', {
							icon: 6
						});
					});
				} else {
					layer.msg('密码错误！', {
						icon: 0
					});
				}
				layer.close(index);
			},
			cancel: function(layero, index) {
				console.log("enter the cancel, ");
			},
			end: function() {
				console.log("enter the end");
			}
		});
	  }
	};
	
	$('.demoTable .layui-btn').on('click', function(){
	  var type = $(this).data('type');
	  active[type] ? active[type].call(this) : '';
	});
  });