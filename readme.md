
### 技术栈
Framework: Express

db: mysql

ORM: sequelize

Cache: redis

ECMAScript: ES6

### 项目运行

环境：
- node >=8, 推荐LTS 10+
- mysql >= 5.6
- redis 

```
//copy config.js，config.js为本地配置文件，加入了gitignore
$ cp config.default.js config.js

$ npm i

//mysql中手动建数据库，执行以下命令同步表
$ node dbsync

// models/sql/offer_db.sql 执行并初始化数据
// 默认初设账户  test/123456


//项目启动
$ npm start

```
