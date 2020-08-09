var index = 0;
var editflag = false;
const url = "http://" + location.host + "/";



const _totalPrice = (param, optionTotal, fixedNum) => {
	var fixedNum = fixedNum || 0;
	return fixedNum == 0 ? (param.singlePrice * param.calcNum + optionTotal).toFixed(fixedNum) : (param.singlePrice * param.calcNum).toFixed(fixedNum) + optionTotal;
}

function singlecal(unitmeas) {
	return {
		calcUnitmeas: unitmeas,
		calcmethod: function (param, optionTotal) {
			param.calcNum = param.num;
			param.totalPrice = _totalPrice(param, optionTotal, 0);
		}
	}
}
const unitmeasMap = {
	"樘": singlecal("樘"),
	"个": singlecal("个"),
	"组": singlecal("组"),
	"付": singlecal("付"),
	"把": singlecal("把"),
	"合": singlecal("合"),
	"套": {
		calcUnitmeas: "米",
		calcmethod: function (param, optionTotal) {
			param.calcNum = ((parseInt(param.realLen) * 2 + parseInt(param.realWid)) * param.num / 1000.0).toFixed(2);
			param.totalPrice = _totalPrice(param, optionTotal, 2);
		}
	},
	"块": {
		calcUnitmeas: "平方",
		calcmethod: function (param, optionTotal) {
			var square = param.realLen * param.realWid / 1000000.0;
			console.log("平方：", square);
			if (square < 0.3) {
				square = 0.3;
			}
			console.log("真实平方：", square);
			param.calcNum = (square * param.num).toFixed(2);
			param.totalPrice = _totalPrice(param, optionTotal, 2);
		}
	},
	"根": {
		calcUnitmeas: "米",
		calcmethod: function (param, optionTotal) {
			var length;
			if (param.realLen <= 1200) {
				length = 1200;
			} else if (param.realLen <= 2400) {
				length = 2400;
			} else if (param.realLen <= 3200) {
				length = 3200;
			} else {
				length = param.realLen;
			}
			param.calcNum = (length * param.num / 1000.0).toFixed(2);
			param.totalPrice = _totalPrice(param, optionTotal, 2);
		}
	}
};
var edit = new Vue({
	el: '#vue-edit',
	data: {
		paramModel: JSON.parse(JSON.stringify(emptyModel)),
		obj: {},
		option: "",
		optionArr: [{}]
	},
	/**
	 * 属性计算
	 */
	computed: {


		/**
		 * 计算材料价格
		 */
		baseprice: function () {
			console.log("cal: ", this.paramModel.basePrice);
			return this.paramModel.basePrice;
		},
		upToLength: function () {
			if (this.paramModel.curMaterial === '') {
				return 0;
			}
			this.paramModel.realUpLen = calUpToSize(this.paramModel.realLen, this.obj[this.paramModel.curMaterial].length);
			console.log("up to length", this.paramModel.realUpLen);
			calcBasePrice(this.paramModel);
			return this.paramModel.realUpLen;
		},
		upToWidth: function () {
			if (this.paramModel.curMaterial === '') {
				return 0;
			}
			this.paramModel.realUpWid = calUpToSize(this.paramModel.realWid, this.obj[this.paramModel.curMaterial].width);
			console.log("up to width", this.paramModel.realUpWid);
			calcBasePrice(this.paramModel);
			return this.paramModel.realUpWid;
		},
		upToDeep: function () {
			if (this.paramModel.curMaterial === '') {
				return 0;
			}
			this.paramModel.realUpDeep = calUpToSize(this.paramModel.realDeep, this.obj[this.paramModel.curMaterial].Deep);
			console.log("up to deep", this.paramModel.realUpDeep);
			calcBasePrice(this.paramModel);
			return this.paramModel.realUpDeep;
		},
		baseMultiPrice: function () {
			return this.paramModel.baseMulti;
		},
		upToPrice: function () {
			var uptoprice = 0;
			var _curMaterial = this.paramModel.curMaterial;
			var _obj = typeof _curMaterial !== "undefined" && this.obj[_curMaterial];

			if (this.paramModel.realUpDeep > 0 && _obj.outDeepBase !== '0') {
				uptoprice += Math.ceil(this.paramModel.realUpDeep / _obj.outDeepBase) * _obj.outPriceBase;
			}
			if (this.paramModel.realUpWid > 0 && _obj.outWidBase !== '0') {
				uptoprice += Math.ceil(this.paramModel.realUpWid / _obj.outWidBase) * _obj.outPriceBase;
			}
			if (this.paramModel.realUpLen > 0 && _obj.outLenBase !== '0') {
				uptoprice += Math.ceil(this.paramModel.realUpLen / _obj.outLenBase) * _obj.outPriceBase;
			}
			this.paramModel.realUpToPrice = uptoprice;
			return uptoprice;
		},
		singleTotalPrice: function () {
			var totalprice = 0;
			if (this.paramModel.basePrice !== '') {
				totalprice = this.paramModel.basePrice * this.paramModel.baseMulti + this.paramModel.realUpToPrice;
			}
			var optionTotal = 0;
			this.optionArr.forEach(function (value) {
				if (value.calMethod === "按单价计算") {
					optionTotal += value.price;
				}
			});
			console.log("enter the singleTotalPrice function, optionTotal: ", optionTotal);
			this.paramModel.singlePrice = (totalprice + optionTotal).toFixed(2);
			return this.paramModel.singlePrice;
		},
		calcNum: function () {
			console.log("enter the calcNum function.");
			var optionTotal = 0;
			this.optionArr.forEach(function (value) {
				if (value.calMethod === "按总价计算") {
					optionTotal += value.price;
				}
			});
			if (unitmeasMap[this.paramModel.unitmeas] !== undefined) {
				console.log("enter the calcNum function if condition, optionTotal: ", optionTotal);
				this.paramModel.calcUnitmeas = unitmeasMap[this.paramModel.unitmeas].calcUnitmeas;
				unitmeasMap[this.paramModel.unitmeas].calcmethod(this.paramModel, optionTotal);
			}
			return this.paramModel.calcNum;
		},
		totalPrice: function () {
			console.log("enter the total price, ", this.paramModel.totalPrice);
			return this.paramModel.totalPrice;
		}
	},
	watch: {
	}
});

