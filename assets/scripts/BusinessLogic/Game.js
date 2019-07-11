let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        scoreText: {
            default: null,
            type: cc.Label,
            displayName: '我的得分'
        },

        countDown: {
            default: null,
            type: cc.Node,
            displayName: '倒计时'
        },

        garbageList: {
            default: null,
            type: cc.Node,
            displayName: '垃圾列表'
        },

        khslj: {
            default: null,
            type: cc.Prefab,
            displayName: '可回收垃圾'
        },

        glj: {
            default: null,
            type: cc.Prefab,
            displayName: '干垃圾'
        },

        slj: {
            default: null,
            type: cc.Prefab,
            displayName: '湿垃圾'
        },

        ydlj: {
            default: null,
            type: cc.Prefab,
            displayName: '有毒垃圾'
        },

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.initEvent();
        engine.prototype.getRoomDetail(GLB.roomID);

        // 排名榜集合
        this.rankingList = {};

        // 倒计时区
        this.countBar = this.countDown.getComponent(cc.ProgressBar);
        this.countText = this.countDown.getChildByName('countText').getComponent(cc.Label);

        // 得减分区
        this.node.on('addScore', this._addScore, this);
        this.node.on('cutScore', this._cutScore, this);

        // 倒计时60秒
        // 秒，初始值
        let total = 60;
        this.schedule(function () {
            total--;
            this.countText.string = total + 's';
            this.countBar.progress = 1 - total / 60;
        }, 1, 59, 0);

        // 创建垃圾
        this.createRubbish();

        // this.bubbleSort([6, 2, 4, 8, 1, 5])
        // console.log('');
        //this.bubbleSort();
        console.log(this.bubbleSort());
    },

    _addScore() {
        this.scoreText.string = parseInt(this.scoreText.string) + 10;
        if (this.garbageList.childrenCount == 1) {
            this.createRubbish();
        }
    },

    _cutScore() {
        this.scoreText.string = parseInt(this.scoreText.string) - 5;
    },

    createRubbish() {
        this.shuffle(['khslj', 'glj', 'slj', 'ydlj']).forEach((element, i) => {
            let lj = cc.instantiate(this[element]);
            lj.parent = this.garbageList;
            switch (i) {
                case 0:
                    lj.setPosition(cc.v2(-250, 160));
                    break;
                case 1:
                    lj.setPosition(cc.v2(-90, 160));
                    break;
                case 2:
                    lj.setPosition(cc.v2(80, 160));
                    break;
                case 3:
                    lj.setPosition(cc.v2(250, 160));
                    break;
            }
        });
    },

    // 混乱算法排序
    shuffle(arr) {
        for (let i = 1; i < arr.length; i++) {
            const random = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[random]] = [arr[random], arr[i]];
        }
        return arr;
    },

    createEmit(obj) {
        let frameData = JSON.stringify({
            "userID": GLB.userID,
            "action": obj.action,
            "toAction": obj.toAction,
        });

        if (GLB.syncFrame === true) {
            engine.prototype.sendFrameEvent(frameData);
        } else {
            engine.prototype.sendEvent(frameData);
        }
    },

    /**
    * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
    */
    initEvent: function () {
        cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent: function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_ROOM_DETAIL:
                console.log('MATCHVS_ROOM_DETAIL');
                console.log(event);
                GLB.ownew = eventData.rsp.owner;
                // 初始化排行榜
                this.rankingList = this.initRankingData(eventData.rsp.userInfos);
                console.log(this.rankingList)
                this.showRankingData(this.rankingList);
                break;

            case msg.MATCHVS_SEND_EVENT_RSP:
                console.log('MATCHVS_SEND_EVENT_RSP');
                break;

            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                console.log('MATCHVS_SEND_EVENT_NOTIFY');
                this.onNewWorkGameEvent(eventData.eventInfo);
                break;
        }
    },

    // 
    initRankingData(userInfos) {
        return userInfos.map(v => {
            return {
                userID: v.userID,
                name: JSON.parse(v.userProfile).name,
                score:  Math.floor(Math.random() * 100),
            }
        })
    },

    showRankingData(data) {
       let newRaningList = this.bubbleSort(data);

       console.log(newRaningList)
    },

    bubbleSort() {
        let nums = [
            {
              "userID": 3492471,
              "name": "日日日",
              "score": 74
            },
            {
              "userID": 2448926,
              "name": "啊啊啊的范畴",
              "score": 65
            },
            {
              "userID": 3483554,
              "name": "顶顶顶",
              "score": 75
            }
          ];
          
        for (let i = 0, len = nums.length; i < len - 1; i++) {
            // 如果一轮比较中没有需要交换的数据，则说明数组已经有序。主要是对[5,1,2,3,4]之类的数组进行优化
            let mark = true;

            for (let j = 0; j < len - i - 1; j++) {
                if (nums[j].score > nums[j + 1].score) {
                    [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
                    mark = false;
                }
            }
            //if (mark) return;
        }
        
        return nums.reverse();
    },

    // 修改排行榜
    modifyRankingData() {
        return;
    },


    // 接受命令
    onNewWorkGameEvent: function (info) {
        console.log('onNewWorkGameEvent');
        if (info && info.cpProto) {
            let event = JSON.parse(info.cpProto);
            console.log(event);

        }
    },

    /**
     * 移除监听
     */
    removeEvent: function () {
        cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("game页面销毁");
    },
    update(dt) { },
});
