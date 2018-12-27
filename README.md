# JS导学

## this

```
function say(content) { console.log(content); } 
```
想要调用这个函数。

```
say('Hello World') 等价于 say.call(window, 'Hello World')
```

`apply`,`call`, `bind`

```
var x = 1

var say = function () {
    console.log(this.x)
}

say()

// 1
```

```
var x = 1

var say = function () {
    console.log(this.x)
}

say.call(window)

// 1
```

```
var x = 1

var say = function () {
    console.log(this.x)
}

say.apply(window)

// 1
```

```
var x = 1

var say = function () {
    console.log(this.x)
}


var obj ={}
obj.x = 2
obj.say = say

say.apply(obj)
obj.say()

// 2
// 2
```

```
var x = 1

var say = function()  {
    console.log(this.x)
}


var obj = {}
obj.x = 2
// obj.say = say

say.apply()
say.apply(window)
say.apply(obj)      //注意这里输出还是1，这个是箭头函数和普通函数的区别
say.bind(obj)()

// 1
// 1
// 2
// 2
```

> 箭头函数能够保证this总是函数定义时的this


## 闭包

正常情况下，想从外部获取函数的局部变量会拿不到。要想拿到必须要变通。

```
var doSomething = function () {
    var x = 1;
}
console.log(x)

//index.js:5 Uncaught ReferenceError: x is not defined
    at index.js:5
```

```
var f1 = function () {
    var x = 1;

    return function () {
        return x;
    }
}

var f2 = f1()
console.log(f2())

// 1
``` 

上面的f2就是闭包。在本质上，闭包就是将函数内部和函数外部连接起来的一座桥梁。

闭包的用途有很多。

- 一个是前面提到的可以读取函数内部的变量
- 另一个就是让这些变量的值始终保持在内存中

```
var increment = undefined
var f1 = function () {
    var n = 999
    increment = function(){n+=1}
    var f2 = function () {
        console.log(n)
    }
    return f2
}

var f2 = f1()
f2()
increment()
f2()

// 999
// 1000
```

f2被赋给了一个全局变量， f2不会被回收， f2依赖f1， 因此f1不会被回收， 会一直在内存中。

- 闭包可用来实现懒加载

```
function lazysum(arr) {
    return function () {
        console.log(arr.reduce((x, y) => x + y, 0))
    }
}
var sum = lazysum([1, 2, 3])
sum()

// 6
```
- 闭包实现变量私有

- 闭包循环可能出现问题。因此闭包不要引用会发生变化的变量。

```
function f1() {
    var arr = []
    for (var i = 1; i < 4; i++) {
        arr.push(function () {
            console.log(i * i)
        })
    }
    return arr
}
var closures = f1()
console.log(closures)
closures[0]()
closures[1]()
closures[2]()

// 16
// 16
// 16
```

可以通过自调函数隔离开函数

```
function f1() {
    var arr = []
    for (var i = 1; i < 4; i++) {
        arr.push((function (x) {
            return function() {
                console.log(x * x)
            }
        })(i))
    }
    return arr
}
var closures = f1()

closures[0]()
closures[1]()
closures[2]()

// 1
// 4
// 9
```


## 高阶函数

函数式编程

```
var isLongEnough = function (str) {
    return str.length >= 5
}
var strArr = ['hello', 'world', 'ace', 'dude']
var result = strArr.filter(isLongEnough)
console.log(result)
```
但是对同样的数组进行多次操作会让代码凝聚力差。

```
function strUpperCase(str) {
    return str.toUpperCase()
}

function strConcat(s1, s2) {
    return s1 + " " + s2;
}

function isLongEnough(str) {
    return str.length > 3
}

function strUppercaseReducer(list, str) {
    list.push(strUpperCase(str))
    return list
}

function isLongEnoughReducer(list, str) {
    if (isLongEnough(str)) list.push(str)
    return list
}

var words = ['hello', 'lanyage', 'this']
var upperAndLongWordStr =
    words.reduce(strUppercaseReducer, [])
        .reduce(isLongEnoughReducer, [])
        .reduce(strConcat, "")
console.log(upperAndLongWordStr)

// HELLO LANYAGE THIS
```

