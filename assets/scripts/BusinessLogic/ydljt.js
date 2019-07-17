
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {

    },

    start(){

    },
    // 碰撞 生命周期
    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        console.log('onCollisionEnter');
        console.log(other);
        console.log(self);
        // 碰撞系统会计算出碰撞组件在世界坐标系下的相关的值，并放到 world 这个属性里面
        let world = self.world;
        let noworld = other.world;
        // // 碰撞组件的 aabb 碰撞框
        // var aabb = world.aabb;
        // // 节点碰撞前上一帧 aabb 碰撞框的位置
        // var preAabb = world.preAabb;
        // // 碰撞框的世界矩阵
        // var t = world.transform;
        // // 以下属性为圆形碰撞组件特有属性
        // var r = world.radius;
        // var p = world.position;
        // // 以下属性为 矩形 和 多边形 碰撞组件特有属性
        // var ps = world.points;
        // dispatchEvent：做事件传递
        
        let a = { position: other.world.position, radius: other.world.radius };
        let b = { position: self.world.position, radius: self.world.radius };
        if(a.radius){
            if (cc.Intersection.circleCircle(a, b)) {
                console.log('已碰到敌人！');
            }
        };

        this.node.destroy();
    },
    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionStay: function (other, self) {
        
    },

    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
        
    },

    update (dt) {

    },
});
