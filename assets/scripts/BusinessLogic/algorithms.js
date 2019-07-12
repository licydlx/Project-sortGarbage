// 混乱算法排序
const shuffle = arr =>{
    for (let i = 1; i < arr.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[random]] = [arr[random], arr[i]];
    }
    return arr;
};

// 冒泡算法排序
const bubbleSort = nums => {
    for (let i = 0, len = nums.length; i < len - 1; i++) {
        // 如果一轮比较中没有需要交换的数据，则说明数组已经有序。主要是对[5,1,2,3,4]之类的数组进行优化
        for (let j = 0; j < len - i - 1; j++) {
            if (nums[j].score > nums[j + 1].score) {
                [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
            }
        }
    }
    return nums;
};

module.exports = {
    shuffle,
    bubbleSort
}