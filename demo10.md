# 如何拦截获取 GET & SET

## ES5 Object.defineProperty()

## ES6 Proxy 与 ES6 Reflect

注意此方法不支持 IE

反射是什么意思尼？

Reflect 是内置对象。

举个例子，我们这里接触到的主要是代理之后获取属性

常见的获取属性有三种

- Object.key
- Object['key']
- Reflect.get(Object,key)

也就是

- 点表示(dot notation)
- 括号表示(bracket notation)
- Reflect 反射

## Proxy

```javascript
let appleData = {
  discount: 0.9,
  price: 10,
};
// 对数据的代理
let proxiedAppleData = new Proxy(appleData, {});
console.log(proxiedAppleData.price); // 10
```

```javascript
var p = new Proxy(target, handler);
var p = new Proxy(target, {
  get: function (target, property, receiver) {},
});
```

### Proxy target

要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。

### Proxy handler

一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。

### Proxy handler property

被获取的属性名。

### Proxy handler receiver

Proxy 或者继承 Proxy 的对象

```javascript
let appleData = {
  discount: 0.9,
  price: 10,
};
// 对数据的代理
let proxiedAppleData = new Proxy(appleData, {
  get(target, key) {
    console.log("GET", key);
    return target[key];
  },
});
console.log(proxiedAppleData.price); // 10
```

Reflect.get(target, propertyKey[, receiver])

### Reflect.get target

需要取值的目标对象

### Reflect.get handler

需要获取的值的键值

### Reflect.get receiver

如果 target 对象中指定了 getter，receiver 则为 getter 调用时的 this 值

使用 Reflect 改造例子

```javascript
let appleData = {
  discount: 0.9,
  price: 10,
};
// 对数据的代理
let proxiedAppleData = new Proxy(appleData, {
  get(target, key, receiver) {
    console.log("GET", key);
    // 确保this指向的问题
    return Reflect.get(target, key, receiver);
  },
});
console.log(proxiedAppleData.price); // 10
```

加入 set 方法

```javascript
let appleData = {
  discount: 0.9,
  price: 10,
};
// 对数据的代理
let proxiedAppleData = new Proxy(appleData, {
  get(target, key, receiver) {
    console.log("GET", key);
    // 确保this指向的问题
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("SET", key, value);
    return Reflect.set(target, key, value, receiver);
  },
});
console.log(proxiedAppleData.price); // 10
```

### 小课堂

为什么这里必须要传一个 receiver 尼?

简单介绍下

自己写例子的时候,发现不传 receiver 完全不会出问题的,是写法冗余了吗,其实不是写法冗余,是测试用例覆盖不全导致的

我们来看这个例子

receiver 表示的是 this 的指向

```javascript
var target = {
  get a() {
    return this.c;
  },
};
Reflect.get(target, "a", { c: 4 }); // 4
```

Receiver 指向 proxy 本身或者继承他的对象

```javascript
var target = {
  get a() {
    return this.b;
  },
};

var proxy = new Proxy(
  {},
  {
    get: function (target, property, receiver) {
      console.log(this);
      return receiver;
    },
  }
);
proxy.getReceiver; // proxy
var inherits = Object.create(proxy);
inherits.getReceiver; // inherits
```

这里的的 get 中的 this 指向的是 handler 处理器

这些都很完美,那么出问题的例子长什么样子尼

```javascript
var target = {
  get a() {
    return this.b;
  },
};

var p = new Proxy(target, {
  get(raw, key, receiver) {
    if (key === "b") {
      return 3;
    }
    // receiver就是 proxy 对象，这下应该能访问到 'b' 了吧
    return Reflect.get(receiver, key);
  },
});

p.a; // 这里直接会报错,我们来分析下为什么
```

首先 p.a 会被 handler 处理
进入 get 会发生什么事情
return handler 的 b 属性
// Reflect.get(target,key,this) 大概是这样子
Reflect.get(receiver, key);
目标是 this key 是 a  
会继续去访问 a 属性
如此形成了无限循环
最初溢出报错

如果加上 Reflect.get(target,key,this) 三个参数都给全

```javascript
var target = {
  get a() {
    return this.b;
  },
};

var p = new Proxy(target, {
  get(raw, key, receiver) {
    if (key === "b") {
      return 3;
    }
    // receiver就是 proxy 对象，这下应该能访问到 'b' 了吧
    return Reflect.get(raw, key, receiver);
  },
});

p.a; // 3
```

我们来分析下流程
首先 p.a 会被 handler 处理
然后 return Reflect.get(raw, key, receiver);
raw 是一开始的 target
key 是 'a'
receiver 是 p 本身
等通过 get 操作后
key 变成了 'b'

Call Stack 目前的状态是

[
//顶部
get, // 这是去查找 key 为 b 的 get
get a, // 这里的是 target 中的 get a
get, // 这里是 return Reflect 中的 get 方法
...
]

所以这边是可以获取到值为 3 的

其实 vue3 中使用 proxy 时候对数组也是做了特殊的处理的,如果想当然的写下面这种代码

```javascript
const p = new Proxy([1, 2, 3], {
  get(target, key, receiver) {
    return target[key];
  },
  set(target, key, value, receiver) {
    target[key] = value;
  },
});

p.push(100); // 会报错运行不起来
```

但是改成

```javascript
const p = new Proxy([1, 2, 3], {
  get(target, key, receiver) {
    console.log("get: ", key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("set: ", key, value);
    return Reflect.set(target, key, value, receiver);
  },
});

p.push(100);

// get: push
// get: length
// set 3 100
// set length 4

// 从上面的代码可以发现执行 push 操作时，还会访问 length 属性。推测执行过程如下：根据 length 的值，得出最后的索引，再设置新的置，最后再改变 length。
```

通过 Reflect 可以获取默认行为 所以配合使用确实效果更佳，其实上面的代码去掉 receiver 也是可以运行的 结果不会变的，为什么要加上 receiver 之前的例子解释过了
