'use strict';
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
    let account = sequelize.define('account', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        /**登录用户名 */
        account: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        /**登录密码 */
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'admin'
        },

        /**是否启用：0禁止访问 1正常*/
        is_enabled: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1
        },
        login_dt: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('login_dt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        create_dt: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('create_dt')).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    }, {
            timestamps: false,//关闭默认时间字段
            freezeTableName: true,
        });

    return account;
};