layui.use(['layer', 'form', 'element'], function () {
	var layer = layui.layer;
	var form = layui.form;
	var element = layui.element;

	//监听下拉框材料
	form.on('select(material)', function (data) {
		console.log("select material: ", data.value);
		delAllOpsInSel("#nametype");
		edit.paramModel.names = Object.keys(edit.obj[data.value].name);
		addTipOpsInSel("#nametype", edit.paramModel.names, "请输入型号");
		delAllOpsInSel("#baseMulti");
		edit.paramModel.baseMultis = Object.keys(edit.obj[data.value].type);
		addTipOpsInSel("#baseMulti", edit.paramModel.baseMultis, "请输入形状");
		delAllOpsInSel("#style");
		delAllOpsInSel("#texture");
		edit.paramModel.unitmeas = edit.obj[data.value].unitmeas;
		edit.paramModel.curMaterial = data.value;
		edit.paramModel.curName = "";
		edit.paramModel.basePrice = "";
		edit.paramModel.baseMultiPrice = "";
		edit.paramModel.baseMulti = "";
		edit.paramModel.textureCalc = "";
		checkAndSetZeroForLenWidDeep(edit.obj[data.value], edit.paramModel);
		form.render();
	});

	form.on('select(name)', function (data) {
		console.log("select name: ", data.value);
		if ("0" === data.value) {
			edit.paramModel.curName = "";
			return;
		}
		edit.paramModel.basePrice = "";
		edit.paramModel.curName = data.value;
		delAllOpsInSel("#style");
		console.log("styles: ", edit.obj[edit.paramModel.curMaterial].name[data.value]);
		edit.paramModel.styles = Object.keys(edit.obj[edit.paramModel.curMaterial].name[data.value]);
		addTipOpsInSel("#style", edit.paramModel.styles, "请输入类型");
		delAllOpsInSel("#texture");
		edit.paramModel.textureCalc = "";
		form.render();
	});

	form.on('select(style)', function (data) {
		console.log("select style: ", data.value);
		if ("0" === data.value) {
			edit.paramModel.style = "";
			return;
		}
		edit.paramModel.basePrice = "";
		edit.paramModel.style = data.value;
		delAllOpsInSel("#texture");
		edit.paramModel.textures = Object.keys(edit.obj[edit.paramModel.curMaterial].name[edit.paramModel.curName][data.value]);
		addTipOpsInSel("#texture", edit.paramModel.textures, "请输入材质");
		edit.paramModel.textureCalc = "";
		form.render();
	});

	form.on('select(texture)', function (data) {
		console.log("select texture: ", data.value);
		if ("0" === data.value) {
			edit.paramModel.texture = "";
			return;
		}
		edit.paramModel.basePrice = "";
		edit.paramModel.texture = data.value;
		edit.paramModel.textureCalc = edit.obj[edit.paramModel.curMaterial].name[edit.paramModel.curName][edit.paramModel.style][data.value];
		calcBasePrice(edit.paramModel);
	});

	form.on('select(baseMulti)', function (data) {
		console.log("select type: ", data.value);
		if ("0" === data.value) {
			edit.paramModel.type = '';
			edit.paramModel.baseMulti = 0;
			return;
		}
		edit.paramModel.type = data.value;
		edit.paramModel.baseMulti = edit.obj[edit.paramModel.curMaterial].type[data.value];
		console.log("baseMulti: ", edit.paramModel.baseMulti);
	});

	form.on('submit(save)', function (data) {
		top.window.frames["offer"].vueTable.addRow(edit.paramModel, editflag, edit.optionArr);
		//parent.vueTable.addRow(edit.paramModel);
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	})

	var dtd = $.Deferred(); // 新建一个deferred对象
	var wait = function (dtd) {
		var tasks = function () {
			dtd.resolve(); // 改变deferred对象的执行状态
		};
		setTimeout(tasks, 500);
		return dtd;
	};

	//初始化下拉列表
	$.when(wait(dtd)).then(function () {
		return new Promise(function (resolve, reject) {
			$.get(url + "optionvalue", function (data, status) {
				console.log("get option value: ", data);
				edit.option = data;
				return resolve();
			});
		});
	}).then(function () {
		return new Promise(function (resolve, reject) {
			$.get(url + "materialinfo", function (data, status) {
				console.log("get info: ", data);
				return resolve(data);
			});
		});
	}).then(function (req) {
		var data = top.window.frames["offer"].vueTable.editdata;
		edit.obj = req.material;
		if (data === undefined) {
			console.log("editdata is undefined");
			initCaculate();
		} else {
			editflag = true;
			console.log("editdata: ", data);
			initEditCalc(data);
		}
	}).then(function () {
		form.render('select');
	});
	$("#box").on('click', '.addp', function () {
		var addP = $(this).parent().clone(true);
		addP.children('#optionType').empty();
		$(this).parent().after(addP);
		$('#pp a').each(function (i, e) {
			$(e).text(i + 1);
		});
		edit.optionArr.push({});
	});
	$("#box").on("click", '.delp', function () {
		var index = $(this).parent().children("a").text();
		console.log("delete index: ", index);
		if ($("#box").find('.delp').length > 1) {
			edit.optionArr.splice(parseInt(index) - 1, 1);
			$(this).parent().remove();
			$('#pp a').each(function (i, e) {
				$(e).text(i + 1);
			})
		}
	});

	$("#calMethod").change(function () {
		var index = $(this).parent().children("a").text();
		var calMethod = $(this).children('option:selected').val();
		console.log("select the cal method: ", calMethod);
		where = $(this).parent().find("#optionType");
		delAllOpsInSel("#optionType", where);
		if (calMethod !== "0") {
			addTipOpsInSel("#optionType", Object.keys(edit.option[calMethod]), "请选择附加值", where);
		} else {
			edit.optionArr[parseInt(index) - 1] = {};
		}
		// using to refresh the price
		edit.paramModel.singlePrice = 0;
	});

	$("#optionType").change(function () {
		var index = $(this).parent().children("a").text();
		var optionType = $(this).children('option:selected').val();
		console.log("enter the option type: ", optionType);
		if (optionType !== "0") {
			var calMethod = $(this).parent().find("#calMethod").children('option:selected').val();
			console.log("calMethod: ", calMethod, ", optionType: ", optionType);
			var pushVal = {
				"calMethod": calMethod,
				"optionType": optionType,
				"price": edit.option[calMethod][optionType]
			};
			edit.optionArr[parseInt(index) - 1] = pushVal;
		} else {
			edit.optionArr[parseInt(index) - 1] = {};
		}

		edit.paramModel.singlePrice = 0;
	});

});

