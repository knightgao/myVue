let discount = 0.9;
let applePrice = 10;
let appleValue = discount * applePrice;

// 副作用
let effect = () => {
    appleValue = discount * applePrice;
}

console.log(appleValue);


discount = 0.8;


effect();



console.log(appleValue);