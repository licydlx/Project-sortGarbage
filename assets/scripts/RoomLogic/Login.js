
let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");


cc.Class({
    extends: cc.Component,
    properties: {
        loginButton: cc.Button
    },

    /**
     * load 显示页面
     */
    onLoad: function () {
        LocalStore_Clear();
        this.initMatchvsEvent(this);

        // 拓课云房间下 webview 通信
        this.sortGarbageGameMessage = function (e) {
            if (window === window.parent) return;
            if (typeof e.data !== 'string') return;
            let data = JSON.parse(e.data);
            if (data) {
                switch (data.method) {
                    case "onFileMessage":
                        if (data.handleData && data.handleData.method == 'sortGarbage') {
                            GameData.roomTags = data.handleData.pars.roomTags;
                            cc.director.loadScene('room');
                        }
                        break;
                }
            }
        }.bind(this);
        window.addEventListener("message", this.sortGarbageGameMessage, false);
    },

    teacherCreateRoom() {
        cc.director.loadScene('room');
    },

    start() {
        if (!GameData.userID) this.init();
        // 以时间戳为房间名
        // GameData.roomTags = new Date().getTime();
        GameData.testTags = new Date().getTime();
        console.log('start');
        console.log(GameData);
    },

    /**
    * 初始化
    */
    init() {
        var result = engine.prototype.init(GameData.channel, GameData.platform, GameData.gameID, GameData.appKey);
        console.log('初始化使用的gameID是:' + GameData.gameID, '如需更换为自己SDK，请修改GameData.js文件');
        engineLog(result, 'init');
    },

    /**
     * 注册
     */
    register() {
        if (GameData.isPAAS) {
            console.log("独立部署使用第三方账号,无需注册");
            return;
        }
        var result = engine.prototype.registerUser();
        engineLog(result, 'registerUser');
    },

    /**
     * 登录
     */
    login() {
        var result = engine.prototype.login(GameData.userID, GameData.token);
        console.log('登录的账号userID是:', GameData.userID);
        if (result == -6) {
            console.log('已登录，请勿重新登录');
        } else if (result === -26) {
            console.log("GameData:", GameData);
            console.log('[游戏账户与渠道不匹配，请使用cocos账号登录Matchvs官网创建游戏]：(https://www.matchvs.com/cocos)');
        } else {
            engineLog(result, 'login');
        }
    },

    /**
    * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
    * @param self this
    */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.on(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.on(msg.MATCHVS_LOGIN, this.loginResponse, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.off(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.off(msg.MATCHVS_LOGIN, this.loginResponse, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 初始化回调
     * @param info
     */
    initResponse(status) {
        if (status == 200) {
            console.log('initResponse：初始化成功，status：' + status)
            this.register();
        } else {
            console.log('initResponse：初始化失败，status：' + status)
        }
    },

    /**
     * 注册回调
     * @param userInfo
     */
    registerUserResponse(userInfo) {
        if (userInfo.status == 0) {
            console.log('registerUserResponse：注册用户成功,id = ' + userInfo.id + 'token = ' + userInfo.token + 'name:' + userInfo.name +
                'avatar:' + userInfo.avatar)
            GameData.userID = userInfo.id;
            GameData.token = userInfo.token;
            if (GameData.userName) userInfo.name = GameData.userName;

            this.login();
        } else {
            console.log('registerUserResponse: 注册用户失败')
        }
    },

    /**
     * 登陆回调
     * @param MsLoginRsp
     */
    loginResponse(MsLoginRsp) {
        if (MsLoginRsp.status == 200) {
            console.log('loginResponse: 登录成功')
        } else if (MsLoginRsp.status == 402) {
            console.log('loginResponse: 应用校验失败，确认是否在未上线时用了release环境，并检查gameID、appkey 和 secret')
        } else if (MsLoginRsp.status == 403) {
            console.log('loginResponse：检测到该账号已在其他设备登录')
        } else if (MsLoginRsp.status == 404) {
            console.log('loginResponse：无效用户 ')
        } else if (MsLoginRsp.status == 500) {
            console.log('loginResponse：服务器内部错误')
        }
    },

    /**
     * 错误信息回调
     * @param errorCode
     * @param errorMsg
     */
    errorResponse(errorCode, errorMsg) {
        console.log('errorMsg:' + errorMsg + 'errorCode:' + errorCode);
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        window.removeEventListener('message', this.sortGarbageGameMessage);
        console.log("Login页面销毁");
    },
});