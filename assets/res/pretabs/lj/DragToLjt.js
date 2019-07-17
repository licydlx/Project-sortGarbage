/**
 * 拖动到目标
 */
cc.Class({
    extends: cc.Component,
    properties: {
        ljtName: {
            default: String,
            displayName: '垃圾箱'
        },
    },
    onLoad() {
        this.ljtOpen = false;
        this.curLjt = null;
        let circleCollider = this.node.addComponent(cc.CircleCollider);
        circleCollider.radius = 50;
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    },

    start() {
        //缓存原始父节点
        this._oldPosition = this.node.position;
        this._oldParent = this.node.parent;
    },

    _spineLjt(config){
        let message = new cc.Event.EventCustom('spineLjt', true);
        message.setUserData({ ljtName: config.name, action:config.action });
        this.node.dispatchEvent(message);
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
        if (this.ljtOpen) {
            if (this.curLjt === this.ljtName) {
                this._spineLjt({
                    name:this.curLjt,
                    action:'happy'
                })
            } else {
                this._spineLjt({
                    name:this.curLjt,
                    action:'sad'
                })
            }
            this.node.destroy();
        } else {
            this.node.position = this._oldPosition;
        }
    },

    _onTouchCancel(touchEvent) {
        if (this.ljtOpen) {
            if (this.curLjt === this.ljtName) {
                this._spineLjt({
                    name:this.curLjt,
                    action:'happy'
                })
            } else {
                this._spineLjt({
                    name:this.curLjt,
                    action:'sad'
                })
            }
            this.node.destroy();
        } else {
            this.node.position = this._oldPosition;
        }
    },
    // 碰撞 生命周期
    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        console.log('onCollisionEnter')
        let polygon = other.world.points;
        let circle = { position: self.world.position, radius: self.world.radius };
        if (!polygon) return;
        if (cc.Intersection.polygonCircle(polygon, circle)) {
            this.ljtOpen = true;
            this.curLjt = other.node.name;
            this._spineLjt({
                name:this.curLjt,
                action:'open'
            })
        }
    },

    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
        console.log('onCollisionExit')
        let polygon = other.world.points;
        if (!polygon) return;
        if (!this.curLjt) return;
        this._spineLjt({
            name:this.curLjt,
            action:'stop'
        })

        this.ljtOpen = false;
        this.curLjt = null;
    },
});