var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var eventEmitter = require("./emitterEvent");
var Excel = require("exceljs");

var saveofferdata = false;

function convNameToObj(name) {
    var ret = {};

    Object.keys(name).map(function(value) {
        ret[value] = name[value];
    });

    return ret;
}

function convToPageMaterial(data) {
    var pagematerials = [];
    var materialscommon = {};
    var id = 1;
    if(data.material !== undefined) {
        Object.keys(data.material).map(function(value) {
            var pagematerial = {};
            pagematerial["material"] = value;
            materialscommon[value] = {};
            var common = materialscommon[value];
            common["unitmeas"] = data.material[value].unitmeas;
            common["length"] = data.material[value].length;
            common["width"] = data.material[value].width;
            common["Deep"] = data.material[value].Deep;
            common["outDeepBase"] = data.material[value].outDeepBase;
            common["outLenBase"] = data.material[value].outLenBase;
            common["outWidBase"] = data.material[value].outWidBase;
            common["outPriceBase"] = data.material[value].outPriceBase;
            common["types"] = [];
            Object.keys(data.material[value].type).map(function(type) {
                common.types.push(type + '/' + data.material[value].type[type]);
            });

            var names = Object.keys(data.material[value].name);
            names.map(function(name){
                pagematerial["name"] = name;
                Object.keys(data.material[value].name[name]).map(function(style) {
                    pagematerial["style"] = style;
                    pagematerial["textures"] = [];
                    Object.keys(data.material[value].name[name][style]).map(function(texture){
                        var textureobj = data.material[value].name[name][style][texture];
                        if(typeof textureobj === "object") {
                            var values = "";
                            Object.keys(textureobj).map(function(key) {
                                if(values !== "") {
                                    values += ";";
                                }
                                values += key + ":" + textureobj[key];
                            });
                            pagematerial.textures.push(texture + "/" + values);
                        } else {
                            pagematerial.textures.push(texture + "/" + textureobj);
                        }
                    });
                    pagematerial["id"] = id++;
                    pagematerials.push(JSON.parse(JSON.stringify(pagematerial)));
                });
            });
        });
    } else {
        console.log("can't find the material info");
    }
    return {
        "pagematerials": pagematerials,
        "materialscommon": materialscommon
    }
}

function storeTexture(init, curValue) {
    var value = curValue.split("/");
    if(value[1].indexOf(":") !== -1) {
        //console.log("enter the : condition")
        init[value[0]] = {};
        var array = value[1].split(";");
        //console.log(": array is ", array);
        array.forEach(function(elem) {
            var tmp = elem.split(":");
            //console.log(": tmp is ", tmp);
            init[value[0]][tmp[0]] = tmp[1];
        });
    } else {
        init[value[0]] = value[1];
    }
    return init;
}

function revToJsonMaterial(pageMaterials, commonMaterials) {
    console.log("enter the revToJsonMaterial");
    var toJson;
    if(pageMaterials.length > 0) {
        toJson = {
            "material": {}
        }
    } else {
        toJson = {
            "material": ""
        }
        return toJson;
    }

    pageMaterials.forEach(function(pagematerial) {
        var common = commonMaterials[pagematerial.material];
        if(toJson.material[pagematerial.material] === undefined) {
            toJson.material[pagematerial.material] = {
                "name": {
                    [pagematerial.name]: {
                        [pagematerial.style]: pagematerial.textures.reduce(function(init, curValue){
                            return storeTexture(init, curValue);
                        }, {})
                    }
                },
                "unitmeas": common.unitmeas,
                "length": common.length,
                "width": common.width,
                "Deep": common.Deep,
                "type": common.types.reduce(function(init, curValue){
                    var value = curValue.split("/");
                    init[value[0]] = value[1];
                    return init;
                }, {}),
                "outDeepBase": common.outDeepBase,
                "outLenBase": common.outLenBase,
                "outWidBase": common.outWidBase,
                "outPriceBase": common.outPriceBase
            };
        } else {
            if(toJson.material[pagematerial.material]["name"][pagematerial.name] === undefined) {
                toJson.material[pagematerial.material]["name"][pagematerial.name] = {
                    [pagematerial.style]: pagematerial.textures.reduce(function(init, curValue){
                        return storeTexture(init, curValue);
                    }, {})
                };
            } else if(toJson.material[pagematerial.material]["name"][pagematerial.name][pagematerial.style] === undefined) {
                toJson.material[pagematerial.material]["name"][pagematerial.name][pagematerial.style] = 
                pagematerial.textures.reduce(function(init, curValue){
                    return storeTexture(init, curValue);
                }, {});
            }
        }
    });
    return toJson;
}