function initOptions(options) {
	var ret = [];
	if ((options !== "") && (options !== undefined)) {
		var splitOp = options.split(";");
		splitOp.forEach(function (value) {
			if (value !== "") {
				ret.push({});
				var split = value.split("/");
				var pushVal = {
					"calMethod": split[0],
					"optionType": split[1],
					"price": parseInt(split[2])
				};
				ret[ret.length - 1] = pushVal;
			}

		});
	}
	return ret;
}

function initOptionTab(options) {
	console.log("Edit the options length is ", options.length);
	addTipOpsInSel("#calMethod", Object.keys(edit.option), "请选择计算方式");
	if (options.length === 0)
		return;
	$("#calMethod").val(options[0].calMethod);
	addTipOpsInSel("#optionType", Object.keys(edit.option[options[0].calMethod]), "请选择附加值");
	$("#optionType").val(options[0].optionType);
	var parent = $("#box").find(".addp").parent();

	for (var i = 1; i < options.length; i++) {
		console.log("option: ", options[i]);
		var addP = parent.clone(true);
		addP.children('#optionType').empty();
		//addP.children('#calMethod').append(new Option("请选择计算方式", "0"));
		addTipOpsInSel("#calMethod", Object.keys(edit.option), "请选择计算方式", addP.children('#calMethod'));
		addP.children("#calMethod").val(options[i].calMethod);
		addTipOpsInSel("#optionType", Object.keys(edit.option[options[i].calMethod]), "请选择附加值", addP.children('#optionType'));
		addP.children("#optionType").val(options[i].optionType);
		parent = parent.after(addP);
	}

	$('#pp a').each(function (i, e) {
		$(e).text(i + 1);
	});
}