这是一个不错的改进。但是仍然无法compose。改进下push方法。

```
function strUpperCase(str) {
    return str.toUpperCase()
}

function strConcat(s1, s2) {
    return s1 + " " + s2;
}

function isLongEnough(str) {
    return str.length > 3
}

function strUppercaseReducer(list, str) {
    return list.concat([strUpperCase(str)])
}

function isLongEnoughReducer(list, str) {
    if (isLongEnough(str)) return list.concat([str])
    return list
}

var words = ['hello', 'lanyage', 'this']
var upperAndLongWordStr =
    words.reduce(strUppercaseReducer, [])
        .reduce(isLongEnoughReducer, [])
        .reduce(strConcat, "")
console.log(upperAndLongWordStr)
```

参数化 Reducers。


```
// Reducers
function strUppercaseReducer(list, str) {
    return list.concat([strUpperCase(str)])
}

function isLongEnoughReducer(list, str) {
    if (isLongEnough(str)) return list.concat([str])
    return list
}

function isShortEnoughReducer(list, str) {
    if (isShortEnough(str)) return list.concat([str])
    return list
}

// ReducerCreator
function filterReducerCreator(predictFn) {
    return function reducer(list, str) {
        console.log(list, str)
        if (predictFn(str)) return listCombination(list, str)
        return list
    }
}

function mapReducerCreator(mapFn) {
    return function (list, str) {
        return listCombination(list, mapFn(str))
    }
}

var listCombination = function (list, str) {
    return list.concat([str])
}

var a = []
var b = [1, 2, 3]


var longEnoughReducer = filterReducerCreator(isLongEnough)
var uppercaseReducer = mapReducerCreator(strUpperCase)

var words = ['hello', 'lanyage', 'this']

let upperLongWords =
    words.reduce(uppercaseReducer, [])
        .reduce(longEnoughReducer, [])
        .reduce(strConcat, "")
console.log(upperLongWords.trim())

// HELLO LANYAGE THIS
```

参数化组合

listCombination(..) 小工具只是组合两个值的一种方式。

```
function filterReducerCreator(predictFn, listCombination) {
    return function reducer(list, str) {
        console.log(list, str)
        if (predictFn(str)) return listCombination(list, str)
        return list
    }
}
function mapReducerCreator(mapFn, listCombination) {
    return function (list, str) {
        return listCombination(list, mapFn(str))
    }
}

var listCombination = function (list, str) {
    return list.concat([str])
}

var a = []
var b = [1, 2, 3]

var longEnoughReducer = filterReducerCreator(isLongEnough, listCombination)
var uppercaseReducer = mapReducerCreator(strUpperCase, listCombination)
```

将这些实用函数定义为接收两个参数而不是一个参数不太方便组合，因此我们使用我们的 curry(..) （柯里化）方法, 所谓柯里化就是将多个参数转变成为一个个参数连接起来的样子。

```
// 柯里化方法
var curryMapReducer = function (mapFn) {
    return function (combinationFn) {
        return function (list, str) {
            return combinationFn(list, mapFn(str))
        }
    }
}
var curryFilterReducer = function (predictFn) {
    return function (combinationFn) {
        return function (list, str) {
            if (predictFn(str)) return combinationFn(list, str)
            return list
        }
    }
}

var longEnoughReducer = curryFilterReducer(isLongEnough)(listCombination)
var uppercaseReducer = curryMapReducer(strUpperCase)(listCombination)
var words = ['hello', 'lanyage', 'this']

let upperLongWords =
    words.reduce(uppercaseReducer, [])
        .reduce(longEnoughReducer, [])
        .reduce(strConcat, "")

console.log(upperLongWords.trim())

// HELLO LANYAGE THIS
```

高阶函数的使用还可以减少大量的中间代码。

比如，想对一个字符串进行处理。1，去除多余的空格。2，转化为数字并加1。3，最后返回该值对应的字母。

```
// 传统做法

var tranform = (s) => String.fromCharCode(parseInt(s.trim()) + 1)
console.log(tranform("96"))

// a
```

