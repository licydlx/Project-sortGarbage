// let GLB = require("../Config/Glb");
// let engine = require("../MatchvsLib/MatchvsDemoEngine");
// let msg = require("../MatchvsLib/MatvhvsMessage");

// // 算法
// const algorithms = require("./algorithms");
// // 排行榜
// const leaderboard = require("./leaderboard");

// cc.Class({
//     extends: cc.Component,

//     properties: {
//         scoreText: {
//             default: null,
//             type: cc.Label,
//             displayName: '我的得分'
//         },

//         countDown: {
//             default: null,
//             type: cc.Node,
//             displayName: '倒计时'
//         },

//         garbageList: {
//             default: null,
//             type: cc.Node,
//             displayName: '垃圾列表'
//         },

//         rankNameList: {
//             default: [],
//             type: [cc.Label],
//             displayName: '姓名列表'
//         },

//         rankScoreList: {
//             default: [],
//             type: [cc.Label],
//             displayName: '得分列表'
//         },

//         leaderboardList: {
//             default: null,
//             type: cc.Node,
//             displayName: '排行榜'
//         },

//         phbItem: {
//             default: null,
//             type: cc.Prefab,
//             displayName: '排行榜人'
//         },

//         khslj: {
//             default: null,
//             type: cc.Prefab,
//             displayName: '可回收垃圾'
//         },

//         glj: {
//             default: null,
//             type: cc.Prefab,
//             displayName: '干垃圾'
//         },

//         slj: {
//             default: null,
//             type: cc.Prefab,
//             displayName: '湿垃圾'
//         },

//         ydlj: {
//             default: null,
//             type: cc.Prefab,
//             displayName: '有毒垃圾'
//         },


//     },

//     // LIFE-CYCLE CALLBACKS:
//     onLoad() {
//         this.initEvent();
//         engine.prototype.getRoomDetail(GLB.roomID);

//         // 排名榜集合
//         this.rankingList = null;
//         // 倒计时区
//         this.countBar = this.countDown.getComponent(cc.ProgressBar);
//         this.countText = this.countDown.getChildByName('countText').getComponent(cc.Label);
//         // 得减分区
//         this.node.on('addScore', this._addScore, this);
//         this.node.on('cutScore', this._cutScore, this);
//         this.initGame();

//     },

//     initGame() {
//         // 清空排行榜 并 隐藏弹出层
//         this.leaderboardList.removeAllChildren();
//         let modal = this.node.getChildByName('modal');
//         modal.active = false;
//         // 我的得分
//         this.scoreText.string = 0;

//         // 实时排行榜
//         for (let index = 0; index < this.rankNameList.length; index++) {
//             this.rankNameList[index].string = '无';
//         }

//         for (let index = 0; index < this.rankScoreList.length; index++) {
//             this.rankScoreList[index].string = '无';
//         }

//         // 参与人信息
//         if (this.rankingList) {
//             this.rankingList = this.rankingList.map(v => {
//                 v.score = 0;
//                 return v;
//             });
//         }

//         // 倒计时
//         this.totalTime = 60;
//         this.schedule(this._shcheduleCallback, 1, 59, 0);

//         // 清空垃圾场，创建垃圾
//         this.garbageList.removeAllChildren();
//         this._createRubbish(['khslj', 'glj', 'slj', 'ydlj']);
//     },

//     _shcheduleCallback() {
//         this.totalTime--;
//         this.countText.string = this.totalTime + 's';
//         this.countBar.progress = 1 - this.totalTime / 60;
//         if (this.totalTime < 1) {
//             let modal = this.node.getChildByName('modal');
//             modal.active = true;
//             for (let i = 0; i < this.rankingList.length; i++) {
//                 let phbr = cc.instantiate(this.phbItem);
//                 phbr.parent = this.leaderboardList;
//                 let lb = phbr.getComponent(cc.Label);
//                 lb.string = (i + 1) + '. ' + this.rankingList[i].name + ' | ' + this.rankingList[i].score;
//                 // // 设置位置
//                 phbr.setPosition(cc.v2(-60, - i * 30));
//             }
//             this.unschedule(this._shcheduleCallback);
//         }
//     },