/**
 * edit button initial
 */
function initEditCalc(data) {
	edit.paramModel = { ...data };
	edit.paramModel.materials = Object.keys(edit.obj);
	addOpsInSel("#material", edit.paramModel.materials);
	$("#material").val(data.curMaterial);
	edit.paramModel.names = Object.keys(edit.obj[data.curMaterial].name);
	//edit.paramModel.curMaterial = data.curMaterial;
	addTipOpsInSel("#nametype", edit.paramModel.names, "请输入型号");
	$("#nametype").val(data.curName);
	edit.paramModel.styles = Object.keys(edit.obj[data.curMaterial].name[data.curName]);
	//edit.paramModel.curName = data.curName;
	addTipOpsInSel("#style", edit.paramModel.styles, "请输入类型");
	$("#style").val(data.style);
	edit.paramModel.textures = Object.keys(edit.obj[data.curMaterial].name[data.curName][data.style]);
	//edit.paramModel.style = data.style;
	addTipOpsInSel("#texture", edit.paramModel.textures, "请输入材质");
	$("#texture").val(data.texture);
	edit.paramModel.baseMultis = Object.keys(edit.obj[data.curMaterial].type);
	//edit.paramModel.texture = data.texture;
	addTipOpsInSel("#baseMulti", edit.paramModel.baseMultis, "请输入类型");
	$("#baseMulti").val(data.type);
	edit.optionArr = initOptions(data.options);
	initOptionTab(edit.optionArr);
	// edit.paramModel.type = data.type;
	// edit.paramModel.curMaterial = data.curMaterial;
	// edit.paramModel.curName = data.curName;
	edit.paramModel.unitmeas = edit.obj[edit.paramModel.curMaterial].unitmeas;
	// edit.paramModel.basePrice = data.basePrice;
	// edit.paramModel.calcNum = data.calcNum;
	// edit.paramModel.calcUnitmeas = data.calcUnitmeas;
	// edit.paramModel.usage = data.usage;
	// edit.paramModel.num = data.num;
	// edit.paramModel.realDeep = data.realDeep;
	// edit.paramModel.realLen = data.realLen;
	// edit.paramModel.realWid = data.realWid;
	// edit.paramModel.realUpDeep = data.realUpDeep;
	// edit.paramModel.realUpLen = data.realUpLen;
	// edit.paramModel.realUpWid = data.realUpWid;
	// edit.paramModel.singlePrice = data.singlePrice;
	// edit.paramModel.singleTotalPrice = data.singleTotalPrice;
	// edit.paramModel.totalPrice = data.totalPrice;
	// edit.paramModel.baseMulti = data.baseMulti;
	edit.paramModel.textureCalc = edit.obj[edit.paramModel.curMaterial].name[edit.paramModel.curName][edit.paramModel.style][edit.paramModel.texture];
}

