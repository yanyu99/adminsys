'use strict';

module.exports = {
    debug: true,
    host: 'localhost',
    port: 9000,
    session_secret: 'node_offer_db',
    site: {
        name: '后台系统', // 名称
        description: '后台系统', // 描述
        keywords: 'Node.js, Express',
    },
    // sqldb
    sqldb: {
        db: 'mysql',
        host: '127.0.0.1',
        database: 'offer_db',
        username: 'root',
        password: '123456',
        timezone: '+08:00' //for writing to database
    },
    // redis
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        pass: '',
    }
};