var materialinfo = function() {
    this.initMaterialInfo();
    this.initUserOfferTable();
    this.initOptionValue();
}

materialinfo.prototype.initOptionValue = function() {
    var that = this;
    fs.readFileAsync("./public/inputfile/optionValue.json", "utf-8")
    .then(function(data) {
        that.optionValue = JSON.parse(data);
    }).catch(function(err) {
        if(err) {
            console.log("read optionValue file failed, err: ", err);
            process.exit(1);
        }
    });
}

materialinfo.prototype.initUserOfferTable = function() {
    var that = this;
    fs.readFileAsync("./public/inputfile/userOfferTable.json", "utf-8")
    .then(function(data) {
        that.userOfferTable = JSON.parse(data);
    }).catch(function(err) {
        if(err) {
            console.log("read userOfferTable file failed, err: ", err);
            process.exit(1);
        }
    });
}

materialinfo.prototype.writeUserOfferTable = function(table) {
    return fs.writeFileAsync("./public/inputfile/userOfferTable.json", JSON.stringify(table, null, 4)).then(function(){
        console.log("write userOfferTable file successfully");
    }).catch(function(err) {
        console.log("write file error:", err);
    });
}

materialinfo.prototype.initMaterialInfo = function() {
    var that = this;
    fs.readFileAsync("./public/inputfile/material.json", "utf-8")
    .then(function(data) {
        data = data.replace(/\ +/g,  "");
        data = data.replace(/[\n]/g, "");
        data = data.replace(/[\r]/g, "");
        data = data.replace(/[\t]/g, "");
        that.material = data;
        console.log("read file: ", data);
        return data;
      }).then(function(data) {
          var ret = convToPageMaterial(JSON.parse(data));
          that.pagematerial = ret.pagematerials;
          that.materialscommon = ret.materialscommon;
          console.log("pagematerial: ", JSON.stringify(that.pagematerial, null, 4));
          console.log("mapmaterials: ", JSON.stringify(that.materialscommon, null, 4));
      }).catch(function(err) {
        if(err) {
          console.log("read file failed, err: ", err);
          process.exit(1);
        }
      });
}

materialinfo.prototype.getmaterial = function() {
    return this.material;
}

materialinfo.prototype.getpagematerial = function() {
    return this.pagematerial;
}

materialinfo.prototype.getmaterialscommon = function() {
    return this.materialscommon;
}

materialinfo.prototype.getuseroffertable = function() {
    return this.userOfferTable;
}

materialinfo.prototype.getoptionvalue = function() {
    return this.optionValue;
}

eventEmitter.on("save", function(info) {
     var data = revToJsonMaterial(info.getpagematerial(), info.getmaterialscommon());
     fs.writeFileAsync("./public/inputfile/material.json", JSON.stringify(data, null, 4)).then(function(){
         console.log("write file successfully");
         info.initMaterialInfo();
     }).catch(function(err) {
         console.log("write file error:", err);
     });
});

