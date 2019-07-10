
// 
// 
//
//

// 引擎
let engine;
// 回调响应
let response = {};
let MsMatchInfo;
// 创建房间
let MsCreateRoomInfo;
let MsRoomFilterEx;
// 清除缓存
let LocalStore_Clear;

try {
    
    engine = new window.MatchvsEngine();
    response = new window.MatchvsResponse();
    MsMatchInfo = window.MsMatchInfo;
    MsCreateRoomInfo = window.MsCreateRoomInfo;
    MsRoomFilterEx = window.MsRoomFilterEx;
    LocalStore_Clear = window.LocalStore_Clear;

} catch (e) {
    console.warn("load matchvs fail," + e.message);
}

module.exports = {
    engine: engine,
    response: response,
    MsMatchInfo: MsMatchInfo,
    MsCreateRoomInfo: MsCreateRoomInfo,
    MsRoomFilterEx: MsRoomFilterEx,
    LocalStore_Clear: LocalStore_Clear,
};