```
// 改进做法

var transform = (s) => [s]
    .map(s => s.trim())
    .map(s => parseInt(s))
    .map(s => s + 1)
    .map(s => String.fromCharCode(s))[0]
console.log(transform("96"))

// a
```
但是这样可以进一步优化。比如创建一个Box，Box就是一个functor。functor 是实现了 map 函数并遵守一些特定规则的容器类型。

那么这些特定的规则具体是什么咧？

```
const Box = (x) => ({
    map: f => Box(f(x)),
    fold: f => f(x),
    inspect: () => `Box(${x})`
})

var transform = (s) =>
    Box(s)
        .map(s => s.trim())
        .map(i => parseInt(i))
        .map(i => i + 1)
        .map(i => String.fromCharCode(i))
        .fold(c => c.toUpperCase())

console.log(transform('96'))

// A
```
其实这个 Box 就是一个函子（functor），因为它实现了 map 函数。当然你也可以叫它 Mappable 或者其他名称。用于实现链式调用。

Either / Maybe

现在有一个需求，获取对应颜色的十六进制的 RGB 值，并返回去掉#后的大写值。

```
const findColor = (name) => ({
  red: '#ff4444',
  blue: '#3b5998',
  yellow: '#fff68f',
})[name]

const redColor = findColor('red')
  .slice(1)
  .toUpperCase() // FF4444

const greenColor = findColor('green')
  .slice(1)
  .toUpperCase()
```
以上代码在输入已有颜色的 key 值时运行良好，不过一旦传入其他颜色就会报错。咋办咧？

咱们来先看看函数式的解决方案~

函数式将错误处理抽象成一个 Either 容器，而这个容器由两个子容器 Right 和 Left 组成。

```
const Left = (x) => ({
    map: f => Left(x),
    fold: (f, g) => f(x),
    inspect: () => `Left(${x})`
})

const Right = (x) => ({
    map: f => Right(f(x)),
    fold: (f, g) => g(x),
    inspect: () => `Right(${x})`
})

const right = Right(4)
    .map(x => x * 7 + 1)
    .map(x => x / 2)

console.log(right.inspect())    //Right(14.5)

console.log(right.fold(e => '出错', x => x))  // 14.5


const left = Left(4)
    .map(x => x * 7 + 1)
    .map(x => x / 2)

console.log(left.inspect())
console.log(left.fold(e => '出错', x => x))
```

可以看出 Right 和 Left 相似于 Box:

- 最大的不同就是 fold 函数，这里需要传两个回调函数，左边的给 Left 使用，右边的给 Right 使用。
- 其次就是 Left 的 map 函数忽略了传入的函数（因为出错了嘛，当然不能继续执行啦）。
  
回到刚才的问题。

```
const Left = (x) => ({
    map: f => Left(x),
    fold: (f, g) => f(x),
    inspect: () => `Left(${x})`
})

const Right = (x) => ({
    map: f => Right(f(x)),
    fold: (f, g) => g(x),
    inspect: () => `Right(${x})`
})

// 用来处理空和非空
const fromNullable = (x) => x == null ? Left(null) : Right(x)

const findColor = (key) => fromNullable(({
    red: '#ff4444',
    blue: '#3b5998',
    yellow: '#fff68f'
})[key])


var color = findColor('red')
    .map(c => c.slice(1))
    .fold(e => 'no color', c => c.toUpperCase())

console.log(color)

// no color
// 这里就不会报错
```

Either的好处就是以后不需要再小心翼翼地在函数里面进行参数的判断。

Chain / FlatMap / bind / >>=

假设现在有个 json 文件里面保存了端口，我们要读取这个文件获取端口，要是出错了返回默认值 3000。

```
// config.json
{ "port": 8888 }

// chain.js
const fs = require('fs')

const getPort = () => {
  try {
    const str = fs.readFileSync('config.json')
    const { port } = JSON.parse(str)
    return port
  } catch(e) {
    return 3000
  }
}

const result = getPort()
```

Either 来重构下看看效果。