function checkItemNeedModify(baseitem, newitem) {
    var ret = {
        flag: true,
        index: undefined,
        operation: "base"
    };
    var type = newitem.split("/");
    baseitem.forEach(function(base, index) {
        var basesplit = base.split("/");
        if(type[0] === basesplit[0]) {
            var isRangeNew = type[1].indexOf(":") !== -1;
            var isRangeBase = basesplit[1].indexOf(":") !== -1;
            //both have no ":" substring
            if(!isRangeNew && !isRangeBase) {
                if(type[1] !== basesplit[1]) {
                    ret.index = index;
                } else {
                    ret.flag = false;
                }
            } else if(isRangeBase && isRangeNew) { // both have ":" substring
                var baseArray = basesplit[1].split(";");
                var newArray = type[1].split(":");
                ret.index = index;
                ret.operation = "add";
                baseArray.forEach(function(value) {
                    //has the same range
                    if(value.indexOf(newArray[0]) !== -1) {
                        ret.operation = "replace";
                    }
                });
            } else { // only one has ":" substring
                ret.index = index;
            }
            
        }
    });
    return ret;
}

function checkAndModify(base, item) {
    var ret = checkItemNeedModify(base, item);
    if(ret.flag === true) {
        if(ret.index === undefined) {
            base.push(item);
        } else {
            if(ret.operation === "base") {
               base[ret.index] = item; 
            } else if(ret.operation === "add") {
                base[ret.index] += ";" + item.split("/")[1];
            } else if(ret.operation === "replace") {
                var array = base[ret.index].split(";");
                var itemArr = item.split(":");
                var index = array.findIndex(function(value) {
                    return value.indexOf(itemArr[0]) !== -1;
                });
                array[index] = item;
                base[ret.index] = array.join(";");
            }
        }
    }
}

function insertOneDatabase(database, common, data) {
    var findMaterialInd = undefined;
    var findNameInd = undefined;
    //find the material
    var found = database.find(function(item) {
        if(item.material === data.self.material) {
            findMaterialInd = item.id;
            if(item.name === data.self.name) {
                findNameInd = item.id;
                if(item.style === data.self.style) {
                    return true;
                }
            }
        }
        return false;
    });

    if(found !== undefined) {
        console.log("find the style");
        checkAndModify(common[found.material].types, data.common.types[0]);
        checkAndModify(found.textures, data.self.textures[0]);
    }else if((findNameInd !== undefined) || (findMaterialInd !== undefined)) {
        console.log("find the name and material or just find the material");
        checkAndModify(common[database[findMaterialInd - 1].material].types, data.common.types[0]);
        data.self["id"] = database.length + 1;
        database.push(data.self);
    }else {
        console.log("not find the material");
        data.self["id"] = database.length + 1;
        database.push(data.self);
        common[data.self.material] = data.common;
    }
    
}

function optionsToStr(srcObj)
{
    var retStr = "";
    var options = srcObj;
    if(options !== undefined)
    {
        var toStr = "";
        options.forEach(function(value) {
            if(value !== {}) {
                toStr += value.calMethod + "/" + value.optionType + "/" + value.price + ";";
            }
        });
        retStr = toStr;
        console.log("option to str: ", toStr);
    }
    return retStr;
}

eventEmitter.on("addUserOffer", function(data) {
    console.log(`event emitter add user offer, data: ${data.data}`);
    data.data.options = optionsToStr(data.data.options);

    var table = data.materialinfo.getuseroffertable();
    if(table[data.ip] === undefined) {
        table[data.ip] = {
            "discount": 1.0,
            "data": []
        };
    }
    table[data.ip].data.push(data.data);
    data.materialinfo.writeUserOfferTable(table);
});

eventEmitter.on("updateUserOfferById", function(data) {
    console.log(`event emitter update user offer by id, data: ${data.data}, id: ${data.id}`);
    data.data.options = optionsToStr(data.data.options);
    var table = data.materialinfo.getuseroffertable();
    table[data.ip].data[data.id - 1] = data.data;
    data.materialinfo.writeUserOfferTable(table);
});

