# JavaScript函数式编程

1. 首先来温习一下小学学的数学知识。

	* 结合律
	
		`(a + b) + c = a + (b + c)  && add(add(a, b), c) = add(a, add(b, c))`
	* 交换律

		`x + y = y + x  && add(x, y) = add(y, x)`  
	* 同一律

		` x + 0 = x && add(x, 0) = x`
	* 分配律	 	

		`a * (b + c) = a * b + a * c && multiply(a, add(b, c)) = add(multiply(a, b), multiply(a, c))`
		
2. 先来一个代码优化热身下。

	```
	var getServerStuff = function(callback){
	  return ajaxCall(function(json){
	    return callback(json);
	  });
	};
	// 这样的代码很垃圾，因为嵌套了太多层。
	var getServerStuff = ajaxCall
	// 这样才对。
	```		  
	咱们来细分一下。
	
	```
	 return ajaxCall(function(json){
	    return callback(json);
	  });
	  
	 等价于
	 
	 return ajaxCall(callback)
	 
	 那么
	 
	 var getServerStuff = function(callback){
	  return ajaxCall(function(json){
	    return callback(json);
	  });
	};
	
	就等价于
	
	var getServerStuff = function(callback) {
		return ajaxCall(callback)
	}
	
	也就是等价于
	
	var getServerStuff = ajaxCall
	```
	到此，我们知道了这样一个规律。
	
	```
	httpGet('/post/2', function(json){
	  return renderPost(json);
	});
	
	这样的代码可以优化成下面这样
	httpGet('/post/2', renderPost)	//一等公民函数renderPost
	```
3. 除了删除不必要的函数，正确地为参数命名也必不可少。
	
	```
	// 只针对当前的博客
	var validArticles = function(articles) {
	  return articles.filter(function(article){
	    return article !== null && article !== undefined;
	  });
	};
	
	// 对未来的项目友好太多
	var compact = function(xs) {
	  return xs.filter(function(x) {
	    return x !== null && x !== undefined;
	  });
	};
	```
	在命名的时候，我们特别容易把自己限定在特定的数据上（本例中是 articles）。这种现象很常见，也是重复造轮子的一大原因。