```
const fs = require('fs')

const Left = (x) => ({ ... })
const Right = (x) => ({ ... })

const tryCatch = (f) => {
  try {
    return Right(f())
  } catch (e) {
    return Left(e)
  }
}

const getPort = () => tryCatch(
    () => fs.readFileSync('config.json')
  )
  .map(c => JSON.parse(c))
  .fold(e => 3000, c => c.port)

```
但是parseJSON也可能出错，这样以来需要多层folder

所以聪明机智的函数式又想出一个新方法 chain~。

```
...

const Left = (x) => ({
  ...
  chain: f => Left(x) // 和 map 一样，直接返回 Left
})

const Right = (x) => ({
  ...
  chain: f => f(x),   // 直接返回，不使用容器再包一层了
})

const tryCatch = (f) => { ... }

const getPort = () => tryCatch(
    () => fs.readFileSync('config.json')
  )
  .chain(c => tryCatch(() => JSON.parse(c))) // 使用 chain 和 tryCatch
  .fold(
    e => 3000,
    c => c.port
  )
```

例2

```
const Left = (x) => ({
    map: f => Left(x),
    fold: (f, g) => f(x),
    inspect: () => x,
    chain: f => Left(x)
})

const Right = (x) => ({
    map: f => Right(f(x)),
    fold: (f, g) => g(x),
    inspect: () => x,
    chain: f => f(x)
})

const methodA = (x) => {
    if (x == 0) throw new Error("除数不能为0")
    return x / 2
}

const methodB = (x) => {
    if (x.length < 10) throw new Error("字符串太短")
    return x.toUpperCase()
}

const catchException = (f) => {
    try {
        return Right(f())
    } catch (e) {
        return Left(e)
    }
}

const result = catchException(() => methodA(1))
    .map(s => s + "$$$adidas")
    .chain(s => catchException(() => methodB(s)))
    .fold(e => e.message, r => r)
console.log(result)
```

其实这里的 Left 和 Right 就是单子（Monad），因为它实现了 chain 函数。chain一般用来实现多个异常的抓取。


```
monad 是实现了 chain 函数并遵守一些特定规则的容器类型。
```

也就是说 Monad 一定是 Functor。Monad 十分强大，之后我们将利用它处理各种副作用。
  

半群（Semigroup）

虽然理论上对于 <Number, +> 来说它符合半群的定义：

- 数字相加返回的仍然是数字（广群）
- 加法满足结合律（半群）

但是数字并没有 concat 方法

```
const Sum = (x) => ({
  x,
  concat: ({ x: y }) => Sum(x + y), // 采用解构获取值
  inspect: () => `Sum(${x})`,
})

Sum(1)
  .concat(Sum(2))
  .inspect() 
  
// Sum(3)
```

除此之外，`<Boolean, &&>` 也满足半群的定义~

```
const All = (x) => ({
    x,
    concat: ({x: y}) => All(x && y),
    inspect: () => `All(${x})`
})

console.log(All(true).concat(All(true)).inspect())

// false
```

用来重写一个String的半群。

```
const First = (x) => ({
    x,
    concat: () => First(x),
    inspect: () => `First(${x})`
})

console.log(First("hello").concat(First("world")).inspect())

// First(hello)
```

先说下这玩意儿有啥用。

```
const data1 = {
  name: 'steve',
  isPaid: true,
  points: 10,
  friends: ['jame'],
}
const data2 = {
  name: 'steve',
  isPaid: false,
  points: 2,
  friends: ['young'],
}
```

假设有两个数据，需要将其合并，那么利用半群，我们可以对 name 应用 First，对于 isPaid 应用 All，对于 points 应用 Sum，最后的 friends 已经是半群了。

```
const Sum = (x) => ({ ... })
const All = (x) => ({ ... })
const First = (x) => ({ ... })


const data1 = {
  name: First('steve'),
  isPaid: All(true),
  points: Sum(10),
  friends: ['jame'],
}
const data2 = {
  name: First('steve'),
  isPaid: All(false),
  points: Sum(2),
  friends: ['young'],
}


const concatObj = (obj1, obj2) => Object.entries(obj1)
  .map(([ key, val ]) => ({
    // concat 两个对象的值
    [key]: val.concat(obj2[key]),
  }))
  .reduce((acc, cur) => ({ ...acc, ...cur }))

concatObj(data1, data2)
/*
  {
    name: First('steve'),
    isPaid: All(false),
    points: Sum(12),
    friends: ['jame', 'young'],
  }
*/
```

