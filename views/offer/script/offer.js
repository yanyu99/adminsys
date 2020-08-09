var layer = null;
const url = "http://" + location.host + "/";

var vueTable = new Vue({
	el: '#vue-offer',
	data: {
		discount: 1.0,
		editdata: undefined
	},
	methods: {
		addRow: function (param, editflag, options) {
			console.log("enter the addRow");
			var match = $(".layui-laypage-count").text().match(/\d+/g);
			var model = {
				...emptyModel,
				...param,
				options
			};
			// var model = {
			// 	// id: (match === null ? 0 : parseInt(match[0])) + 1,
			// 	usage: param.usage,
			// 	curMaterial: param.curMaterial,
			// 	curName: param.curName,
			// 	style: param.style,
			// 	texture: param.texture,
			// 	type: param.type,
			// 	num: param.num,
			// 	unitmeas: param.unitmeas,
			// 	calcNum: param.calcNum,
			// 	calcUnitmeas: param.calcUnitmeas,
			// 	realLen: param.realLen,
			// 	realWid: param.realWid,
			// 	realDeep: param.realDeep,
			// 	realUpLen: param.realUpLen,
			// 	realUpWid: param.realUpWid,
			// 	realUpDeep: param.realUpDeep,
			// 	basePrice: param.basePrice,
			// 	baseMulti: param.baseMulti,
			// 	realUpToPrice: param.realUpToPrice,
			// 	singlePrice: param.singlePrice,
			// 	totalPrice: param.totalPrice,
			// 	options: options
			// };
			if (editflag === false) {
				$.post(url + "addUserOffer", model, function (data, status) {
					console.log(`status is ${status}, and data is ${data.response}`);
					if (match === null) {
						location.reload();
					} else {
						$(".layui-laypage-btn").click();
					}
					layer.msg('添加成功！', {
						icon: 6
					});
				});
			} else {
				console.log("model: ", model);
				$.post(url + "updateUserOfferById", { id: vueTable.editdata.id, data: model }, function (data, status) {
					console.log(`status is ${status}, and data is ${data.response}`);
					$(".layui-laypage-btn").click();
					layer.msg('编辑成功！', {
						icon: 6
					});
				});
			}

		}
	},
	/**
	 * 属性计算
	 */
	computed: {
		actdiscount: function () {
			console.log("enter the actdiscount");
			$.post(url + "updatediscount", { discount: this.discount }, function (data, status) {
				console.log(`status is ${status}, and data is ${data.response}`);
			});
			$(".layui-laypage-btn").click();
		}
	}

});

function checkoffer() {
	$.get(url + "checkoffer", function (data, status) {
		if (data.response === "ready") {
			//通过创建a标签实现
			var link = document.createElement("a");
			link.href = "/outputfile/test.xlsx";
			//对下载的文件命名
			link.download = "test.xlsx";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			window.setTimeout(checkoffer, 500);
		}
	});
}

layui.use(['layer', 'table'], function () {
	layer = layui.layer;
	var table = layui.table;

	//监听工具条
	table.on('tool(userOffer)', function (obj) {
		var data = obj.data;
		console.log(obj);
		if (obj.event === 'edit') {
			vueTable.editdata = data;
			top.layer.open({
				type: 2,
				maxmin: true,
				anim: 1,
				title: "编辑材料",
				area: ['1050px', '530px'],
				zIndex: layer.zIndex, //重点1
				content: '/offer/edit.html',
				success: function (layero, index) {
					console.log("enter the success");
				},
				yes: function (index, layero) {
					console.log("enter the yes");
				},
				end: function () {
					console.log("enter the end");
					vueTable.editdata = undefined;
				}
			});
		} else if (obj.event === 'copy') {
			$.post(url + "copyUserOffer", { index: data.id }, function (data, status) {
				console.log(`status is ${status}, and data is ${data.response}`);
				$(".layui-laypage-btn").click();
				layer.msg('复制成功！', {
					icon: 6
				});
			})
		} else if (obj.event === 'delete') {
			layer.confirm('真的删除行么', function (index) {
				$.post(url + "deleteUserOffer", { index: data.id }, function (data, status) {
					console.log(`status is ${status}, and data is ${data.response}`);
					var curPage = $($(".layui-laypage-curr").find('em[class!="layui-laypage-em"]')).text();
					console.log("curpage: ", curPage);
					if ($(".layui-table").find('tr[data-index]').length === 3) {
						location.reload();
					} else {
						$(".layui-laypage-btn").click();
					}
				});
				layer.close(index);
			});
		}
	});

	var $ = layui.$, active = {
		add: function () { //获取选中数据
			top.layer.open({
				type: 2,
				maxmin: true,
				anim: 1,
				title: "添加材料",
				area: ['1050px', '530px'],
				zIndex: layer.zIndex, //重点1
				content: '/offer/edit.html',
				success: function (layero, index) {
					console.log("enter the success");
				},
				yes: function (index, layero) {
					console.log("enter the yes");
				}
			});
		},
		excel: function () {
			$.get(url + "offerdata", function (data, status) {
				console.log(`status is ${data}`);
				window.setTimeout(checkoffer, 500);
			});
		},
		clear: function () {
			layer.confirm('确定清空报价数据么', function (index) {
				$.get(url + "clearUserOfferTable", function (data, status) {
					console.log(`status is ${data}`);
				});
				location.reload();
				layer.close(index);
			});
		}
	}

	$('.userOffer .layui-btn').on('click', function () {
		var type = $(this).data('type');
		active[type] ? active[type].call(this) : '';
	});
});