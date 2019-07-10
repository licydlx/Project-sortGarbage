let engine = require("../MatchvsLib/MatchvsDemoEngine");
let GLB = require("../Config/Glb");
let msg = require("../MatchvsLib/MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        userList: [],
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
        this.initEvent();
        // roomID的全局赋值要慎重使用，离开房间记得置空
        if (GLB.roomID !== "") engine.prototype.getRoomDetail(GLB.roomID);

        let self = this;
        this.btnStartGame.node.on(cc.Node.EventType.TOUCH_END, function () {
            console.log('this.btnStartGame')
            console.log(self.userList)
            if (self.userList.length > 0) {
                let event = {
                    action: msg.EVENT_GAME_START,
                };
                engine.prototype.sendEventEx(0, JSON.stringify(event));
                engine.prototype.joinOver();
            } else {
                // self.labelLog('房间人数小于' + GLB.MAX_PLAYER_COUNT);
            }
        });
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent() {
        cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
    },

    /**
     * 事件接收
     * @param event
     */
    onEvent(event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                console.log('MATCHVS_JOIN_ROOM_NOTIFY')
                let seq = this.content.childrenCount;
                this.showUser(eventData.roomUserInfo.userProfile, seq);
                this.userList.push(eventData.roomUserInfo);
                break;

            case msg.MATCHVS_ROOM_DETAIL:
                console.log('MATCHVS_ROOM_DETAIL')
                this.joinRoom(eventData.rsp);
                let infos = eventData.rsp.userInfos.reverse();
                for (let i in infos) {
                    if (GLB.userID !== infos[i].userID) this.userList.push(infos[i]);
                    this.showUser(infos[i].userProfile, i);
                }
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                let data = JSON.parse(eventData.eventInfo.cpProto);
                if (data.action == msg.EVENT_GAME_START) {
                    this.startGame();
                }
                break;
        }
    },

    startGame: function () {
        cc.director.loadScene('game')
    },

    /**
     * 房主是通过joinRoom ,非房主玩家是通过getRoomDetail 进来的
     * @param rsp
     */
    joinRoom: function (rsp) {
        if (GLB.roomID == "") GLB.roomID = rsp.roomID;
        GLB.mapType = rsp.roomProperty;
        if (rsp.owner === GLB.userID) {
            GLB.isRoomOwner = true;
        } else {
            GLB.isRoomOwner = false;
            this.btnStartGame.node.active = false;
        }
    },

    showUser(userProfile, i) {
        let info = JSON.parse(userProfile);
        let item = cc.instantiate(this.playerName);
        let label = item.getComponent(cc.Label);
        let seq = parseInt(i) + 1;
        label.string = seq + ':' + info.name;
        this.content.addChild(item);
        let height = 270 - 30 * (parseInt(i) + 1)
        if (height < -200) {
            item.setPosition(200, height + 270);
        } else {
            item.setPosition(-200, height);
        }
    },

    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
    },

    /**
     * 生命周期，销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("room页面销毁");
    },

});
