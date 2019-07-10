let engine = require("../MatchvsLib/MatchvsDemoEngine");
let mvs = require("../MatchvsLib/Matchvs");
let GLB = require("../Config/Glb");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        itemTemplate: {
            default: null,
            type: cc.Node
        },

        contentFather: {
            default: null,
            type: cc.Node
        },

        spacing: 0,
        totalCount: 0
    },

    onLoad: function () {
        this.content = this.contentFather;
        this.initEvent();
        this.getRooomList();
    },

    getRooomList: function () {
        let RoomFilterEx = new mvs.MsRoomFilterEx();
        RoomFilterEx.maxPlayer = GLB.MAX_PLAYER_COUNT;
        RoomFilterEx.mode = 0;
        RoomFilterEx.canWatch = 0;
        RoomFilterEx.roomProperty = "课堂";
        RoomFilterEx.pageNo = 0;
        RoomFilterEx.pageSize = 10;
        engine.prototype.getRoomListEx(RoomFilterEx);
    },

    getRoomListExResponse: function (roomListExInfo) {
        this.content.removeAllChildren(true);
        for (let i = 0; i < roomListExInfo.total; i++) {
            let item = cc.instantiate(this.itemTemplate);
            this.content.addChild(item);
            item.setPosition(0, 100 * i);
            item.getComponent('Item').updateItem(roomListExInfo.roomAttrs[i]);
        }
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent() {
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_RSP, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_ROOM_LIST_EX, this.onEvent, this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent: function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_ROOM_LIST_EX:
                this.getRoomListExResponse(eventData.rsp);
                break;

            case msg.MATCHVS_JOIN_ROOM_RSP:
                GLB.roomID = eventData.userInfoList.roomID;
                cc.director.loadScene('room');
                break;
        }
    },

    onDestroy: function () {
        this.removeEvent();
        console.log("roomList 页面销毁");
    },

    /**
     * 移除监听
     */
    removeEvent: function () {
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_RSP, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_ROOM_LIST_EX, this.onEvent);
    },
});
