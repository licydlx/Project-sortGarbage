
cc.Class({
    extends: cc.Component,

    properties: {
        zb: {
            default: null,
            type: cc.Node
        },
    },

    onLoad () {
        this.zb.on(cc.Node.EventType.TOUCH_START, this.zbCallBack, this, true);
    },
    
    zbCallBack(){
        cc.director.loadScene('room');
    }

    // update (dt) {},
});
