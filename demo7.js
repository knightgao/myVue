const targetMap = new WeakMap();

function track(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))

    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    dep.add(effect)
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) { return; }
    let dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => effect())
    }
}



let appData = {
    discount: 0.9,
    price: 10
}

let bananaData = {
    discount: 0.9,
    Price: 10
}

let appleValue = 0;



// 副作用 
let effect = () => {
    appleValue = appData.discount * appData.price;
}


// 存储discount的effect
track(appData,'discount');
trigger(appData,'discount');
console.log(appleValue);


appData.discount = 0.8;

track(appData,'discount');
trigger(appData,'discount');
console.log(appleValue);