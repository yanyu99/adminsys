var index = 0;
const unitmeaslist = ["套", "块", "根", "樘", "个", "米", "组", "付", "把", "合"];
const url = "http://" + location.host + "/";
var edit = new Vue({
	el: '#vue-add',
	data: {
		paramModel: {
			materials: [],
			curMaterial: '', //材料
			names: [],
			curName: '', //型号
			styles: [],
			style: '', //类型
			textures: [],
			texture: '', //材质
			baseMultis: [],
			type: '', //形状
			baseMulti: '',
			normalLen: '',
			normalWid: '',
			normalDeep: '',
			startLen: 0,
			startWid: 0,
			startDeep: 0,
			endLen: 0,
			endWid: 0,
			endDeep: 0,
			normalUpLen: '',
			normalUpWid: '',
			normalUpDeep: '',
			normalUpToPrice: '',
			singlePrice: '',
			curUnitmeas: '',
			isRangeCalc: false
		},
		obj: {}
	},
	/**
	 * 属性计算
	 */
	computed: {
        newMaterial: function() {
            console.log("enter new material: ", this.paramModel.curMaterial);
            //document.getElementById("material").disabled=true; 
		},
	    unitmeas: function() {
            console.log("enter unitmeas: ", this.paramModel.curUnitmeas);
            return this.paramModel.curUnitmeas;
        },
        nametype: function() {
            console.log("enter nametype: ", this.paramModel.curName);
            return this.paramModel.curName;
        },
        style: function() {
            console.log("enter style: ", this.paramModel.style);
            return this.paramModel.style;
        },
        texture: function() {
            console.log("enter texture: ", this.paramModel.texture);
            return this.paramModel.texture;
        },
        normalLen: function() {
            console.log("enter normalLen: ", this.paramModel.normalLen);
            return this.paramModel.normalLen;
        },
        normalWid: function() {
            console.log("enter normalWid: ", this.paramModel.normalWid);
            return this.paramModel.normalWid;
        },
        normalDeep: function() {
            console.log("enter normalDeep: ", this.paramModel.normalDeep);
            return this.paramModel.normalDeep;
        },
        startLen: function() {
			console.log("enter startLen: ", this.paramModel.startLen);
            return this.paramModel.startLen;
        },
        startWid: function() {
			console.log("enter startWid: ", this.paramModel.startWid);
            return this.paramModel.startWid;
        },
        startDeep: function() {
			console.log("enter startDeep: ", this.paramModel.startDeep);
            return this.paramModel.startDeep;
        },
        endLen: function() {
            console.log("enter endLen: ", this.paramModel.endLen);
            return this.paramModel.endLen;
        },
        endWid: function() {
            console.log("enter endWid: ", this.paramModel.endWid);
            return this.paramModel.endWid;
        },
        endDeep: function() {
            console.log("enter endDeep: ", this.paramModel.endDeep);
            return this.paramModel.endDeep;
        },
        normalUpLen: function() {
            console.log("enter normalUpLen: ", this.paramModel.normalUpLen);
            return this.paramModel.normalUpLen;
        },
        normalUpWid: function() {
            console.log("enter normalUpWid: ", this.paramModel.normalUpWid);
            return this.paramModel.normalUpWid;
        },
        normalUpDeep: function() {
            console.log("enter normalUpDeep: ", this.paramModel.normalUpDeep);
            return this.paramModel.normalUpDeep;
        },
        normalUpToPrice: function() {
            console.log("enter normalUpToPrice: ", this.paramModel.normalUpToPrice);
            return this.paramModel.normalUpToPrice;
        },
        type: function() {
            console.log("enter type: ", this.paramModel.type);
            return this.paramModel.type;
        },
        baseMulti: function() {
            console.log("enter baseMulti: ", this.paramModel.baseMulti);
            return this.paramModel.baseMulti;
        },
        singlePrice: function() {
            console.log("enter singlePrice: ", this.paramModel.singlePrice);
            return this.paramModel.singlePrice;
        }
	},
	watch: {
		// paramModel: {　　　　
		// 	handler(newValue, oldValue) {　
		// 		console.log("index: ", index);
		// 		if(index > 0) {
		// 			localStorage.setItem("paramModel", JSON.stringify(newValue));　
		// 			if(index > 999999) {
		// 				index = 1;
		// 			}
		// 		}
		// 		index++;
		// 	},
		// 	deep: true
		// }
	}
});

