const targetMap = new WeakMap();

let activeEffect = null;

function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    dep.add(activeEffect);
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    console.log("effect()调用");
    dep.forEach((effect) => effect());
  }
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      let result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        console.log("设置");
        trigger(target, key);
      }
      return result;
    },
  };
  return new Proxy(target, handler);
}

function effect(eff) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

// 下面是业务
let appData = {
  discount: 0.9,
  price: 10,
};
let proxiedAppData = reactive(appData);

let appleValue = 0;

effect(() => {
  appleValue = proxiedAppData.discount * proxiedAppData.price;
});

proxiedAppData.discount = 0.8;

console.log(appleValue);

proxiedAppData.discount = 0.5;

console.log(appleValue);
