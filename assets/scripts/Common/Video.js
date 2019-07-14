// let GLB = require("../Config/Glb");
// let engine = require("../MatchvsLib/MatchvsDemoEngine");
// let msg = require("../MatchvsLib/MatvhvsMessage");

// cc.Class({
//     extends: cc.Component,

//     properties: {

//     },

//     // LIFE-CYCLE CALLBACKS:
//     // onLoad () {},
//     createEmit(obj) {
//         let frameData = JSON.stringify({
//             "userID": GLB.userID,
//             "action": msg.VIDEO_READY_TO_PLAY,
//             "item": obj.item,
//         });

//         if (GLB.syncFrame === true) {
//             engine.prototype.sendFrameEvent(frameData);
//         } else {
//             engine.prototype.sendEvent(frameData);
//         }
//     },

//     onVideoPlayerEvent(videoplayer, eventType, customEventData) {
//         // videoplayer元信息加载完毕
//         if (eventType === cc.VideoPlayer.EventType.META_LOADED) {
//             console.log('videoplayer元信息加载完毕');
//             // videoplayer.play();
//         }

//         // videoplayer已准备好
//         if (eventType === cc.VideoPlayer.EventType.READY_TO_PLAY) {
//             console.log('videoplayer已准备好');
//             this.createEmit({
//                 item:customEventData
//             })
//         }

//         // videoplayer正在播放
//         if (eventType === cc.VideoPlayer.EventType.PLAYING) {
//             console.log('videoplayer正在播放');
//         }

//         // videoplayer暂停
//         if (eventType === cc.VideoPlayer.EventType.PAUSED) {
//             console.log('videoplayer暂停');
//         }

//         // videoplayer关闭
//         if (eventType === cc.VideoPlayer.EventType.STOPPED) {
//             console.log('videoplayer关闭');
//         }

//         // videoplayer播放完毕
//         if (eventType === cc.VideoPlayer.EventType.COMPLETED) {
//             console.log('videoplayer播放完毕');

//             let cee = new cc.Event.EventCustom('videoCompleted', true);
//             this.node.dispatchEvent(cee);
//         }
//         // // videoplayer被点击
//         // if (eventType === cc.VideoPlayer.EventType.CLICKED) {
//         //     console.log('videoplayer被点击');
//         //     videoplayer.play();
//         // }
//     },
//     // update (dt) {},
// });
