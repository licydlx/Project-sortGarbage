let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

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
        this.hall = 'hall';
        this.initEvent();
        engine.prototype.init(GLB.channel, GLB.platform, GLB.gameID);
    },


    login() {
        engine.prototype.registerUser();
    },

    addName(v){
        GLB.name = v;
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
                console.log(event);
                break;
            case msg.MATCHVS_REGISTER_USER:
                engine.prototype.login(eventData.userInfo.id, eventData.userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                cc.director.loadScene(this.hall);
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