如何将字符串变成对象的key。

```
const k = "name"
const p = {[k] : 'hello kitty'}
```
数组转对象

```
const ps = [['a', 1], ['b', 2]]
const ps2 = ps.map(([k, v]) => {
    console.log(k, v)
    return {[k] : v}
}).reduce((origin, current) => ({...origin, ...current}), {})
```

合并复杂的对象

```
const person1 = {
    name: First("lanyage"),
    score: Sum(20)
}
const person2 = {
    name: First("lanyage"),
    score: Sum(40)
}


const concatPerson = (p1, p2) =>
    Object.entries(p1)
        .map(([name, score]) => ({[name]: score.concat(p2[name]).get()}))
        .reduce((o, c) => {
            return {...o, ...c}
        }, {})
const result = concatPerson(person1, person2)
console.log(result)

// {name: "lanyage", score: 60}
```

幺半群（Monoid）

对于数字加法这个半群来说，0就是它的单位元，所以 <Number, +, 0> 就构成一个幺半群。同理：

* 对于 <Number, *> 来说单位元就是 1
* 对于 <Boolean, &&> 来说单位元就是 true
* 对于 <Boolean, ||> 来说单位元就是 false
* 对于 <Number, Min> 来说单位元就是 Infinity
* 对于 <Number, Max> 来说单位元就是 -Infinity

但是First不是幺半群。

其实看到幺半群的第一反应应该是默认值或初始值，例如 reduce 函数的第二个参数就是传入一个初始值或者说是默认值。

```
console.log([].reduce((o, c) => o + c, 0))

// 0
```

总结:

```
//normal box
// const Box = (s) => ({
//     map: f => Box(f(s)),
//     fold: f => f(s)
// })
// const s = "hello"
// const result = Box(s).map(s => s.toUpperCase()).map(s => s.split("").join(",")).fold(e => e)
// console.log(result)


//lazy box
// const LazyBox = (g) => ({
//     map: f => LazyBox(() => f(g())),
//     fold: f => f(g())
// })
//
// const s = "hello"
// const result = LazyBox(() => s).map(s => s.toUpperCase()).map(s => s.split("").join(",")).fold(e => e)
// console.log(result)

//either maybe
// const Left = (x) => ({
//     map: f => Left(x),
//     fold: (f, g) => f(x)
// })
// const Right = (x) => ({
//     map: f => Right(f(x)),
//     fold: (f, g) => g(x)
// })
// const s = undefined;
// const s = "lanyage";
// const handleString = (s) => s === undefined ? Left(s) : Right(s)
// const result = handleString(s).map(s => s.toUpperCase()).map(s => s.split("").join(",")).fold(() => "字符串不能为空", e => e)
// console.log(result)

//exception catcher
// const Left = (x) => ({
//     map: f => Left(x),
//     fold: (f, g) => f(x),
//     chain: f => Left(x)
// })
//
// const Right = (x) => ({
//     map: f => Right(f(x)),
//     fold: (f, g) => g(x),
//     chain: f => f(x)
// })
//
// const add = (a, b) => {
//     if (a < b) throw new Error("a不能比b小")
//     return a + b
// }
// const multiply = (x, b) => {
//     if (b == 0) throw new Error("被除数不能为0")
//     return x / b
// }
//
// const catcher = (f) => {
//     try {
//         return Right(f())
//     } catch (e) {
//         return Left(e)
//     }
// }
// const result = catcher(() => add(2, 1))
//     .chain((s) => catcher(() => multiply(s, 0)))
//     .fold(e => e.message, r => r)
// console.log(result)
```

## Promise

一个 Promise 就是一个代表了异步操作最终完成或者失败的对象。

```
function successCallback(result) {
  console.log("声音文件创建成功: " + result);
}

function failureCallback(error) {
  console.log("声音文件创建失败: " + error);
}

createAudioFileAsync(audioSettings, successCallback, failureCallback)
```

