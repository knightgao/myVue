const targetMap = new WeakMap();

function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
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

let appData = {
  discount: 0.9,
  price: 10,
};
let proxiedAppData = reactive(appData);

let appleValue = 0;

let effect = () => {
  appleValue = proxiedAppData.discount * proxiedAppData.price;
};

// 这个必须有，去除了就不行
effect();

proxiedAppData.discount = 0.8;

console.log(appleValue);

proxiedAppData.discount = 0.5;

console.log(appleValue);
