'use strict';
/**
 * router 主要用来描述请求 URL 和具体承担执行动作的 Controller 的对应关系，
 * 框架约定 router.js 文件用于统一所有路由规则。
 * 通过统一的配置，我们可以避免路由规则逻辑散落在多个地方，从而出现未知的冲突，集中在一起可以更方便的来查看全局的路由规则。
 */

const router = require('express').Router();
const login = require('./controller/login'),
    offerApi = require('./controller/offerApi'),
    auth = require('./middleware/auth');


//注册 登录
router.get('/register', login.showRegister);
router.post('/register', login.Register);
router.get('/login', login.showLogin);
router.post('/login', login.login);
router.get('/logout', login.logout);


/* GET home page. */
router.get('/', auth.loginRequired, function (req, res, next) {
    res.sendFile(__dirname + "/index.html");
});

router.get('/offer', auth.loginRequired, function (req, res, next) {
    res.sendFile(__dirname + "/views/offer/offer.html");
});

router.get('/database', auth.loginRequired, function (req, res, next) {
    res.sendFile(__dirname + "/views/common/database.html");
});
router.get('/account', auth.loginRequired, function (req, res, next) {
    res.send({
        state: true,
        accountObj: req.session.user,
        userMenu: req.session.menu
    })
});


/**接口数据 */

//get original user offer table
router.get('/getuserdata', offerApi.getUserData);

//add user offer will use this
router.post('/addUserOffer', offerApi.apiMain);

//delete user offer will use this
router.post('/deleteUserOffer', offerApi.apiMain);

//copy user offer will use this
router.post('/copyUserOffer', offerApi.apiMain);

//update user offer by id will use this
router.post('/updateUserOfferById', offerApi.apiMain);

//get the option value from the added database or offer page will use this
router.get('/optionvalue', offerApi.optionvalue);

//get the material info from the added database or offer page will use this
router.get('/materialinfo', offerApi.materialinfo);

//废弃
router.get('/pagematerial', offerApi.pagematerial);

//database table will use this
router.get('/demo/table/user', offerApi.demoTableUser)

//add database will use this
router.post('/addDatabase', offerApi.apiMain);

//save database will use this
router.get('/save', offerApi.save);
//edit texture in the database will use this
router.post('/updatetexture', offerApi.apiMain);
//del styles in the database will use this
router.post('/delStyles', offerApi.apiMain);
//export the offer will check whether the offer excel is ready.
router.get('/checkoffer', offerApi.checkoffer);

//user offer table will use this
router.get('/demo/table/offer', offerApi.demoTableOffer)

router.get('/offerdata', offerApi.apiMain)

router.post('/updatediscount', offerApi.apiMain)

//clear the offer data then save into the excel
router.get('/clearUserOfferTable', offerApi.apiMain)

// app.get('/getdiscount', function(req, res, next) {
//   var ip = getclientip(req);
//   var ret = {
//     "discount": materialinfo.getpagematerial()[ip].discount
//   }
//   res.send(ret);
// })


// catch 404 and forward to error handler
router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// 未找到路由
router.use((req, res) => {
    res.render('404');
});
module.exports = router; //导出