//     resetGame(){
//         this.initGame();
//         this.createEmit({
//             action: msg.GAME_START_EVENT,
//             pars: {}
//         });
//     },

//     _addScore() {
//         let curScore = parseInt(this.scoreText.string) + 10;
//         this.scoreText.string = curScore;
//         this._showRankingData({
//             userID: GLB.userID,
//             pars: {
//                 score: curScore
//             }
//         });

//         this.createEmit({
//             action: msg.EVENT_GAIN_SCORE,
//             pars: {
//                 score: curScore
//             }
//         });
//         if (this.garbageList.childrenCount == 1) this._createRubbish(['khslj', 'glj', 'slj', 'ydlj']);
//     },

//     _cutScore() {
//         let curScore = parseInt(this.scoreText.string) - 5;
//         this.scoreText.string = curScore;

//         this._showRankingData({
//             userID: GLB.userID,
//             pars: {
//                 score: curScore
//             }
//         });

//         this.createEmit({
//             action: msg.EVENT_GAIN_SCORE,
//             pars: {
//                 score: curScore
//             }
//         });
//     },

//     _createRubbish(list) {
//         algorithms.shuffle(list).forEach((element, i) => {
//             let lj = cc.instantiate(this[element]);
//             lj.parent = this.garbageList;
//             // 设置位置
//             lj.setPosition(cc.v2(-250 + i * 140, 150));
//         });
//     },

//     createEmit(obj) {
//         let frameData = JSON.stringify({
//             "userID": GLB.userID,
//             "action": obj.action,
//             "pars": obj.pars,
//         });
//         if (GLB.syncFrame === true) {
//             engine.prototype.sendFrameEvent(frameData);
//         } else {
//             engine.prototype.sendEvent(frameData);
//         }
//     },

//     /**
//     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
//     */
//     initEvent: function () {
//         cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL, this.onEvent, this);
//         cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent, this);
//         cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
//     },

//     /**
//      * 事件接收方法
//      * @param event
//      */
//     onEvent: function (event) {
//         let eventData = event.data;
//         switch (event.type) {
//             case msg.MATCHVS_ROOM_DETAIL:
//                 console.log('MATCHVS_ROOM_DETAIL');
//                 GLB.ownew = eventData.rsp.owner;
//                 // 初始化排行榜
//                 this.rankingList = leaderboard.initRankingData(eventData.rsp.userInfos);
//                 break;

//             case msg.MATCHVS_SEND_EVENT_RSP:
//                 console.log('MATCHVS_SEND_EVENT_RSP');
//                 break;

//             case msg.MATCHVS_SEND_EVENT_NOTIFY:
//                 console.log('MATCHVS_SEND_EVENT_NOTIFY');
//                 this._onGameEvent(eventData.eventInfo);
//                 break;
//         }
//     },

//     // 接受命令
//     _onGameEvent: function (info) {
//         if (info && info.cpProto) {
//             let event = JSON.parse(info.cpProto);
//             switch (event.action) {
//                 case 'gainScore':
//                     // 更新实时排行榜
//                     this._showRankingData(event);
//                     break;
//                 case 'gameStart':
//                     // 重新开始
//                     this.initGame();
//                     break;

//                 default:
//                     break;
//             }
//         }
//     },

//     // 更新实时排行榜
//     _showRankingData: function (event) {
//         let modifyRankingList = leaderboard.modifyRankingData(this.rankingList, event);
//         this.rankingList = algorithms.bubbleSort(modifyRankingList).reverse();
//         for (let i = 0; i < 3; i++) {
//             if (this.rankingList[i]) {
//                 this.rankNameList[i].string = this.rankingList[i].name;
//                 this.rankScoreList[i].string = this.rankingList[i].score;
//             }

//         }
//     },

//     /**
//      * 移除监听
//      */
//     removeEvent: function () {
//         cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL, this.onEvent);
//         cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent);
//         cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
//     },

//     /**
//      * 生命周期，页面销毁
//      */
//     onDestroy() {
//         this.removeEvent();
//         console.log("game页面销毁");
//     },

//     update(dt) { },

// });