eventEmitter.on("deleteUserOffer", function(data) {
    console.log(`event emitter delete user offer, data: ${data.data}`);
    var table = data.materialinfo.getuseroffertable();
    table[data.ip].data.splice(parseInt(data.data.index) - 1, 1);
    data.materialinfo.writeUserOfferTable(table);
});

eventEmitter.on("copyUserOffer", function(data) {
    console.log(`event emitter copy user offer, data: ${data.data}`);
    var table = data.materialinfo.getuseroffertable();
    var singledata = JSON.parse(JSON.stringify(table[data.ip].data[parseInt(data.data.index) - 1]));
    table[data.ip].data.push(singledata);
    data.materialinfo.writeUserOfferTable(table);
});

eventEmitter.on("addDatabase", function(data) {
    console.log(`event emitter add database, data: ${data.data}`);
    insertOneDatabase(data.materialinfo.getpagematerial(), data.materialinfo.getmaterialscommon(), data.data);
});

eventEmitter.on("updatetexture", function(data) {
    console.log(`event emitter update texture, id: ${data.data.id}, texture: ${data.data.texture}`);
    data.materialinfo.getpagematerial()[data.data.id - 1].textures = data.data.texture.split(",");
});

function leftSortById(array, id) {
    for(var i = id - 1; i < array.length; i++) {
        array[i].id = i + 1;
    }
}

eventEmitter.on("delStyles", function(data) {
    console.log(`event emitter delete style, ids: ${data.ids}`);
    var delCount = 0;
    var pagematerial = data.materialinfo.getpagematerial();
    Promise.each(data.ids, function(id) {
        pagematerial.splice([id - 1 - delCount], 1);
        leftSortById(pagematerial, id - delCount);
        delCount++;
    });
});

var filterdata = function(tables, discount) {
    var data = [];
    if(tables.length > 0) {
        tables.forEach(function(table, index) {
            var obj = [index, table.usage, table.curName, table.curMaterial, table.realLen, table.realWid, table.realDeep, table.num,
                    table.unitmeas, table.calcNum, table.calcUnitmeas, table.singlePrice, table.totalPrice, discount, 
                    (table.totalPrice * discount).toFixed(2), table.style, " ", table.options];
            data.push(obj);
        })
    }
    return data;
};

eventEmitter.on("offerdata", function(data) {
    var workbook = new Excel.Workbook();
    var table = data.materialinfo.getuseroffertable();
    var filter = filterdata(table[data.ip].data, table[data.ip].discount);
    workbook.xlsx.readFile("./public/inputfile/excel.xlsx")
    .then(function() {
        var worksheet = workbook.getWorksheet(1);
        return filter.map(function(value, index) {
        console.log("index: ", index, " value: ", value);
        worksheet.getRow(5 + parseInt(index)).values = value;
        });
    }).then(function() {
        console.log("enter the write file");
        return workbook.xlsx.writeFile("./public/outputfile/test.xlsx");
    }).then(function() {
        console.log("save offer data successfully");
        saveofferdata = true;
    }).catch(function(err) {
        console.log("save offer data failed");
        saveofferdata = false;
    });
});

eventEmitter.on("updatediscount", function(data) {
    console.log("update discount");
    var table = data.materialinfo.getuseroffertable();
    table[data.ip].discount = data.data.discount;
    data.materialinfo.writeUserOfferTable(table);
})

eventEmitter.on("clearUserOfferTable", function(data) {
    console.log("clear user offer data");
    var table = data.materialinfo.getuseroffertable();
    table[data.ip].data = [];
    data.materialinfo.writeUserOfferTable(table);
});

var getEventEmitter = function() {
    return eventEmitter.getInstance();
}

var getsaveofferdata = function() {
    return saveofferdata;
}

var setsaveofferdata = function(flag) {
    saveofferdata = flag;
}

module.exports = {
    materialinfo: new materialinfo(),
    getEventEmitter: getEventEmitter,
    getsaveofferdata: getsaveofferdata,
    setsaveofferdata: setsaveofferdata
};

