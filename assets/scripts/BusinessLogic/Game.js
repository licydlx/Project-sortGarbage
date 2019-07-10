let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        scoreText: {
            default: null,
            type: cc.Label,
            displayName:'我的得分'
        },

        countDown: {
            default: null,
            type: cc.Node,
            displayName:'倒计时'
        },

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        // 倒计时区
        this.countBar = this.countDown.getComponent(cc.ProgressBar);
        this.countText = this.countDown.getChildByName('countText').getComponent(cc.Label);

        this.node.on('addScore', this._addScore, this);
        this.node.on('cutScore', this._cutScore, this);

        console.log(this.countBar);
        console.log(this.countText);

        // 倒计时60秒
        // 秒，初始值
        let total = 60;
        this.schedule(function() {
            total--;
            this.countText.string = total + 's';
            this.countBar.progress =  1 - total/60;
        }, 1, 59, 0);

    },

    _addScore() {
        this.scoreText.string = parseInt(this.scoreText.string) + 10;
    },

    _cutScore() {
        this.scoreText.string = parseInt(this.scoreText.string) - 5;
    },

    // _callback(){
    //     this.time.string = this.sOnce;
    //     this.sOnce = this.sOnce - 1;
    //     if(this.sOnce < 0){
    //         this.unscheduleAllCallbacks();
    //         this.time.node.active = false;
    //         this.sOnce = 20;
    //         this.items[this.seq].destroy();

    //         this.seq = this.seq + 1;
    //         if(this.seq < 2){
    //             this.items[this.seq].setPosition(0,0);
    //             let videoPlayer =  this.items[this.seq].getChildByName('video').getComponent(cc.VideoPlayer);
    //             videoPlayer.play();
    //         }
    //     }
    // },
    // _videoCompleted(event){
    //     console.log('_videoCompleted');
    //     console.log(event);
    //     let video = this.items[this.seq].getChildByName('video');
    //     video.destroy();
    //     let question = this.items[this.seq].getChildByName('question');
    //     question.active = true;

    //     this.time.node.active = true;
    //     this.schedule(this._callback, 1);
    // },

    // createPhb(name,index){
    //     let personInfo = cc.instantiate(this.personInfo);
    //     personInfo.parent = this.phb;
    //     if(index < 9){
    //         let dyX = -420 + index * 105 - 0;
    //         personInfo.setPosition(dyX, 60);
    //     } else if(index > 8 && index < 18){
    //         let dyX = -420 + index * 105 - 945;
    //         personInfo.setPosition(dyX, -80);
    //     } else {
    //         let dyX = -420 + index * 105 - 1890;
    //         personInfo.setPosition(dyX, -220);
    //     }
    //     let nameTag = personInfo.getChildByName('nameTag').getComponent(cc.Label);
    //     nameTag.string = name;
    //     // let videoTag = personInfo.getChildByName('videoTag').getComponent(cc.Label);
    //     // videoTag.string = val.viedo;
    //     // let scoreTag = personInfo.getChildByName('scoreTag').getComponent(cc.Label);
    //     // scoreTag.string = val.score;
    //     // let readyTag = personInfo.getChildByName('readyTag').getComponent(cc.Label);
    //     // readyTag.string = val.ready;
    // },

    // update(dt) {

    // },

    // createEmit(obj) {
    //     let frameData = JSON.stringify({
    //         "userID": GLB.userID,
    //         "action": obj.action,
    //         "toAction": obj.toAction,
    //     });

    //     if (GLB.syncFrame === true) {
    //         engine.prototype.sendFrameEvent(frameData);
    //     } else {
    //         engine.prototype.sendEvent(frameData);
    //     }
    // },

    // zb(){
    //     this.explain.destroy();
    //     this.zbButton.node.destroy();
    //     this.createEmit({
    //         action:msg.EVENT_PLAYER_ZB
    //     })
    // },
    // /**
    // * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
    // */
    // initEvent: function () {
    //     cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL, this.onEvent, this);
    //     cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent, this);
    //     cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
    // },

    // /**
    //  * 事件接收方法
    //  * @param event
    //  */
    // onEvent: function (event) {
    //     let eventData = event.data;
    //     switch (event.type) {
    //         case msg.MATCHVS_ROOM_DETAIL:
    //             console.log('MATCHVS_ROOM_DETAIL');
    //             console.log(event);
    //             GLB.ownew = eventData.rsp.owner;
    //             if(GLB.isRoomOwner){
    //                 this.peTotal.string = '总人数：' + eventData.rsp.userInfos.length;
    //                 this.userInfos = eventData.rsp.userInfos;
    //                 this.userInfos.forEach((val,index) => {
    //                     let user = JSON.parse(val.userProfile);
    //                     this.createPhb(user.name,index);
    //                 });
    //             }
    //             break;

    //         case msg.MATCHVS_SEND_EVENT_RSP:
    //             console.log('MATCHVS_SEND_EVENT_RSP');
    //             break;

    //         case msg.MATCHVS_SEND_EVENT_NOTIFY:
    //             console.log('MATCHVS_SEND_EVENT_NOTIFY');
    //             this.onNewWorkGameEvent(eventData.eventInfo);
    //             break;
    //     }
    // },

    // // 接受命令
    // onNewWorkGameEvent: function (info) {
    //     if (info && info.cpProto) {
    //         let event = JSON.parse(info.cpProto);
    //         console.log(event);

    //         if (event.action === msg.EVENT_PLAYER_START) {
    //             let videoPlayer = this.items[this.seq].getChildByName('video').getComponent(cc.VideoPlayer);
    //             this.items[this.seq].setPosition(0,0);
    //             videoPlayer.play();
    //         }

    //         if (event.action === msg.EVENT_PLAYER_ZB) {
    //             this.zbList.push(event.userID)
    //             console.log(this.zbList);
    //             this.zbTotal.string = '准备人数：' + this.zbList.length;
    //         }

    //         if (event.action === msg.VIDEO_READY_TO_PLAY) {
    //             console.log('onNewWorkGameEvent')
    //             if(GLB.isRoomOwner){
    //                 this.userInfos.forEach((val,index) => {
    //                     if(event.userID == val.userID){
    //                         let videoTag = this.phb.children[index].getChildByName('videoTag').getComponent(cc.Label);
    //                         videoTag.string = videoTag.string + event.item;
    //                     }
    //                 });
    //             }
    //         }  
    //     }
    // },

    // /**
    //  * 移除监听
    //  */
    // removeEvent: function () {
    //     // cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL, this.onEvent);
    //     // cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent);
    //     // cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
    // },

    // /**
    //  * 生命周期，页面销毁
    //  */
    // onDestroy() {
    //     this.removeEvent();
    //     console.log("game页面销毁");
    // },
    // update (dt) {},
});
