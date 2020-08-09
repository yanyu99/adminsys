
function dmsHub(opt) {
    this.debug = !!(opt && opt.debug);
    this.token = (opt && opt.token) ? opt.token : '';
    this.host = (opt && opt.host) ? opt.host : location.host;
    this.hostname = (opt && opt.hostname) ? opt.hostname : location.hostname;
    this.http_scheme = 'https:' === document.location.protocol ? 'https' : 'http';

}

dmsHub.prototype.api_ajax = function (host, path, args, success, failure, logHandler, logLevelHandler, fixArgs) {
    var api_url = this.http_scheme + "://" + host + path,
        start_time = new Date().getTime();

    args = args || {};
    if (this.token) {
        args.token = this.token;
    }
    fixArgs = fixArgs || {};
    logHandler = logHandler || (function (logLevel, use_time, args, data) {
        (this.debug && logLevel in this._log_func) && (this._log_func[logLevel])(this.date('Y-m-d H:i:s'), '[' + logLevel + '] ' + path + '(' + use_time + 'ms)', 'args:', args, 'data:', data)
    }).bind(this);

    logLevelHandler = logLevelHandler || function (res) {
        return (typeof res.code != 'undefined') ? (parseInt(res.code) === 0 ? 'INFO' : 'ERROR') : (!res.error ? 'INFO' : 'ERROR');
    };

    return $.ajax($.extend({}, {
        type: "POST",
        url: api_url,
        data: args,
        cache: false,
        dataType: "json",
        success: function (res) {
            res.state && success(res);
            !res.state && failure(res);
        }
    }, fixArgs));
};
dmsHub.prototype.Register = function (args, success, failure, logHandler, logLevelHandler, fixArgs) {
    this.api_ajax(this.host, '/register', {
        account: args.account,
        password: args.password,
        role: "admin",
        is_enabled: 1

    }, success, failure, logHandler, logLevelHandler, fixArgs);
}
dmsHub.prototype.Login = function (args, success, failure, logHandler, logLevelHandler, fixArgs) {
    this.api_ajax(this.host, '/login', {
        account: args.account,
        password: args.password
    }, success, failure, logHandler, logLevelHandler, fixArgs);
}

dmsHub.prototype.getCurAccount = function (args, success, failure, logHandler, logLevelHandler, fixArgs) {
    this.api_ajax(this.host, '/account', {
    }, success, failure, logHandler, logLevelHandler, {
            type: "GET",
        });
}

dmsHub.prototype.getuserdata = function (args, success, failure, logHandler, logLevelHandler, fixArgs) {
    this.api_ajax(this.host, '/getuserdata', args, success, failure, logHandler, logLevelHandler, fixArgs);
}

dmsHub.prototype.createCode = function () {
    var code = "";
    // 验证码长度
    var codeLength = 4;
    // 验证码随机数
    var random = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (var i = 0; i < codeLength; i++) {
        // 随机数索引
        var index = Math.floor(Math.random() * 36);
        code += random[index];
    }
    return code;
}