```
const promise = createAudioFileAsync(audioSettings); 
promise.then(successCallback, failureCallback);
```
或

```
createAudioFileAsync(audioSettings).then(successCallback, failureCallback);
```

Promise 最直接的好处就是链式调用。

基本上，每一个 Promise 代表了链式中另一个异步过程的完成。

```
doSomething().then(function(result) {
  return doSomethingElse(result);
})
.then(function(newResult) {
  return doThirdThing(newResult);
})
.then(function(finalResult) {
  console.log('Got the final result: ' + finalResult);
})
.catch(failureCallback);
```
例

```
const doSomething = () => 1
const doSecondThing = (x) => x + 1
const doThirdThing = (x) => x * 2
const chain = (g) => ({
    then: f => chain(() => f(g())),
    get: f => f(g())
})

const result = chain(doSomething).then(doSecondThing).then(doThirdThing).get(e => e)
console.log(result)

// 4
```

```

new Promise((resolve, reject) => {
    console.log('initial')

    setTimeout(()=>{resolve()}, 3000)
}).then(() => {
    throw new Error('something went wrong!')
}).catch((e) => {
    console.log('after catch, ', e.message)
}).then(() => {
    console.log('Do this whatever happened before!')
})
```

基本上，一个 Promise 链式遇到异常就会停止，查看链式的底端，寻找catch处理程序来代替当前执行。在同步的代码执行之后，这是非常模型化的。

```
setTimeout(() => saySomething("10 seconds passed"), 10000);
```
混用旧式回调和 Promise 是会有问题的。如果 saySomething  函数失败了或者包含了编程错误，那就没有办法捕获它了。

幸运的是我们可以用 Promise 来包裹它。最好的做法是将有问题的函数包装在最低级别，并且永远不要再直接调用它们：

```
const wait = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms)
    })
}
wait(3000).then(() => {throw new Error('出错了')}).catch((e) => {console.log(e.message)})
```

组合

时序组合。

```
function f1() {
    console.log('f1')
}

function f2() {
    console.log('f2')
}

[f1, f2].reduce(function (promise, f) {
    return promise.then(f)
}, Promise.resolve())


```

```
for (let f of [func1, func2]) {
  await f();
}
```

为了避免意外，即使是一个已经变成 resolve 状态的 Promise，传递给 then 的函数也总是会被异步调用：

```
Promise.resolve().then(() => {console.log(2)})
console.log(1)
```

传递到then中的函数被置入了一个微任务队列，而不是立即执行，这意味着它是在JavaScript事件队列的所有运行时结束了，事件队列被清空之后才开始执行：

```
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

wait().then(() => console.log(4));
Promise.resolve().then(() => console.log(2)).then(() => console.log(3));
console.log(1); 

// 1, 2, 3, 4
```

简便的 Promise 链式编程最好保持扁平化，不要嵌套 Promise，嵌套经常会是粗心导致的。

简单的例子.

```
const promise = new Promise((resolve, reject) => {
    const timeout = Math.random() * 2
    console.log('timeOut = ', timeout)
    setTimeout(() => {
        if (timeout < 1) {
            resolve("成功了")
        } else {
            reject("失败了")
        }
    }, timeout)
})

promise.then((result) => {
    console.log(result)
}).catch((e) => {
    console.log(e)
})
```

并行执行

```
var p1 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 500, 'P1');
});
var p2 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 600, 'P2');
});
// 同时执行p1和p2，并在它们都完成后执行then:
Promise.all([p1, p2]).then(function (results) {
    console.log(results); // 获得一个Array: ['P1', 'P2']
});
```
有些时候，多个异步任务是为了容错。比如，同时向两个URL读取用户的个人信息，只需要获得先返回的结果即可。这种情况下，用Promise.race()实现：

```
var p1 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 500, 'P1');
});
var p2 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 600, 'P2');
});
Promise.race([p1, p2]).then(function (result) {
    console.log(result); // 'P1'
});
```

规范

```
var promise = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…
 
  if (/* everything turned out fine */) {
    resolve("Stuff worked!");
  }
  else {
    reject(Error("It broke"));
  }
});
```

Async/Await 

await 把异步变成了同步。

