const engineLog = function (code, engineName) {
    switch (code) {
        case 0:
            console.log(engineName + '调用成功');
            break;
        case -1:
            console.log(engineName + '调用失败');
            break;
        case -2:
            console.log('尚未初始化，请先初始化再进行' + engineName + '操作');
            break;
        case -3:
            console.log('正在初始化，请稍后进行' + engineName + '操作');
            break;
        case -4:
            console.log('尚未登录，请先登录再进行' + engineName + '操作');
            break;
        case -5:
            console.log('已经登录，请勿重复登陆');
            break;
        case -6:
            console.log('尚未加入房间，请稍后进行' + engineName + '操作');
            break;
        case -7:
            console.log('正在创建或者进入房间,请稍后进行' + engineName + '操作');
            break;
        case -8:
            console.log('已经在房间中');
            break;
        case -20:
            console.log('maxPlayer超出范围 0 < maxPlayer ≤ 20');
            break;
        case -21:
            console.log('userProfile 过长，不能超过512个字符');
            break;
        case -25:
            console.log(engineName + 'channel 非法，请检查是否正确填写为 “Matchvs”');
            break;
        case -26:
            console.log(engineName + '：platform 非法，请检查是否正确填写为 “alpha” 或 “release”');
            break;
    }
}

module.exports = engineLog;