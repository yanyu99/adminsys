var path = require('path');

const _ = require('lodash'),
    crypto = require('crypto'),
    logger = require('../public/utils/logger'),
    models = require('../models'),
    Op = models.Sequelize.Op;
const moment = require('moment');

const resSendMsg = (res, state, strMsg) => {
    res.send({
        state: state,
        msg: strMsg
    })
};

const resSendFile = (res, fileName, opt) => {
    res.sendFile(fileName, opt, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
};

const arrMenu = [{
    "id": 1,
    "name": "offer",
    "path": "/offer",
    "des": "报价",
    "role": "all",
    "icon": "offer"

}, {
    "id": 2,
    "name": "database",
    "path": "/database",
    "des": "数据库",
    "role": "super",
    "icon": "home"
}];

/** 登录注册相关 */
class loginController {


    /**注册页面 */
    async showRegister(req, res, next) {
        var _curPath = path.resolve(__dirname, "..");
        res.sendFile(_curPath + "/views/auth/register.html");
    }

    /** 注册 */
    async Register(req, res, next) {
        let _account = req.body.account || "";
        let _password = req.body.password || "";

        const Account = await models.account.findOne({
            where: {
                account: _account,
            }
        });

        if (Account !== null) {
            return resSendMsg(res, false, "用户名已经存在！");
        }

        if (!_password || _password.length < 6) {
            return resSendMsg(res, false, "请先输入6位以上密码");
        }

        _password = crypto.createHash('md5').update(_password).digest('hex');
        var _curTime = new Date().getTime();
        _curTime = moment(_curTime).format('YYYY-MM-DD HH:mm:ss');

        var _dataObj = {
            account: _account,
            password: _password,
            role: "admin",
            is_enabled: 1,
            create_dt: _curTime,
            login_dt: _curTime
        }

        new Promise((resolve, reject) => {
            models.account.create(_dataObj).then((response) => {
                resolve(response);
                return resSendMsg(res, true, "注册成功！");

            }).catch((response) => {
                reject(response);
                return resSendMsg(res, false, `注册失败！+${JSON.stringify(response)}`);
            });
        });

    }

    /**登录页面 */
    async showLogin(req, res, next) {
        var _curPath = path.resolve(__dirname, "..");
        res.sendFile(_curPath + "/views/auth/login.html");
    }

    /** 执行登录 */
    async login(req, res, next) {
        let _account = req.body.account || "";
        let _password = req.body.password || "";
        _password = crypto.createHash('md5').update(_password).digest('hex');

        const user = await models.account.findOne({
            where: {
                account: _account,
            }
        });

        if (user === null) {
            return resSendMsg(res, false, "用户名不存在！");
        }
        if (_password !== user.password) {
            return resSendMsg(res, false, "密码错误！");
        }
        if (user.is_enabled == 0) {
            return resSendMsg(res, false, "禁止登录，请联系管理员！");
        }

        var _curTime = new Date().getTime();
        _curTime = moment(_curTime).format('YYYY-MM-DD HH:mm:ss');

        //更新
        (async () => {
            user.login_dt = _curTime
            await user.save()
        })();

        // var _pram = { 'login_dt': _curTime };
        // await models.account.update(
        //     _pram, {
        //         'where': { 'id': { eq: user.id } }
        //     }
        // );

        req.session.user = user;
        var userMenu = user.role == "super" ? arrMenu : (arrMenu.filter(i => i.role == "all") || []);//菜单权限
        req.session.menu = userMenu;

        logger.info("用户：" + _account + "登录成功！");
        return resSendMsg(res, true, "登录成功！");
    }

    /** 退出登录 */
    async logout(req, res, next) {
        req.session.destroy(function () {
            res.redirect('/login');
        });
    }




}

module.exports = new loginController();