layui.use(['layer', 'form', 'element'], function() {
	var layer = layui.layer;
	var form = layui.form;
	var element = layui.element;
	var notRangleCalcElems = ["#normalLen", "#normalWid", "#normalDeep", "#normalUpLen", "#normalUpWid", "#normalUpDeep", "#normalUpToPrice"];
	var rangeCalcElems = ["#startLen", "#startWid", "#startDeep", "#endLen", "#endWid", "#endDeep"];
	var notNewMaterialElems = ["#materialname", "#unitmeas"];
	var newMaterialElems = ["#newmaterial", "#selunitmeasname"];

	form.on('switch(asRangeCalc)', function(data) {
		console.log("enter the checkbox: ", data.elem.checked);
		var flag = data.elem.checked;
		edit.paramModel.isRangeCalc = flag;
		setStyles(notRangleCalcElems, flag === true ? "display:none" : "display:online");
		setStyles(rangeCalcElems, flag === true ? "display:online" : "display:none");
	});

	form.on('switch(addneworold)', function(data) {
		console.log("enter the checkbox: ", data.elem.checked);
		var flag = data.elem.checked;
		setStyles(notNewMaterialElems, flag === true ? "display:none" : "display:online");
		setStyles(newMaterialElems, flag === true ? "display:online" : "display:none");
		$("#normalLen").attr("readonly", false);
		$("#normalWid").attr("readonly", false);
		$("#normalDeep").attr("readonly", false);
		$("#normalUpLen").attr("readonly", false);
		$("#normalUpWid").attr("readonly", false);
		$("#normalUpDeep").attr("readonly", false);
		$("#normalUpToPrice").attr("readonly", false);
		$("#selunitmeas").get(0).selectedIndex = 0;
		$("#material").get(0).selectedIndex = 0;
		edit.paramModel.curMaterial = '';
		edit.paramModel.curName = '';
        edit.paramModel.style = '';
        edit.paramModel.texture = '';
        edit.paramModel.singlePrice = '';
        edit.paramModel.type = '';
		edit.paramModel.baseMulti = '';
		edit.paramModel.startLen = 0;
        edit.paramModel.startWid = 0;
		edit.paramModel.startDeep = 0;
		edit.paramModel.endLen = 0;
        edit.paramModel.endWid = 0;
        edit.paramModel.endDeep = 0;
        edit.paramModel.normalLen = '';
        edit.paramModel.normalWid = '';
        edit.paramModel.normalDeep = '';
        edit.paramModel.normalUpLen = '';
        edit.paramModel.normalUpWid = '';
        edit.paramModel.normalUpDeep = '';
		edit.paramModel.normalUpToPrice = '';
		edit.paramModel.curUnitmeas = '';
		form.render();
	});

	//监听下拉框材料
	form.on('select(material)', function(data) {
        console.log("material value: ", data.value);
        if(data.value === "0") {
			edit.paramModel.curMaterial = "";
            return;
        }
		$("#normalLen").attr("readonly", true);
		$("#normalWid").attr("readonly", true);
		$("#normalDeep").attr("readonly", true);
		$("#normalUpLen").attr("readonly", true);
		$("#normalUpWid").attr("readonly", true);
		$("#normalUpDeep").attr("readonly", true);
		$("#normalUpToPrice").attr("readonly", true);
		$("#unitmeas").attr("readonly", true);
		edit.paramModel.curMaterial = data.value;
        edit.paramModel.curName = Object.keys(edit.obj[data.value].name)[0];
        edit.paramModel.style = Object.keys(edit.obj[data.value].name[edit.paramModel.curName])[0];
		edit.paramModel.texture = Object.keys(edit.obj[data.value].name[edit.paramModel.curName][edit.paramModel.style])[0];
		var texture = edit.obj[data.value].name[edit.paramModel.curName][edit.paramModel.style][edit.paramModel.texture];
		var flag = typeof texture === "object";
		edit.paramModel.singlePrice = "0";
		if(edit.paramModel.isRangeCalc === false) {
			if(flag === false) {
				edit.paramModel.singlePrice = texture;
			}
		} else {
			if(flag === true) {
				edit.paramModel.singlePrice = texture[Object.keys(texture)[0]];
			}
		}
        edit.paramModel.type = Object.keys(edit.obj[data.value].type)[0];
        edit.paramModel.baseMulti = edit.obj[data.value].type[edit.paramModel.type];
        edit.paramModel.normalLen = edit.obj[data.value].length;
        edit.paramModel.normalWid = edit.obj[data.value].width;
        edit.paramModel.normalDeep = edit.obj[data.value].Deep;
        edit.paramModel.normalUpLen = edit.obj[data.value].outLenBase;
        edit.paramModel.normalUpWid = edit.obj[data.value].outWidBase;
        edit.paramModel.normalUpDeep = edit.obj[data.value].outDeepBase;
		edit.paramModel.normalUpToPrice = edit.obj[data.value].outPriceBase;
		edit.paramModel.curUnitmeas = edit.obj[data.value].unitmeas;
        form.render();
	});

	form.on('select(selunitmeas)', function(data) {
		console.log("select unit meas: ", data.value);
		edit.paramModel.curUnitmeas = data.value;
		form.render();
	});

	form.on('select(style)', function(data) {
		
	});

	form.on('select(texture)', function(data) {
		
	});

	form.on('select(baseMulti)', function(data) {
		
	});

	form.on('submit(save)', function(data) {
		parent.vueTable.addRow(edit.paramModel);
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	})

	//初始化下拉列表
	$.when($.get(url + "materialinfo", function(data, status) {
		console.log("get info: ", data);
		return data;
	})).then(function(req) {
		//req = JSON.parse(req);
		console.log("xiaowei req: ", Object.keys(req));
		edit.obj = req.material;
		initCaculate();
	}).then(function() {
		form.render('select');
	});

});

/**
 * 初始化计算结果
 */
function initCaculate() {
	edit.paramModel.materials = Object.keys(edit.obj);
	addTipOpsInSel("#selunitmeas", unitmeaslist, "请选择计量单位");
    if(edit.paramModel.materials.length > 0) {
        addTipOpsInSel("#material", edit.paramModel.materials, "请选择材料");
    } else {
        addOneOpInSel("#material", "0", "没有材料");
    }
}

function delAllOpsInSel(selId) {
	$(selId).empty();
}

function addOneOpInSel(selId, value, text) {
	console.log("add option text: ", text, ", value: ", value);
	$(selId).append(new Option(text, value));
}

function addOpsInSel(selId, values) {
	var len = values.length;
	for(var i = 0; i < len; i++) {
		var value = values[i];
        addOneOpInSel(selId, value, value);
	}
}

function addTipOpsInSel(selId, values, tip) {
	addOneOpInSel(selId, "0", tip);
	addOpsInSel(selId, values);
}

function calUpToSize(realsize, norsize) {
	var upsize = realsize - norsize;
	return upsize > 0 ? upsize : 0;
}

function setStyles(array, style) {
	array.map(function(value) {
		$(value).attr("style", style);
		$(value + "Label").attr("style", style);
	});
}