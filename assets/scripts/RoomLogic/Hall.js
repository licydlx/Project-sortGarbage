
// let GLB = require("../Config/Glb");
// let mvs = require("../MatchvsLib/Matchvs");
// let engine = require("../MatchvsLib/MatchvsDemoEngine");
// let msg = require("../MatchvsLib/MatvhvsMessage");

// cc.Class({
//     extends: cc.Component,

//     properties: {
//         createRoom: {
//             default: null,
//             type: cc.Button
//         },
//         roomList: {
//             default: null,
//             type: cc.Button
//         }
//     },
//     // LIFE-CYCLE CALLBACKS:
//     onLoad() {
//         cc.systemEvent.on(msg.MATCHVS_CREATE_ROOM, this.onEvent, this);
//         // 创建房间
//         this.createRoom.node.on(cc.Node.EventType.TOUCH_END, function () {
//             let create = new mvs.MsCreateRoomInfo();
//             create.roomName = '老年干部活动中心';
//             create.maxPlayer = GLB.MAX_PLAYER_COUNT;
//             create.mode = 0;
//             create.canWatch = 0;
//             create.visibility = 1;
//             create.roomProperty = '课堂';
//             engine.prototype.createRoom(create, "Matchvs");
//         });

//         // 查看房间列表
//         this.roomList.node.on(cc.Node.EventType.TOUCH_END, function () {
//             cc.director.loadScene("roomList");
//         });
//     },

//     /**
//      * 接收事件
//      * @param event
//      */
//     onEvent(event) {
//         let eventData = event.data;
//         if (event.type === msg.MATCHVS_CREATE_ROOM) {
//             GLB.roomID = eventData.rsp.roomID;
//             GLB.ownew = eventData.rsp.ownew;
//             cc.director.loadScene('room');
//         }
//     },

//     /**
//      * 移除监听
//      */
//     removeEvent() {
//         cc.systemEvent.off(msg.MATCHVS_CREATE_ROOM, this.onEvent);
//     },

//     /**
//      * 生命周期，页面销毁
//      */
//     onDestroy: function () {
//         this.removeEvent();
//         console.log("hall页面销毁");
//     }
// });