4. 再来了解下纯函数吧。

	纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。
	
	```
	var xs = [1,2,3,4,5]
	console.log(xs.slice(0,3))  //纯
	console.log(xs)
	console.log(xs.splice(0,3)) //DUMB
	console.log(xs)
	```
	在函数式编程中，我们讨厌这种会改变数据的笨函数。
	
	```
	var threshold = 18

	var checkAge = function(age) {
	  return age >= threshold       //不纯
	}
	var checkAge2 = function(age) {
	  var threshold = 18
	  return age >= threshold      //纯
	}
	```
	也讨厌这种依赖于外部数据的傻函数。当然也有补救措施，Object.freeze({threshold : 18})。

	函数是不同数值之间的特殊关系：每一个输入值返回且只返回一个输出值。
	
	![](https://www.mathsisfun.com/sets/images/function-sets.svg)
	
	（http://www.mathsisfun.com/sets/function.html）	
	后面这种就不是一种函数关系。
	
	![](https://www.mathsisfun.com/sets/images/relation-not-function.gif)
	
	（https://www.mathsisfun.com/sets/function.html）
	
	函数可以描述为一个集合，这个集合里的内容是 (输入, 输出) 对：[(1,2), (3,6), (5,10)]（看起来这个函数是把输入值加倍）。
	
	通过下面这个例子来进一步理解下。
	
	```
	var toLowerCase = {"A":"a", "B": "b", "C": "c", "D": "d", "E": "e", "D": "d"};
	toLowerCase["C"];
	```
	当然了，实际情况中你可能需要进行一些计算而不是手动指定各项值；不过上例倒是表明了另外一种思考函数的方式。
	
	纯函数就是数学上的函数，而且是函数式编程的全部。
	
	为什么一再要求纯函数呢？
	
	- 可缓存性（Cacheable）
	
		首先，纯函数总能够根据输入来做缓存。
		
		```
		 var square = x => x * x;
		 var createMemo = f => {
			  var cache = {}
			  return x => {
			    if(cache[x] === undefined || cache[x] === null) {
			      cache[x] = f(x)
			      console.log('%c计算', 'color:orange;font-size:16px')
			    }else {
			      console.log('%c缓存', 'color:red;font-size:16px')
			    }
			    return cache[x]
			  }
		}
		var memoizeSquare = createMemo(square);
		console.time('lazy')
		console.log(memoizeSquare(2))
		console.timeEnd('lazy')
		console.time('lazy2')
		console.log(memoizeSquare(2))
		console.timeEnd('lazy2')
		console.time('lazy3')
		console.log(memoizeSquare(2))
		console.timeEnd('lazy3')
		console.time('lazy4')
		console.log(memoizeSquare(2))
		console.timeEnd('lazy4')
		```
		值得注意的一点是，可以通过延迟执行的方式把不纯的函数转换为纯函数：
		
		```
		var pureHttpCall = memoize(function(url, params){
		  return function() { return $.getJSON(url, params); }
		});
		```
		
		这里有趣的地方在于我们并没有真正发送 http 请求——只是返回了一个函数，当调用它的时候才会发请求。这个函数之所以有资格成为纯函数，是因为它总是会根据相同的输入返回相同的输出：给定了 url 和 params 之后，它就只会返回同一个发送 http 请求的函数。
	
		现在来看这种方式意义不大，不过很快我们就会学习一些技巧来发掘它的用处。重点是我们可以缓存任意一个函数，不管它们看起来多么具有破坏性。
	
	- 可测试性（Testable）

5. 柯里化

	有些事物在你得到之前是无足轻重的，得到之后就不可或缺了。
	
	curry 的概念很简单：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。

	```
	var add = function(x) {
	  return function(y) {
	    return x + y;
	  };
	};
	
	var increment = add(1);
	var addTen = add(10);
	
	increment(2);
	// 3
	
	addTen(2);
	// 12
	```		
	
	柯里化的例子
	
	```
	var curry = require('lodash').curry;
	var match = curry(function(what, str) {
	  return str.match(what);
	});
	
	var replace = curry(function(what, replacement, str) {
	  return str.replace(what, replacement);
	});
	
	var filter = curry(function(f, ary) {
	  return ary.filter(f);
	});
	
	var map = curry(function(f, ary) {
	  return ary.map(f);
	});
	
	------------splitter-----------
	
	match(/\s+/g, "hello world");
	// [ ' ' ]
	
	match(/\s+/g)("hello world");
	// [ ' ' ]
	
	var hasSpaces = match(/\s+/g);
	// function(x) { return x.match(/\s+/g) }
	
	hasSpaces("hello world");
	// [ ' ' ]
	
	hasSpaces("spaceless");
	// null
	
	filter(hasSpaces, ["tori_spelling", "tori amos"]);
	// ["tori amos"]
	
	var findSpaces = filter(hasSpaces);
	// function(xs) { return xs.filter(function(x) { return x.match(/\s+/g) }) }
	
	findSpaces(["tori_spelling", "tori amos"]);
	// ["tori amos"]
	
	var noVowels = replace(/[aeiou]/ig);
	// function(replacement, x) { return x.replace(/[aeiou]/ig, replacement) }
	
	var censored = noVowels("*");
	// function(x) { return x.replace(/[aeiou]/ig, "*") }
	
	censored("Chocolate Rain");
	// 'Ch*c*l*t* R**n'
	```
	
	这里策略性把要操作的数据（String， Array）放到最后一个参数里。
	
	这里表明的是一种“预加载”函数的能力，通过传递一到两个参数调用函数，就能得到一个记住了这些参数的新函数。
	
	curry 的用处非常广泛，就像在 hasSpaces、findSpaces 和 censored 看到的那样，只需传给函数一些参数，就能得到一个新函数。
	
	
6. 代码组合

	- 函数饲养
	
		```
		var compose = function(f,g) {
		  return function(x) {
		    return f(g(x));
		  };
		};
		```	
		f 和 g 都是函数，x 是在它们之间通过“管道”传输的值。
		
		```
		var compose = (f, g) => x => f(g(x))
		var emphasize = x => x + "!"
		var toUpperCase = x => x.toUpperCase()
		var shout = compose(emphasize, toUpperCase)
		console.log(shout("you are awesome"))
		```
		
		在 compose 的定义中，g 将先于 f 执行，因此就创建了一个从右到左的数据流。这样做的可读性远远高于嵌套一大堆的函数调用，如果不用组合，shout 函数将会是这样的：
		
		```
		var shout = function(x){
		  return exclaim(toUpperCase(x));
		};
		```
		所有的组合都有的一个特性。
		
		```
		var associative = compose(f, compose(g, h)) == compose(compose(f, g), h);
		// 满足结合律
		```
		
	- pointfree
	
		pointfree 模式指的是，永远不必说出你的数据。
		
		```
		// 非 pointfree，因为提到了数据：word
		var snakeCase = function (word) {
		  return word.toLowerCase().replace(/\s+/ig, '_');
		};
		
		// pointfree
		var snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
		```
		一等公民的函数、柯里化（curry）以及组合协作起来非常有助于实现这种模式。
		
		```
		这里所做的事情就是通过管道把数据在接受单个参数的函数间传递。
		另外注意在 pointfree 版本中，不需要 word 参数就能构造函数；
		而在非 pointfree 的版本中，必须要有 word 才能进行一切操作。
		```
		pointfree 就像是一把双刃剑，有时候也能混淆视听。
		
## 应用

- 声明式代码

	```
	// 命令式
	var authenticate = function(form) {
	  var user = toUser(form);
	  return logIn(user);
	};
	
	// 声明式
	var authenticate = compose(logIn, toUser);
	```

	因为声明式代码不指定执行顺序，所以它天然地适合进行并行运算。
	
## 容器

```
var Container = function(x) {
  this.__value = x;
}

Container.of = function(x) {
  return new Container(x);
};

console.log(Container.of(3))
```	

这是咱们的第一个容器，我们贴心地把它命名为 Container。
		
有了盒子我们必须提供一个方法去操作这个里面的值。

```
Container.prototype.map = function(f){
  return Container.of(f(this.__value))
}

console.log(Container.of(2).map(function(x) {
  return x * 2
}))

console.log(Container.of("hello").map(function(x){
  return x.toUpperCase()
}))
```
Container 里的值传递给 map 函数之后，就可以任我们操作。为了防止意外再把它放回它所属的 Container。这样做的结果是，我们能连续地调用 map，运行任何我们想运行的函数。如果我们能一直调用 map，那它不就是个组合（composition）么！这个数学魔法就是 functor。

- Functor

	functor 是实现了 map 函数并遵守一些特定规则的容器类型。
	
	让容器自己去运用函数能给我们带来什么好处？答案是抽象，对于函数运用的抽象。当 map 一个函数的时候，我们请求容器来运行这个函数。

- Maybe

	```
	var Maybe = function(x){
	  this.__value = x;
	};
	
	Maybe.of = function(x){
	  return new Maybe(x)
	}
	Maybe.prototype.isNothing = function(){
	  return (this.__value === null || this.__value === undefined)
	}
	Maybe.prototype.map = function(f){
	  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value))
	}
	```			
	
	Maybe 看起来跟 Container 非常类似，但是有一点不同：Maybe 会先检查自己的值是否为空，然后才调用传进来的函数。这样我们在使用 map 的时候就能避免恼人的空值了（注意这个实现出于教学目的做了简化）。
	
	```
	console.log(Maybe.of(null).map(function(x) {
	  return x.toUpperCase();
	}))
	```
	
	注意看，当传给 map 的值是 null 时，代码并没有爆出错误。
	
	实际当中，Maybe 最常用在那些可能会无法成功返回结果的函数中。

- 释放容器里的值

	我们的代码，就像薛定谔的猫一样，在某个特定的时间点有两种状态，而且应该保持这种状况不变直到最后一个函数为止。这样，哪怕代码有很多逻辑性的分支，也能保证一种线性的工作流。
	
- Either

	```
	var Right = function(x) {
	  this.__value = x
	}
	Right.of = function(x) {
	  return new Right(x)
	}
	Right.prototype.map = function(f) {
	  return Right(f(__this.value))
	}
	
	
	var Left = function(x) {
	  this.__value = x
	}
	Left.of = function(x) {
	  return new Left(x)
	}
	Left.prototype.map = function(f) {
	  return Right(__this.value)
	}
	
	
	var isString = s => (typeof s === 'string')
	
	var isStringLongEnough = function(b) {
	  return function(s) {
	    if(s !== null && s !== undefined && isString(s)){
	      return Right.of(s.length - b > 0);
	    }
	    return Left.of("字符串长度不够或者格式不正确");
	  }
	}
	var longerThan3 = isStringLongEnough(3)
	console.log(longerThan3)
	console.log(longerThan3("Hello"))

	// Right {__value: true}
	```
	
- Monad

	一个 functor，只要它定义个了一个 join 方法和一个 of 方法，并遵守一些定律，那么它就是一个 monad。	
	
	```
	Maybe.of(null).chain(safeProp('address')).chain(safeProp('street'));
	```
			