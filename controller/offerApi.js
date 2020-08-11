
var materialuntil = require("../public/javascripts/common/materialuntil");
var materialinfo = materialuntil.materialinfo;
var eventEmitter = materialuntil.getEventEmitter();

const getclientip = (req) => {
    var match = req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    var ip;
    if (match === null) {
        ip = "localhost";
    } else {
        ip = match[0];
    }
    return ip;
}
const extend = (obj1, obj2) => {
    for (var key in obj2) {
        //if(obj1.hasOwnProperty(key))continue;//有相同的属性则略过 
        obj1[key] = obj2[key];
    }
    return obj1;
}



/** 接口相关 */
class offerApiController {

    async getUserData(req, res, next) {
        var ret;
        var table = materialinfo.getuseroffertable();

        ret = table[req.path] !== undefined ? {
            table: table[req.path].data
        } : {
                table: []
            };

        res.send(ret);
    }

    //参数多余ip:addDatabase ,updatetexture 
    //参数多余data:offerdata  clearUserOfferTable
    //updateUserOfferById
    async apiMain(req, res, next) {
        var ip = getclientip(req);
        var data = req.body;
        var _emitObj = { "materialinfo": materialinfo };
        var reqPostPath = ["addUserOffer", "deleteUserOffer", "copyUserOffer", "addDatabase", "updatetexture", "updatediscount"];
        var _reqPath = req.path || "";
        var _funName = _reqPath && _reqPath.indexOf("/") && _reqPath.subStr(1);
        var intRet = reqPostPath.slice().findIndex(i => i == _funName);
        var jsonMsgType = "";
        var _curEmitParam = {};

        if (intRet == 0) {
            _curEmitParam = {
                "data": data,
                "ip": ip,
                ..._emitObj
            }
            jsonMsgType = _funName == "updatediscount" ? "state" : "";
        }
        else if (_funName == "delStyles") {
            _curEmitParam = {
                "ids": data.ids,
                ..._emitObj
            }
        }
        else if (_funName == "offerdata" || _funName == "clearUserOfferTable") {
            _curEmitParam = {
                "ip": ip,
                ..._emitObj
            }
            jsonMsgType = "state";

        } else if (_funName == "updateUserOfferById") {
            _curEmitParam = {
                "data": data.data,
                "ip": ip,
                "id": data.id,
                ..._emitObj
            }

        } else {
            res.send("{\"state\":\"error\"}");
        }
        console.log(_funName + " req: ", data);
        eventEmitter.emit(_funName, _curEmitParam);
        var _strMsg = jsonMsgType == "state" ? "{\"state\":\"ok\"}" : "{\"response\":\"post " + _funName + " successfully\"}"
        res.send(_strMsg);

    }


    //get the option value from the added database or offer page will use this
    async optionvalue(req, res, next) {
        res.send(materialinfo.getoptionvalue());
    }

    //get the material info from the added database or offer page will use this
    async materialinfo(req, res, next) {
        console.log("materialinfo: ", materialinfo.getmaterial());
        res.send(materialinfo.getmaterial());
    }


    //废弃
    async pagematerial(req, res, next) {
        console.log("pagematerial: ", materialinfo.getpagematerial());
        res.send(JSON.stringify(materialinfo.getpagematerial()));
    }

    //database table will use this
    async demoTableUser(req, res, next) {
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var pagematerial = materialinfo.getpagematerial();
        var materialcommon = materialinfo.getmaterialscommon();
        var length = pagematerial.length;
        var minilength = (page - 1) * limit;
        var data = [];
        if (minilength < length) {
            if ((minilength + limit) < length) {
                console.log("enter the if, length: ", length, " minilength: ", minilength, " limit:", limit);
                data = pagematerial.slice(minilength, minilength + limit);
                //console.log("data: ", data);
            } else {
                console.log("enter the else, length: ", length, " minilength: ", minilength, " limit:", limit);
                data = pagematerial.slice(minilength);
                //console.log("data: ", data);
            }
            data.map(function (value) {
                extend(value, materialcommon[value.material]);
            })
        }
        var ret = {
            "code": 0,
            "msg": "",
            "count": length,
            "data": data
        };
        res.send(ret);
    }


    //save database will use this
    async save(req, res, next) {
        console.log("enter get save requrest");
        eventEmitter.emit("save", materialinfo);
        res.send("{\"response\":\"get save successfully\"}");
    }


    //export the offer will check whether the offer excel is ready.
    async checkoffer(req, res, next) {
        if (materialuntil.getsaveofferdata() === true) {
            res.send("{\"response\":\"ready\"}");
            materialuntil.setsaveofferdata(false);
        } else {
            res.send("{\"response\":\"not ready\"}");
        }
    }


    //user offer table will use this
    async demoTableOffer(req, res, next) {
        var ip = getclientip(req);
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var useroffertable = materialinfo.getuseroffertable();
        var discount = useroffertable[ip].discount;
        var usertable = useroffertable[ip].data;
        var length = usertable.length;
        var minilength = (page - 1) * limit;
        var data = [];
        var id = minilength + 1;
        if (minilength < length) {
            if ((minilength + limit) < length) {
                console.log("enter the if, length: ", length, " minilength: ", minilength, " limit:", limit);
                data = usertable.slice(minilength, minilength + limit);
                //console.log("data: ", data);
            } else {
                console.log("enter the else, length: ", length, " minilength: ", minilength, " limit:", limit);
                data = usertable.slice(minilength);
            }
            data.map(function (value) {
                value["id"] = id;
                console.log("discount: ", discount, " ,totalPrice: ", value.totalPrice);
                value["discountPrice"] = (value.totalPrice * discount).toFixed(2);
                id++;
            })
        }
        var ret = {
            "code": 0,
            "msg": "",
            "count": length,
            "data": data
        };
        res.send(ret);
    }



    // app.get('/getdiscount', function(req, res, next) {
    //   var ip = getclientip(req);
    //   var ret = {
    //     "discount": materialinfo.getpagematerial()[ip].discount
    //   }
    //   res.send(ret);
    // })

}

module.exports = new offerApiController();