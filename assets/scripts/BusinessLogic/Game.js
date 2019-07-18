
let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");



// 算法
const algorithms = require("./algorithms");
// 排行榜
const leaderboard = require("./leaderboard");
cc.Class({
    extends: cc.Component,
    properties: {
        scoreText: {
            default: null,
            type: cc.Label,
            displayName: '我的得分'
        },

        countBox: {
            default: null,
            type: cc.Node,
            displayName: '倒计时'
        },

        garbageBox: {
            default: [],
            type: [sp.Skeleton],
            displayName: '垃圾桶列表'
        },

        garbageList: {
            default: null,
            type: cc.Node,
            displayName: '垃圾列表'
        },

        // rankNameList: {
        //     default: [],
        //     type: [cc.Label],
        //     displayName: '姓名列表'
        // },

        // rankScoreList: {
        //     default: [],
        //     type: [cc.Label],
        //     displayName: '得分列表'
        // },

        // leaderboardList: {
        //     default: null,
        //     type: cc.Node,
        //     displayName: '排行榜'
        // },

        phbItems: {
            default: [],
            type: [cc.Node],
            displayName: '排行榜人'
        },

        ljModal: {
            default: [],
            type: [cc.Prefab],
            displayName: '垃圾模型'
        },

        ljAtlas: {
            default: [],
            type: [cc.SpriteAtlas],
            displayName: '垃圾图集'
        },

        scoreModal: {
            default: [],
            type: [cc.Prefab],
            displayName: '分数模型'
        },

        progressList: {
            default: [],
            type: [cc.SpriteFrame],
            displayName: '进度条集'
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.initMatchvsEvent(this);
        engine.prototype.getRoomDetail(GameData.roomID);
        // 排名榜集合
        this.rankingList = [];
        // 倒计时区
        this.countBar = this.countBox.getChildByName('countDown').getComponent(cc.ProgressBar);
        this.countText = this.countBox.getChildByName('countText').getComponent(cc.Label);
        this.barSprite = this.countBox.getChildByName('countDown').getChildByName('bar').getComponent(cc.Sprite);
        // 垃圾桶spine动画
        this.node.on('spineLjt', this._spineLjt, this);

        this.ljtSpineList = {
            khsljBarrel: {
                seq: 0,
                open: 'open',
                happy: 'omo-happy',
                sad: 'omo-sad',
                kwy: 'omostandby',
                stop: 'stop',
            },
            ydljBarrel: {
                seq: 1,
                open: 's-open',
                happy: 's-happy',
                sad: 's-sad',
                kwy: 's-standby',
                stop: 's-stop',
            },
            sljBarrel: {
                seq: 2,
                open: 'open',
                happy: 'green-happy',
                sad: 'green-sad',
                kwy: 'green-standby',
                stop: 'stop',
            },
            gljBarrel: {
                seq: 3,
                open: 'jojo-open',
                happy: 'jojo-happy',
                sad: 'jojo-sad',
                kwy: 'jojo-standby',
                stop: 'jojo-stop',
            },
        };

        this.initGame();

        // 倒计时
        // this.totalTime = 60;
        // this.schedule(this._shcheduleCallback, 1, 59, 0);

        // this.ljPos = 0;
        // this._createRubbish(this.createLjConfig(this.ljPos));
    },

    initGame() {
        // 清空排行榜并隐藏弹出层
        // this.leaderboardList.removeAllChildren();
        let modal = this.node.getChildByName('modal');
        modal.active = false;
        // 我的得分
        this.scoreText.string = 0;

        // 实时排行榜
        // for (let index = 0; index < this.rankNameList.length; index++) {
        //     this.rankNameList[index].string = '无';
        // }

        // for (let index = 0; index < this.rankScoreList.length; index++) {
        //     this.rankScoreList[index].string = '无';
        // }

        // 参与人信息
        if (this.rankingList) {
            this.rankingList = this.rankingList.map(v => {
                v.score = 0;
                return v;
            });
        }

        // 倒计时
        this.totalTime = 60;
        this.schedule(this._shcheduleCallback, 1, 59, 0);
        this.barSprite.spriteFrame = this.progressList[0];

        // 清空垃圾场，创建垃圾
        this.garbageList.removeAllChildren();
        this.ljPos = 0;
        this._createRubbish(this.createLjConfig(this.ljPos));
    },

    _spineLjt(ev) {
        let config = ev.detail;
        let seq = this.ljtSpineList[config.ljtName].seq;
        let action = this.ljtSpineList[config.ljtName][config.action];
        if (config.action == 'kwy') {
            this.garbageBox[seq].addAnimation(0, action, true);
        } else {
            this.garbageBox[seq].setAnimation(0, action, false);
            switch (config.action) {
                case 'happy':
                    this._modifyScore(config.ljtName, 'add');
                    break;
                case 'sad':
                    this._modifyScore(config.ljtName, 'cut');
                    break;
            }
        }
    },

    // 获取垃圾桶的位置
    _getLjtPos(name) {
        let ljt = this.node.getChildByName('garbageBox').getChildByName(name);
        return ljt.getPosition();
    },

    // 修改分数
    _modifyScore(name, state) {
        let textPos = this.scoreText.node.parent.getPosition();
        let score = cc.instantiate(this.scoreModal[Object.is(state, 'add') ? 0 : 1]);
        score.parent = this.node;
        // 设置位置
        let pos = this._getLjtPos(name);
        score.setPosition(cc.v2(pos.x, -60));

        let act1 = cc.moveTo(1.2, cc.v2(textPos.x + 60, textPos.y + 20));
        let act2 = cc.callFunc(this._modifyScoreFn, this, {
            state: state,
            score: score
        });
        let allAction = cc.sequence(act1, act2);
        score.runAction(allAction);
    },

    _modifyScoreFn(e, data) {
        data.score.destroy();
        if (this.garbageList.childrenCount == 0) this._createRubbish(this.createLjConfig(this.ljPos));
        let curScore;
        switch (data.state) {
            case 'add':
                curScore = parseInt(this.scoreText.string) + 10;
                break;
            case 'cut':
                curScore = parseInt(this.scoreText.string) - 5;
                break;
        }

        this.scoreText.string = curScore;

        this._showRankingData({
            userID: GameData.userID,
            pars: {
                score: curScore
            }
        });

        this.createEmit({
            action: msg.EVENT_GAIN_SCORE,
            pars: {
                score: curScore
            }
        });
    },

    // 生成垃圾配置信息
    createLjConfig(pos) {
        let anyPos = Math.floor(Math.random() * 8);
        if (anyPos == pos) {
            if (anyPos > 0) {
                anyPos--;
            } else {
                anyPos++;
            }
        }
        return [{
            key: 0,
            name: 'khslj',
            pos: pos
        },
        {
            key: 1,
            name: 'ydlj',
            pos: pos
        }, {
            key: 2,
            name: 'slj',
            pos: pos
        }, {
            key: 3,
            name: 'glj',
            pos: pos
        }, {
            key: Math.floor(Math.random() * 4),
            name: 'anyLj',
            pos: anyPos
        }];
    },

    _shcheduleCallback() {
        this.totalTime--;
        this.countText.string = this.totalTime + 's';
        this.countBar.progress = this.totalTime / 60;
        switch (this.totalTime) {
            case 0:
                this.unschedule(this._shcheduleCallback);
                let modal = this.node.getChildByName('modal');
                modal.active = true;
                for (let i = 0; i < this.rankingList.length; i++) {
                    let nameText = this.phbItems[i].getChildByName('02').getComponent(cc.Label);
                    let scoreText = this.phbItems[i].getChildByName('04').getComponent(cc.Label);
                    nameText.string = this.rankingList[i].name;
                    scoreText.string = this.rankingList[i].score;
                }
                break;
            case 30:
                    this.barSprite.spriteFrame = this.progressList[1];
                break;
        }
    },

    resetGame() {
        this.initGame();
        this.createEmit({
            action: msg.GAME_START_EVENT,
            pars: {}
        });
    },

    _createRubbish(list) {
        this.ljPos++;
        algorithms.shuffle(list).forEach((element, i) => {
            let lj = cc.instantiate(this.ljModal[element.key]);
            lj.parent = this.garbageList;
            let sp = lj.addComponent(cc.Sprite);
            sp.spriteFrame = this.ljAtlas[element.key].getSpriteFrames()[element.pos];
            lj.setScale(.5);
            // 设置位置
            lj.setPosition(cc.v2(-300 + i * 150, 120));
        });
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
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ROOM_DETAIL, this.getRoomDetail, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.on(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_ROOM_DETAIL, this.getRoomDetail, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.off(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
    },

    /**
     * 房间详情回调
     * @param eventData
     */
    getRoomDetail(eventData) {
        if (eventData.userID == GameData.userID) {
            engine.prototype.JoinOver();
        }
        GameData.ownew = eventData.owner;
        // 初始化排行榜
        this.rankingList = leaderboard.initRankingData(eventData.userInfos);
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
     * 注销回调
     * @param status
     */
    logoutResponse(status) {
        if (status == 200) {
            this.labelLog('logoutResponse：注销成功');
            engine.prototype.uninit();
        } else if (status == 500) {
            this.labelLog('logoutResponse：注销失败，服务器错误');
        }

    },

    /**
     * 发送消息回调
     * @param sendEventRsp
     */
    sendEventResponse(sendEventRsp) {
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
        console.log(eventInfo);
        this._onGameEvent(eventInfo);
    },

    /**
     * 错误信息回调
     * @param errorCode
     * @param errorMsg
     */
    errorResponse(errorCode, errorMsg) {
        console.log('errorMsg:' + errorMsg + 'errorCode:' + errorCode);
    },

    // 接受命令
    _onGameEvent: function (info) {
        if (info && info.cpProto) {
            let event = JSON.parse(info.cpProto);
            switch (event.action) {
                case 'gainScore':
                    // 更新实时排行榜
                    this._showRankingData(event);
                    break;
                case 'gameStart':
                    // 重新开始
                    this.initGame();
                    break;

                default:
                    break;
            }
        }
    },

    // 更新实时排行榜
    _showRankingData: function (event) {
        let modifyRankingList = leaderboard.modifyRankingData(this.rankingList, event);
        this.rankingList = algorithms.bubbleSort(modifyRankingList).reverse();
        // for (let i = 0; i < this.rankingList.lenght; i++) {
        //     if (this.rankingList[i]) {
        //         this.rankNameList[i].string = this.rankingList[i].name;
        //         this.rankScoreList[i].string = this.rankingList[i].score;
        //     }
        // }
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        //cc.director.getCollisionManager().enabledDebugDraw = false;
        engine.prototype.logout();

    },
    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        this.removeEvent();
        console.log("game页面销毁");
    },

    update(dt) { },

});