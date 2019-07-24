let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");

cc.Class({
    extends: cc.Component,

    properties: {
        playerBox: {
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
        },
        userFrames: {
            default: [],
            type: [cc.SpriteFrame]
        }
    },

    onLoad() {
        this.userList = [];
        this.userNames = ['编小美', 'abo', '木木哒', 'S将军', '钱JOJO','隐身剑客'];
        this.initMatchvsEvent(this);
        this.joinRoomWithProperties();
    },

    startGame: function () {
        let len = this.content.childrenCount;
        if (len > 1) {
            let event = {
                action: msg.EVENT_GAME_START,
            };
            let result = engine.prototype.sendEvent(JSON.stringify(event));
            engineLog(result, 'sendEvent');
            cc.director.loadScene('game')
        } else {
            engineLog('房间人数小于' + GameData.mxaNumer);
        }
    },

    showUser(userProfile, i) {
        let item = cc.instantiate(this.playerBox);

        let seq = parseInt(i) + 1;
        let itemSeq = item.getChildByName('01').getComponent(cc.Label);
        itemSeq.string = '第' + seq + '位';

        let itemSprite = item.getChildByName('02').getComponent(cc.Sprite);
        itemSprite.spriteFrame = this.userFrames[i];

        if (GameData.userID == userProfile.userID) {
            let nameNode = item.getChildByName('03');
            nameNode.color = new cc.Color(241, 54, 61);
        }
        let itemName = item.getChildByName('03').getComponent(cc.Label);
        itemName.string = this.userNames[i];

        let itemReady = item.getChildByName('04').getComponent(cc.Label);
        let ready = userProfile.ready ? '已准备' : '加载中...';
        itemReady.string = ready;

        this.content.addChild(item);

        let width = -340 + 140 * parseInt(i)
        item.setPosition(width, 70);

    },

    /**
     * 加入指定类型房间
     */
    joinRoomWithProperties() {
        let matchinfo = new mvs.MsMatchInfo();
        matchinfo.mode = 0;
        matchinfo.canWatch = 2;
        matchinfo.maxPlayer = GameData.mxaNumer;
        matchinfo.roomProperty = GameData.roomTags;
        matchinfo.tags = {
            rv:GameData.roomTags
        };

        let userProfile = {
            userID: GameData.userID,
            avtar: GameData.avatar,
        }
        let result = engine.prototype.joinRoomWithProperties(matchinfo, userProfile);
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
            // 设置名字
            GameData.userName = this.userNames[userInfoList.length];
            // 显示房间人员基本信息
            userInfoList.push({ userProfile: JSON.stringify({ userID: GameData.userID, userName: GameData.userName }) });
            for (let i = 0; i < userInfoList.length; i++) {
                let userProfile = JSON.parse(userInfoList[i].userProfile);
                userProfile.ready = false;
                this.showUser(userProfile, i);
                this.userList.push(userProfile);
            }

            // 拓课云 房主发送进入房间命令 
            if (roomInfo.ownerId === GameData.userID) {
                this.btnStartGame.node.active = true;
                this.sentMessage({
                    gameName: 'sortGarbage',
                    action: "EVENT_JOIN_ASSIGN_ROOM",
                    roomTags: GameData.roomTags
                });
            }

            // 预加载game页
            cc.director.preloadScene("game", () => {
                let event = {
                    userID: GameData.userID,
                    action: msg.EVENT_GAME_READY,
                };
                let result = engine.prototype.sendEvent(JSON.stringify(event));
                engineLog(result, 'sendEvent');

                if (roomInfo.ownerId === GameData.userID) {
                    this.content.removeAllChildren();
                    this.userList = this.userList.map((v, i) => {
                        if (v.userID === GameData.userID) v.ready = true;
                        this.showUser(v, i);
                        return v;
                    });
                }
            });
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

    createEmit(obj) {
        let frameData = JSON.stringify({
            "userID": GameData.userID,
            "action": obj.action,
            "pars": obj.pars,
        });
        var result = engine.prototype.sendEvent(frameData);
        engineLog(result, 'sendEvent');
    },

    /**
     * 其他玩家加入房间通知
     * @param roomUserInfo
     */
    joinRoomNotify(roomUserInfo) {
        console.log('joinRoomNotify');
        let userProfile = JSON.parse(roomUserInfo.userProfile);
        let seq = this.content.childrenCount;
        userProfile.userName = this.userNames[seq];
        this.showUser(userProfile, seq);
        this.userList.push(userProfile);

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
            if (GameData.ownew === GameData.userID) {
                this.content.removeAllChildren();
                this.userList = this.userList.map((v, i) => {
                    if (v.userID === data.userID) v.ready = true;
                    this.showUser(v, i);
                    return v;
                });
                this.createEmit({
                    action: msg.EVENT_GAME_ALLREADYSTATE,
                    pars: this.userList,
                })
            }
        };

        // 房主向其他人发送 所有人准备状态
        if (data.action == msg.EVENT_GAME_ALLREADYSTATE) {
            this.content.removeAllChildren();
            data.pars.forEach((v, i) => {
                this.showUser(v, i);
            });
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
     * 生命周期，销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("room页面销毁");
    },

});
