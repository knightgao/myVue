let discount = 0.9;
let applePrice = 10;

let appleValue = 0;

// 存储副作用
let dep = new Set();


// 副作用 可能存在多个，导致代码变复杂了
let effect = () => {
    appleValue = discount * applePrice;
}

// 添加对应的副作用到set中，确保唯一
function track() {
    dep.add(effect)
}

// 循环触发一次回调，更新值
function trigger() {
    dep.forEach(effect => effect())
}

track();
trigger();
console.log(appleValue);


discount = 0.8;

track();
trigger();
console.log(appleValue);