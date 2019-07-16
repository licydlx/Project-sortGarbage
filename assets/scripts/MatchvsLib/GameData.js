/**
 * 体验地址的游戏信息
 * @type {{gameID: number, channel: string, platform: string, gameVersion: number, appKey: string, userName: string, mxaNumer: number, userID: string, token: string, host: string}}
 */

var GameData = {
    gameID: 216585,
    channel: 'Matchvs',
    platform: 'alpha',
    gameVersion: 1,
    appKey: '2729bb0dd3c34394be9bffca6b9ab858#C',
    roomID:'',
    ownew:'',
    userName: '',
    mxaNumer: 3,
    userID: "",
    token: "",
    host: "",
    isPAAS: false,
    roomTags:'垃圾分类',
    reset: function () {
        GameData.gameID = "";
        GameData.appKey = "";
        GameData.userID = "";
        GameData.token = "";
    },
}


module.exports = GameData;