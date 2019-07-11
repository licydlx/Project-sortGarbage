/**
 * 拖动到目标
 */
cc.Class({
    extends: cc.Component,

    properties: {
        ljx: {
            default: String,
            displayName:'垃圾箱'
        },
    },

    onLoad() {
        this.target = this.node.parent.parent.getChildByName(this.ljx)

        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    start(){
        //缓存原始父节点
        this._oldPosition = this.node.position;
        this._oldParent = this.node.parent;
    },

    _onTouchStart(touchEvent) {
        let location = touchEvent.getLocation();
        this._offset = this.node.convertToNodeSpaceAR(location);
        if (this.node.parent === this._oldParent) {
            return;
        }
        let point = this._oldParent.convertToNodeSpaceAR(location);
        this.node.parent = this._oldParent;
        this.node.position = point.sub(this._offset);
    },

    _onTouchMove(touchEvent) {
        let location = touchEvent.getLocation();
        this.node.position = this.node.parent.convertToNodeSpaceAR(location).sub(this._offset);
    },

    _onTouchEnd(touchEvent) {
        if (!this.target) {
            return;
        }
        //获取target节点在父容器的包围盒，返回一个矩形对象
        let rect = this.target.getBoundingBox();
        //使用target容器转换触摸坐标
        let location = touchEvent.getLocation();
        let point = this.target.parent.convertToNodeSpaceAR(location);
        //if (cc.rectContainsPoint(rect, targetPoint)) {
        if (rect.contains(point)) {
            //在目标矩形内，修改节点坐标  
            point = this.target.convertToNodeSpaceAR(location); 
            this.node.position = point;
            // 销毁垃圾
            this.node.destroy();
            // 加分
            this._countScore('addScore');
            //修改父节点 
            // this.node.parent = this.target;
            return;
        }else {
            //不在矩形中，还原节点位置    
            this.node.position = this._oldPosition;
            // 减分
            this._countScore('cutScore');
        }
    },

    _countScore(name){
        let message = new cc.Event.EventCustom(name, true);
        //message.setUserData();
        this.node.dispatchEvent(message);
    }
});