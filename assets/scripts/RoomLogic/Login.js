let GLB = require("../MatchvsLib/ExamplesData");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");

cc.Class({
    extends: cc.Component,
    properties: {
        loginButton: cc.Button,
        inputName: {
            default: null,
            type: cc.EditBox
        }
    },

    /**
     * load 显示页面
     */
    onLoad: function () {
        // this.hall = 'hall';
        // this.initEvent();
        // engine.prototype.init(GLB.channel, GLB.platform, GLB.gameID);

        this.initMatchvsEvent(this);
    },


    login() {
        engine.prototype.registerUser();
    },

    addName(v) {
        GLB.userName = v;
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
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.off(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.off(msg.MATCHVS_LOGIN, this.loginResponse, this);
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent: function () {
        cc.systemEvent.on(msg.MATCHVS_INIT, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_REGISTER_USER, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_LOGIN, this.onEvent, this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent: function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_INIT:
                console.log('MATCHVS_INIT');
                console.log(event);
                break;
            case msg.MATCHVS_REGISTER_USER:
                engine.prototype.login(eventData.userInfo.id, eventData.userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                console.log('MATCHVS_LOGIN');
                console.log(event);
                // cc.director.loadScene(this.hall);
                break;
        }
    },

    /**
     * 移除监听
     */
    removeEvent: function () {
        cc.systemEvent.off(msg.MATCHVS_INIT, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_REGISTER_USER, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_LOGIN, this.onEvent);
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("Login页面销毁");
    },
});