```
async function f1() {
    await (() => {
        f2()
    })()

    await (() => {
        f3()
    })()
    await (() => {
        f4()
    })()

    console.log('done')
}

const wait = (ms) => {
    const start = new Date().getTime()
    while (new Date().getTime() - start < ms) ;
}

const f2 = () => {
    wait(1000)
    console.log('f2')
}

const f3 = () => {
    wait(3000)
    console.log('f3')
}

const f4 = () => {
    wait(2000)
    console.log('f4')
}

f1()
```
每次遇到 await 关键字时，Promise 都会停下在，一直到运行结束，所以总共花费是 1+3+2 = 6 秒

Promise完全改变了js异步编程的写法，让异步编程变得十分的易于理解。

```
const wait = (ms) => new Promise((rs, rj) => setTimeout(rs, ms))

var p1 = wait(5000).then(() => {
    console.log('hello')
    return 'hello'
})

var p2 = wait(3000).then(() => {
    console.log('world')
    return 'world'
})

Promise.all([p1, p2]).then((e) => {
    console.log(e)
    console.log('all done')
})
```

nodeJS考虑使用Generator

## 并发模型(同步、异步)

同步：如果在函数A返回的时候，调用者就能够得到预期结果(即拿到了预期的返回值或者看到了预期的效果)，那么这个函数就是同步的。

```
Math.sqrt(2);
console.log('Hi');
```
异步AJAX

```
主线程：“你好，AJAX线程。请你帮我发个HTTP请求吧，我把请求地址和参数都给你了。”

AJAX线程：“好的，主线程。我马上去发，但可能要花点儿时间呢，你可以先去忙别的。”

主线程：：“谢谢，你拿到响应后告诉我一声啊。”

(接着，主线程做其他事情去了。一顿饭的时间后，它收到了响应到达的通知。)
```

异步函数通常具有以下的形式：

A(args..., callbackFn)

```
const laucher = (data, f) => {
    dosomething(data, f)
}
const dosomething = (data, f) => {
    setTimeout(() => {
        console.log('done', data + 1)
        f(data + 1)
    }, 3000)
}
laucher(1, x => x + 1)
```
同步可以保证顺序一致，但是容易导致阻塞；异步可以解决阻塞问题，但是会改变顺序性。


## 构造器和继承

```
var Person = function (name, age) {
    this.name = name;               // 公有属性
    this.age = age;
    var type = 'Person'             // 私有属性
    this.setType = (t) => {
        type = t
    }
    this.getType = () => {
        return type
    }
}



var p = new Person();
p.age = 18
p.name = 'zhangsan'

console.log(p.getType())
p.setType('Hello')
console.log(p.getType())
```

```
// 使用闭包来实现类
const Counter = (x) => {
    if (typeof x !== 'number') throw new Error('参数必须为数字')
    return {
        x,
        count: () => Counter(x + 1),
        get: () => {
            return x
        }
    }
}

let counter = Counter(1)

for (var i = 0; i < 10; i++) {
    console.log(counter.get())
    counter = counter.count()
}
```
```
var Employee = (function() {
  function Employee(name) {
    this.getName = function() {
      return name;
    };
  }

  return Employee;
}());

```

// 继承

* 默认 原型链

```
function Parent(name) {
    this.name = name || 'lanyage'
}

Parent.prototype.get = function () {
    return this.name
}

function Child() {

}
```

```
// 默认模式  原型链跟踪模式
function inherit(C, P) {
    C.prototype = new P()
}
```

这样继承了父类的自由属性也继承了原型属性，导致没有自己的自有属性，修改原型的属性同时也会修改父类对象的属性。

* 借用构造器

```
// 借用构造器
function Parent(name) {
    this.name = name || 'lanyage'
}

Parent.prototype.get = function () {
    return this.name
}

function Child(name) {
    Parent.call(this, name)
}
```

这样虽然能继承父类的自有属性，但是不能继承原型中的属性和函数。

* 借用构造器+原型链

```
function Parent(name) {
    this.name = name || 'lanyage'
}
Parent.prototype.get = function () {
    return this.name
}
function Child(name) {
    Parent.call(this, name)
}
Child.prototype = new Parent()
console.log(new Parent('hello').get())
console.log(new Child("hello2").get())
```

