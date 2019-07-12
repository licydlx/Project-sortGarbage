
// 初始化排行榜
const initRankingData = userInfos => {
    return userInfos.map(v => {
        return {
            userID: v.userID,
            name: JSON.parse(v.userProfile).name,
            score: 0,
        }
    })
};

// 修改排行榜
const modifyRankingData = (rankingList, event) => {
    return rankingList.map(v => {
        if (Object.is(event.userID, v.userID)) v.score = event.pars.score;
        return v;
    })
};

module.exports = {
    initRankingData,
    modifyRankingData,
}