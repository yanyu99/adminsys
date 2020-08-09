var app = require('express');
var path = require('path');


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

const getCurFName = (fn) => {
    return (/^[\s\(]*function(?:\s+([\w$_][\w\d$_]*))?\(/).exec(fn.toString())[1] || '';
}

const userOfferDataOp = (res, req, jsonMsg, emitData) => {
    var ip = getclientip(req);
    var data = req.body;
    var _curFuncName = getCurFName(arguments.callee);
    if (!_curFuncName) {
        return
    }
    console.log(_curFuncName + " req: ", data);
    eventEmitter.emit(_curFuncName,
        {
            "materialinfo": materialinfo,
            "data": data,
            "ip": ip,
            ...emitData
        });
    res.send(jsonMsg);
    //res.send("{\"response\":\"post " + _curFuncName + " successfully\"}");
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


    async addUserOffer(req, res, next) {
        var jsonMsg = "{\"response\":\"post addUserOffer successfully\"}";
        userOfferDataOp(res, req, jsonMsg);
    }

    async deleteUserOffer(req, res, next) {
        var jsonMsg = "{\"response\":\"post deleteUserOffer successfully\"}";
        userOfferDataOp(res, req, jsonMsg);
    }
    //copy user offer will use this
    async copyUserOffer(req, res, next) {

        var jsonMsg = "{\"response\":\"post copyUserOffer successfully\"}";
        userOfferDataOp(res, req, jsonMsg);

    }

    //update user offer by id will use this
    async updateUserOfferById(req, res, next) {
        var data = req.body;
        var jsonMsg = "{\"response\":\"post updateUserOfferById successfully\"}";
        userOfferDataOp(res, req, jsonMsg, {
            "data": data.data,
            "id": data.id
        });
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

    //add database will use this
    async addDatabase(req, res, next) {
        var jsonMsg = "{\"response\":\"post addDatabase successfully\"}";
        userOfferDataOp(res, req, jsonMsg);  //参数多余 ip
    }


    //save database will use this
    async save(req, res, next) {
        console.log("enter get save requrest");
        eventEmitter.emit("save", materialinfo);
        res.send("{\"response\":\"get save successfully\"}");
    }


    //edit texture in the database will use this
    async updatetexture(req, res, next) {
        var jsonMsg = "{\"response\":\"post updatetexture successfully\"}";
        userOfferDataOp(res, req, jsonMsg);  //参数多余 ip
    }



    //del styles in the database will use this
    async delStyles(req, res, next) {
        var jsonMsg = "{\"response\":\"post delStyles successfully\"}";
        userOfferDataOp(res, req, jsonMsg, {
            "ids": data.ids
        });  //参数多余data
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


    async offerdata(req, res, next) {
        var jsonMsg = "{\"state\":\"ok\"}";
        userOfferDataOp(res, req, jsonMsg); //多余参数data
    }

    async updatediscount(req, res, next) {
        var jsonMsg = "{\"state\":\"ok\"}";
        userOfferDataOp(res, req, jsonMsg);
    }


    // app.get('/getdiscount', function(req, res, next) {
    //   var ip = getclientip(req);
    //   var ret = {
    //     "discount": materialinfo.getpagematerial()[ip].discount
    //   }
    //   res.send(ret);
    // })

    //clear the offer data then save into the excel
    async clearUserOfferTable(req, res, next) {
        var jsonMsg = "{\"state\":\"ok\"}";
        userOfferDataOp(res, req, jsonMsg);//多余参数data
    }
}

module.exports = new offerApiController();