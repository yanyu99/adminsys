
var app = express();

var materialuntil = require("./public/javascripts/common/materialuntil");

var materialinfo = materialuntil.materialinfo;
var eventEmitter = materialuntil.getEventEmitter();

function getclientip(req) {
    var match = req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    var ip;
    if (match === null) {
        ip = "localhost";
    } else {
        ip = match[0];
    }
    return ip;
}

//get original user offer table
app.get('/getuserdata', function (req, res, next) {
    console.log(JSON.stringify(req));
    var ip = getclientip(req);
    var ret;
    var table = materialinfo.getuseroffertable();

    if (table[req.path] !== undefined) {
        ret = {
            table: table[req.path].data
        };
    } else {
        ret = {
            table: []
        };
    }
    res.send(ret);
});

//add user offer will use this
app.post('/addUserOffer', function (req, res, next) {
    var ip = getclientip(req);
    var data = req.body;
    console.log("addUserOffer req: ", data);
    eventEmitter.emit("addUserOffer",
        {
            "materialinfo": materialinfo,
            "data": data,
            "ip": ip
        });
    res.send("{\"response\":\"post addUserOffer successfully\"}");
});

//delete user offer will use this
app.post('/deleteUserOffer', function (req, res, next) {
    var ip = getclientip(req);
    var data = req.body;
    console.log("deleteUserOffer req: ", data);
    eventEmitter.emit("deleteUserOffer",
        {
            "materialinfo": materialinfo,
            "data": data,
            "ip": ip
        });
    res.send("{\"response\":\"post deleteUserOffer successfully\"}");
});

//copy user offer will use this
app.post('/copyUserOffer', function (req, res, next) {
    var ip = getclientip(req);
    var data = req.body;
    console.log("copyUserOffer req: ", data);
    eventEmitter.emit("copyUserOffer",
        {
            "materialinfo": materialinfo,
            "data": data,
            "ip": ip
        });
    res.send("{\"response\":\"post copyUserOffer successfully\"}");
});

//update user offer by id will use this
app.post('/updateUserOfferById', function (req, res, next) {
    var ip = getclientip(req);
    var data = req.body;
    console.log("updateUserOfferById req: ", data);
    eventEmitter.emit("updateUserOfferById",
        {
            "materialinfo": materialinfo,
            "data": data.data,
            "ip": ip,
            "id": data.id
        });
    res.send("{\"response\":\"post updateUserOfferById successfully\"}");
});

//get the option value from the added database or offer page will use this
app.get('/optionvalue', function (req, res, next) {
    console.log("optionvalue: ", materialinfo.getoptionvalue());
    res.send(materialinfo.getoptionvalue());
});

//get the material info from the added database or offer page will use this
app.get('/materialinfo', function (req, res, next) {
    console.log("materialinfo: ", materialinfo.getmaterial());
    res.send(materialinfo.getmaterial());
});

//废弃
app.get('/pagematerial', function (req, res, next) {
    console.log("pagematerial: ", materialinfo.getpagematerial());
    res.send(JSON.stringify(materialinfo.getpagematerial()));
});

var extend = function (obj1, obj2) {
    for (var key in obj2) {
        //if(obj1.hasOwnProperty(key))continue;//有相同的属性则略过 
        obj1[key] = obj2[key];
    }
    return obj1;
}
//database table will use this
app.get('/demo/table/user', function (req, res, next) {
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
})

//add database will use this
app.post('/addDatabase', function (req, res, next) {
    var data = req.body;
    console.log("addDatabase req: ", data);
    eventEmitter.emit("addDatabase",
        {
            "materialinfo": materialinfo,
            "data": data
        });
    res.send("{\"response\":\"post addDatabase successfully\"}");
});

//save database will use this
app.get('/save', function (req, res, next) {
    console.log("enter get save requrest");
    eventEmitter.emit("save", materialinfo);
    res.send("{\"response\":\"get save successfully\"}");
});
//edit texture in the database will use this
app.post('/updatetexture', function (req, res, next) {
    //var data = JSON.stringify(req.body, null, 4);
    var data = req.body;
    console.log("updatetexture: ", data);
    eventEmitter.emit("updatetexture",
        {
            "materialinfo": materialinfo,
            "data": data
        });
    res.send("{\"response\":\"post updatetexture successfully\"}");
});
//del styles in the database will use this
app.post('/delStyles', function (req, res, next) {
    //var data = JSON.stringify(req.body, null, 4);
    var data = req.body;
    console.log("delStyles req: ", data);
    eventEmitter.emit("delStyles",
        {
            "materialinfo": materialinfo,
            "ids": data.ids
        });
    res.send("{\"response\":\"post delStyles successfully\"}");
});
//export the offer will check whether the offer excel is ready.
app.get('/checkoffer', function (req, res, next) {
    if (materialuntil.getsaveofferdata() === true) {
        res.send("{\"response\":\"ready\"}");
        materialuntil.setsaveofferdata(false);
    } else {
        res.send("{\"response\":\"not ready\"}");
    }
});

//user offer table will use this
app.get('/demo/table/offer', function (req, res, next) {
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
})

app.get('/offerdata', function (req, res, next) {
    var ip = getclientip(req);
    eventEmitter.emit("offerdata", {
        "materialinfo": materialinfo,
        "ip": ip
    });
    res.send("{\"state\":\"ok\"}");
})

app.post('/updatediscount', function (req, res, next) {
    var ip = getclientip(req);
    var data = req.body;
    eventEmitter.emit("updatediscount", {
        "materialinfo": materialinfo,
        "data": data,
        "ip": ip
    });
    res.send("{\"state\":\"ok\"}");
})

// app.get('/getdiscount', function(req, res, next) {
//   var ip = getclientip(req);
//   var ret = {
//     "discount": materialinfo.getpagematerial()[ip].discount
//   }
//   res.send(ret);
// })

//clear the offer data then save into the excel
app.get('/clearUserOfferTable', function (req, res, next) {
    var ip = getclientip(req);
    eventEmitter.emit("clearUserOfferTable", {
        "materialinfo": materialinfo,
        "ip": ip
    });
    res.send("{\"state\":\"ok\"}");
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
