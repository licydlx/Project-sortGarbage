
let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");


cc.Class({
    extends: cc.Component,
    properties: {
        loginButton: cc.Button,
        inputName: {
            default: null,
            type: cc.EditBox
        },
        loaded:{
            default: null,
            type: cc.Label
        }
    },

    /**
     * load 显示页面
     */
    onLoad: function () {
        
        LocalStore_Clear();
        this.initMatchvsEvent(this);
    },
    start(){
        this.init();
        cc.director.preloadScene("room", () =>{
            this.loaded.string = '已预加载房间';
        });

        // 以时间戳为房间名
        GameData.roomTags = new Date().getTime();
    },

    changeName(v) {
        GameData.userName = v;
    },

    changeRoomTags(e,data){
       GameData.roomTags = data;
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
     * 加入指定类型房间
     */
    joinRoomWithProperties() {
        var matchinfo = new mvs.MsMatchInfo();
        matchinfo.mode = 0;
        matchinfo.canWatch = 2;

        matchinfo.maxPlayer = GameData.mxaNumer;
        matchinfo.tags = GameData.roomTags;

        var result = engine.prototype.joinRoomWithProperties(matchinfo);
        engineLog(result, 'joinRoomWithProperties');
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

        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.off(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.off(msg.MATCHVS_LOGIN, this.loginResponse, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);

        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
    },

    /**
     * 进入房间回调
     * @param status
     * @param userInfoList
     * @param roomInfo
     */
    joinRoomResponse(status, userInfoList, roomInfo) {
        if (status == 200) {
            console.log('joinRoomResponse: 进入房间成功：房间ID为：' + roomInfo.roomID + '房主ID：' + roomInfo.ownerId + '房间属性为：' + roomInfo.roomProperty);
            GameData.roomID = roomInfo.roomID;
            let event = {
                action: msg.EVENT_JOIN_ASSIGN_ROOM,
                pars:'haha'
            };
            var result = engine.prototype.sendEvent(JSON.stringify(event));
            engineLog(result, 'sendEvent');
        } else {
            console.log('joinRoomResponse：进入房间失败');
        }
    },

    /**
     * 发送消息回调
     * @param sendEventRsp
     */
    sendEventResponse(sendEventRsp) {
        console.log(sendEventRsp);
        if (sendEventRsp.status == 200) {
            console.log('sendEventResponse：发送消息成功');
        } else {
            console.log('sendEventResponse：发送消息失败');
        }
    },

    /**
     * 接收到其他用户消息通知
     * @param eventInfo
     */
    sendEventNotify(eventInfo) {
        console.log('sendEventNotify');
        let data = JSON.parse(eventInfo.cpProto);
        console.log(data);
        if (data.action == msg.EVENT_JOIN_ASSIGN_ROOM) { 
            console.log(data);
        };
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
            if(GameData.userName) userInfo.name = GameData.userName;

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
            //cc.director.loadScene('room');
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
        console.log("Login页面销毁");
    },
});