这样导致父类的构造器被调用两次，父类的自有属性也被继承2次。

* 共享原型

```
function Parent(name) {
    this.name = name || 'lanyage'
    console.log('called')
}

Parent.prototype.get = function () {
    return this.name
}

function Child(name) {
    Parent.call(this, name)
}

Child.prototype = Parent.prototype

console.log(new Child("hello2").get())

console.log(new Parent().get())
```
子类对象对原型的修改会导致父类的原型也发生变化。


* 临时构造器

```
function Parent() {
}
Parent.prototype.get = function () {
    return this.name
}

function Child() {

}

function inherit(C, P) {
    function F() {
    }

    F.prototype = P.prototype
    C.prototype = new F()
    C.uber = P.prototype
    C.prototype.constructor = C
}

inherit(Child, Parent)

var child = new Child()
console.log(child.constructor.name)
```

* 复制和拷贝属性

```
function extend(parent, child) {
	var i;
	child = child || {};
	for (i in parent) {
		if (parent.hasOwnProperty(i)) {
			child[i] = parent[i];
		}
	}
	return child;
}
```

上面给出的实现叫作对象的“浅拷贝”。

```
var parent = {
    a: 1,
    b: {
        c: 2,
        d: 3,
    },
}
function cp(parent, child) {
    var child = child || {}
    for (var i in parent) {
        if (parent.hasOwnProperty(i)) {
            if (typeof parent[i] === 'object') {
                child[i] = (parent[i] instanceof Array) ? [] : {}
                cp(parent[i], child[i])
            } else {
                child[i] = parent[i]
            }
        }
    }
    return child
}
var c = cp(parent)
c.b.c = 222
console.log(c)
console.log(parent)
```
上面的是深拷贝

Es6的同构是浅拷贝。

```
let a = {
    b : {
        c : 1,
        d : 2
    }
}
let b = {
    a : {
        c : 1,
        d : 2
    }
}
let c = {...a, ...b}
c.a.c = 111
console.log(c)
console.log(b)
```

混元

```
function mix(...objs) {
    var result = {}
    for (var item of objs) {
        result = {...result, ...cp(item)}
    }
    return result
}
```

## Memorization 实现函数结果的缓存

Memoization 是一种将函数返回值缓存起来的方法，在 Lisp, Ruby, Perl, Python 等语言中使用非常广泛。随着 Ajax 的兴起，客户端对服务器的请求越来越密集（经典如 autocomplete），如果有一个良好的缓存机制，那么客户端 JavaScript 程序的效率的提升是显而易见的。

一般用于递归的优化，但是只适用于纯函数。类似于动态规划。

```
unction memoizer(fundamental, cache) {   
  cachecache = cache || {};   
  var shell = function(arg) {   
      if (! (arg in cache)) {   
          cache[arg] = fundamental(shell, arg);   
      }   
      return cache[arg];   
  };   
  return shell;   
} 
```

## 函数式编程

1. 与面向对象编程（Object-oriented programming）和过程式编程（Procedural programming）并列的编程范式。
2. 最主要的特征是，函数是第一等公民。
3. 强调将计算过程分解成可复用的函数，典型例子就是map方法和reduce方法组合而成 MapReduce 算法。
4. 只有纯的、没有副作用的函数，才是合格的函数。

数据是集合，函数时数据的管道。

函数式编程源于范畴学。关键术语：函子、 Maybe函子、Either函子(Left, Right)、Ap函子、Monad函子

- Maybe函子用来处理null。
- Either函子用来对错误的结果进行处理和异常的链式捕获。
- Ap函子用于对于那些多参数的函数，就可以从多个容器之中取值，实现函子的链式操作。

```
function add(x) {
  return function (y) {
    return x + y;
  };
}

Ap.of(add).ap(Maybe.of(2)).ap(Maybe.of(3));
```
函数必须是柯里化后的效果。

- Monad 函子的作用是，总是返回一个单层的函子。Monad 函子的重要应用，就是实现 I/O （输入输出）操作。







