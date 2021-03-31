
let appData = {
    discount:0.9,
    price:10
}

let bananaData = {
    discount:0.9,
    Price:10
}

let appleValue = 0;

// 管理deps
const depsMap = new Map();

// 添加对应的副作用到set中，确保唯一
function track(key) {
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    dep.add(effect)
}
// 循环触发一次回调，更新值
function trigger(key) {
    let dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => effect())
    }
}

// 副作用 
let effect = () => {
    appleValue = appData.discount * appData.price;
}






// 存储discount的effect
track('discount');
trigger('discount');
console.log(appleValue);


appData.discount = 0.8;

track('discount');
trigger('discount');
console.log(appleValue);