function checkAndSetZeroForLenWidDeep(checkdata, dist) {
	dist.realLen = checkdata.length === "0" ? "0" : "";
	dist.realWid = checkdata.width === "0" ? "0" : "";
	dist.realDeep = checkdata.Deep === "0" ? "0" : "";
}

/**
 * 初始化计算结果
 */
function initCaculate() {
	edit.paramModel.materials = Object.keys(edit.obj);
	addOpsInSel("#material", edit.paramModel.materials);
	edit.paramModel.names = Object.keys(edit.obj[edit.paramModel.materials[0]].name);
	addTipOpsInSel("#nametype", edit.paramModel.names, "请输入型号");
	edit.paramModel.baseMultis = Object.keys(edit.obj[edit.paramModel.materials[0]].type);
	addTipOpsInSel("#baseMulti", edit.paramModel.baseMultis, "请输入类型");
	edit.paramModel.curMaterial = edit.paramModel.materials[0];
	edit.paramModel.curName = "";
	edit.paramModel.unitmeas = edit.obj[edit.paramModel.curMaterial].unitmeas;
	checkAndSetZeroForLenWidDeep(edit.obj[edit.paramModel.materials[0]], edit.paramModel);

	addTipOpsInSel("#calMethod", Object.keys(edit.option), "请选择计算方式");
}

function delAllOpsInSel(selId, where) {
	var where = where || $(selId);
	where.empty();
}

function addOneOpInSel(selId, value, text, where) {
	if (where === undefined) {
		where = $(selId);
	}
	where.append(new Option(text, value));
}

function addOpsInSel(selId, values, where) {
	if (where === undefined) {
		where = $(selId);
	}
	var len = values.length;
	for (var i = 0; i < len; i++) {
		var value = values[i];
		addOneOpInSel(selId, value, value, where);
	}
}

function addTipOpsInSel(selId, values, tip, where) {
	if (where === undefined) {
		where = $(selId);
	}
	addOneOpInSel(selId, "0", tip, where);
	addOpsInSel(selId, values, where);
}

function calUpToSize(realsize, norsize) {
	var upsize = realsize - norsize;
	return upsize > 0 ? upsize : 0;
}

function isInRange(range, num, type) {
	var tmp = range.split(type);
	if (tmp[1] === "0") {
		return true;
	} else {
		if ((parseInt(tmp[0]) <= num) && (parseInt(tmp[1]) >= num)) {
			return true;
		} else {
			return false;
		}
	}
}

function calcBasePrice(paramModel) {
	var flag = typeof paramModel.textureCalc === "object" ? "true" : paramModel.textureCalc === "" ? "uninitial" : "false";
	if (flag === "false") {
		paramModel.basePrice = paramModel.textureCalc;
	} else if (flag === "true") {
		paramModel.realUpLen = 0;
		paramModel.realUpWid = 0;
		paramModel.realUpDeep = 0;
		paramModel.basePrice = "";
		if ((paramModel.realLen !== "") && (paramModel.realWid !== "") && (paramModel.realDeep !== "")) {
			var elem = Object.keys(paramModel.textureCalc).find(function (value) {
				var array = value.split("_");
				return isInRange(array[0], parseInt(paramModel.realLen), "L") && isInRange(array[1], parseInt(paramModel.realWid), "W") && isInRange(array[2], parseInt(paramModel.realDeep), "D");
			});
			if (elem !== undefined) {
				paramModel.basePrice = paramModel.textureCalc[elem];
			}
		}
	}
}