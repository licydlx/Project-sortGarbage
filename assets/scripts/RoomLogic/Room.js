let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");

cc.Class({
    extends: cc.Component,

    properties: {
        playerName: {
            default: null,
            type: cc.Prefab
        },
        btnStartGame: {
            default: null,
            type: cc.Button
        },
        content: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.userList = [];

        this.btnStartGame.node.on(cc.Node.EventType.TOUCH_END, () => {
            let len = this.content.childrenCount;
            if (len > 1) {
                let event = {
                    action: msg.EVENT_GAME_START,
                };
                var result = engine.prototype.sendEvent(JSON.stringify(event));
                engineLog(result, 'sendEvent');
                // engine.prototype.joinOver();
            } else {
                engineLog('房间人数小于' + GameData.mxaNumer);
            }
        });

        this.initMatchvsEvent(this);

        this.joinRoomWithProperties()
    },

    start() {

    },

    startGame: function () {
        cc.director.loadScene('game')
    },

    showUser(userProfile, i) {
        let item = cc.instantiate(this.playerName);
        let label = item.getComponent(cc.Label);
        let seq = parseInt(i) + 1;

        label.string = seq + ':' + userProfile.userName;
        this.content.addChild(item);
        let height = 270 - 30 * (parseInt(i) + 1)
        if (height < -200) {
            item.setPosition(200, height + 270);
        } else {
            item.setPosition(-200, height);
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
        matchinfo.roomProperty = GameData.roomTags;
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
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.joinRoomNotify, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.joinRoomNotify, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
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
            GameData.ownew = roomInfo.ownerId;

            // 显示房间人员基本信息
            userInfoList.push({ userProfile: JSON.stringify({ userID: GameData.userID, userName: GameData.userName }) });
            for (let i = 0; i < userInfoList.length; i++) {
                let userProfile = JSON.parse(userInfoList[i].userProfile);
                this.showUser(userProfile, index);
                this.userList.push(userProfile);
            }

            // 预加载game页
            cc.director.preloadScene("game", () => {
                let event = {
                    userID: GameData.userID,
                    action: msg.EVENT_GAME_READY,
                };
                let result = engine.prototype.sendEvent(JSON.stringify(event));
                engineLog(result, 'sendEvent');
            });

            // 拓课云 房主发送进入房间命令 
            if (roomInfo.ownerId === GameData.userID) {
                this.btnStartGame.node.active = true;
                this.sentMessage({
                    gameName: 'sortGarbage',
                    action: "EVENT_JOIN_ASSIGN_ROOM",
                    roomTags: GameData.roomTags
                });
            }
        } else {
            console.log('joinRoomResponse：进入房间失败');
        }
    },

    // 环境：1.拓课云房间下 2.cocos课件 webview 3.小游戏(自身)
    // 逻辑：1.老师点开始游戏-创建房间成功-postMessage-拓课云通信-其他学生收到信息进入相应房间  （matchvs-不在一个房间无法进行通信）
    // 
    sentMessage(data) {
        const handleData = {
            method: data.gameName,
            pars: {
                roomTags: data.roomTags,
                action: data.action,
            },
        }
        window.parent.postMessage(JSON.stringify(handleData), '*')
    },

    /**
     * 其他玩家加入房间通知
     * @param roomUserInfo
     */
    joinRoomNotify(roomUserInfo) {
        let userProfile = JSON.parse(roomUserInfo.userProfile);
        this.showUser(userProfile, this.content.childrenCount);
        this.userList.push(userProfile);
    },

    /**
     * 关闭房间成功
     * @param joinOverRsp
     */
    joinOverResponse(joinOverRsp) {
        if (joinOverRsp.status == 200) {
            console.log('joinOverResponse: 关闭房间成功');
        } else if (joinOverRsp.status == 400) {
            console.log('joinOverResponse: 客户端参数错误 ');
        } else if (joinOverRsp.status == 403) {
            console.log('joinOverResponse: 该用户不在房间 ');
        } else if (joinOverRsp.status == 404) {
            console.log('joinOverResponse: 用户或房间不存在');
        } else if (joinOverRsp.status == 500) {
            console.log('joinOverResponse: 服务器内部错误');
        }
    },

    /**
     * 关闭房间通知
     * @param notifyInfo
     */
    joinOverNotify(notifyInfo) {
        console.log('joinOverNotify：用户' + notifyInfo.srcUserID + '关闭了房间，房间ID为：' + notifyInfo.roomID);
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
        let data = JSON.parse(eventInfo.cpProto);
        if (data.action == msg.EVENT_GAME_START) this.startGame();
        if (data.action == msg.EVENT_GAME_READY) {
            this.userList.forEach((element, i) => {
                if (element.userID === data.userID) {
                    let userText = this.content.children[i].getComponent(cc.Label);
                    userText.string = userText.string + '  已准备';
                }
            });
        };
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
     * 生命周期，销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("room页面销毁");
    },

});
