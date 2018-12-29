# JavaScript入门


## this关键字

this表示的是方法的调用者。

1. 普通方法的调用。
	
	```
	function showThis() {
	  console.log(this)
	}
	showThis()
	
	//此处的this表示的是全局的window对象
	```
2. 对象调用自己的方法。

	```
	function showThis() {
	  console.log(this)
	}
	var obj = {}
	obj.showThis = showThis
	obj.showThis()
	
	//此处的this表示的是obj对象
	```
3. 提供方法的调用者。

	```
	function showThis() {
	  console.log(this)
	}
	var obj = {}
	obj.showThis = showThis
	obj.showThis.call(obj)		//此处的this表示的是obj
	obj.showThis.call(window)  //此处的this表示的是window对象
	
	//其上的代码等价于
	obj.showThis.bind(obj)() 或
	obj.showThis.apply(obj)
	```	
4. 构造方法调用。

	```
	function Person() {
	  console.log(this)
	  console.log(this.__proto__.constructor)
	}
	new Person()
	
	// 当通过new关键字调用方法的时候，相当于构造函数，那么this表示是这个类的当前实例。
	// this.__proto__.constructor表示的是这个对象的构造方法。
		ƒ Person() {
		  console.log(this)
		  console.log(this.__proto__.constructor)
		}
	```	

## 闭包

闭包是链接两个作用域的桥梁，狭义的讲闭包就是函数。

1. 	首先看看函数打印全局变量，你可能觉得这个没什么意思。

	```
	var x = 1
	function printX() {
	  console.log(x)
	}
	printX()
	
	// 1
	```
2. 但是如果函数在另一个函数里面的话，你就会看到不同了。

	```
	function noname() {
	  var x = 1
	  function printX() {
	    console.log(x)
	  }
	  printX()
	}
	console.log(x)		// 报错，x is not defined
	```	
3. 但是我又想获取这个x的值怎么办呢？请继续看。

	```
	function noname() {
	  var x = 1
	  function printX() {
	    return x
	  }
	  return printX()
	}
	var result = noname()
	console.log(result)	  //此时此刻，你已经拿到了x的值，但是又一个问题，你不能修改它。
	```
4. 如果我想获取修改这个值的权限怎么办？

	```
	function closureTest() {
	  var x = 1
	  return {
	    print: function() {
	      return x
	    },
	    increment: function() {
	      x += 1
	    }
	  }
	}
	var xOperator = closureTest()
	console.log(xOperator.print())
	xOperator.increment()
	console.log(xOperator.print())	//此时此刻，你已经对x进行了获取和修改。
	```	
5. 那么此时可能在想，闭包原来是这样，那么闭包到底能做什么呢？

	闭包的用处很大，大概可以有如下用途。
	
	1. 让变量常驻内存中。
	2. 实现类的私有变量	。

		```
		function Person(name) {
		  return (
		    function(name){
		      var name = name
		      return ({
		        getName: function() {
		          return name
		        },
		        setName: function(name) {
		          name = name
		        }
		      })
		    }
		  )(name)
		}
		var p = new Person('Lanyage')
		console.log(p)
		console.log(p.getName())
		
		//此时就通过闭包实现了类变量的私有。
		```
	3. 闭包在JavaScript的函数时编程上的作用也是大大的。

		```
		function add(x) {			//此时x 对于 内部函数 y 是可见的， 但是对于外部是不可见的。
		  return function(y) {
		    return x + y
		  }
		}
		console.log(add(2)(3))
		
		// 这里对函数进行了柯里化,x 和 y只是一个抽象, x 和 y甚至可以是函数、对象、数组等等。
		```
	4. 闭包还可实现懒惰计算。

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

## 类和继承

JavaScript是一门弱类型语言， 对于类这个概念并不是很具体。这也就造就了它相对其他强类型语言的独特性。虽然JavaScript中一切皆是对象，但是在面向对象编程时，好的类式编程会让代码模块行更高。

1. Es5的类。

	JavaScript没有class这么一个概念，我们可以在这里美其名为JavaScript类式编程。
	
	```
	function Person(name) {
	  this.name = name
	}
	console.log(new Person("Yage Lan"))
	
	// Person {name: "Yage Lan"}	这里的name是Person实例公有变量
	```	
	要想实现私有变量，可以使用 `闭包-5.2`中提到的方法实现类的私有变量。
	
	那么如果此时想有一个方法去打印name属性，可以通过原型来实现。
	
	```
	function Person(name) {
	  this.name = name
	}
	Person.prototype.getName = function() {
	  return this.name;
	}
	var person = new Person("Yage Lan")
	console.log(person.getName())
	
	// Yage Lan 此时此刻就实现了类的属性获取。
	```
2. Es6的类。

	JavaScript在Es6中给出了class的语法糖。
	
	```
	class Person {
	  constructor(name) {
	    this.name = name
	  }
	  getName() {
	    return this.name
	  }
	}
	
	var person = new Person("Yage Lan")
	console.log(person)
	console.log(person.getName())
	
	// 其实内部的实现和上面的实现是基本一致的。
	```		
3. Es5的继承。

	Es5常用的继承方式有多种。
	
	1. 原型链

		```
		function Parent(name) {
		  this.name = name;
		}
		Parent.prototype.sayName = function() {
		  return this.name;
		}
		function Child() {}
		Child.prototype = new Parent("Lanyage")
		console.log(new Parent("Lanyage").sayName())
		console.log(new Child("Hello").sayName())
		
		// 这样继承了父类的原型，因此子类对prototype的修改会影响父类对象的行为。
		// new Child("Hello").sayName() 仍然打印的是父类对象的name
		```
	2. 借用构造器

		```
		function Parent(name) {
		  this.name = name;
		}
		Parent.prototype.sayName = function() {
		  return this.name;
		}
		function Child(name) {
		  Parent.call(this, name)
		}
		
		console.log(new Parent("Lanyage").sayName())
		console.log(new Child("Hello").sayName())  //报错。
		
		//这样只能继承父类的自由变量和构造器，但是不能继承原型链。
		```
	3. 原型链+借用构造器

		```
		function Parent(name) {
		  console.log('run')
		  this.name = name;
		}
		Parent.prototype.sayName = function() {
		  return this.name;
		}
		function Child(name) {
		  Parent.call(this, name)
		}
		Child.prototype = new Parent("Lanyage")
		console.log(new Child("Hello").sayName())
		
		// 这样导致效率很低， 因为父类的构造器会调用两次， 父类的自由变量也会继承2次。
		```
	4. 共享原型

		```
		function Parent(name) {
		  console.log('run')
		  this.name = name;
		}
		Parent.prototype.sayName = function() {
		  return this.name;
		}
		function Child(name) {
		  Parent.call(this, name)
		}
		Child.prototype = Parent.prototype
		console.log(new Child("Hello").sayName())
		
		// 子类对象的原型的修改会影响父类对象的行为。
		```
	5. 中间构造器	

		```
		function Parent(name) {
		  console.log('run')
		  this.name = name;
		}
		Parent.prototype.sayName = function() {
		  return this.name;
		}
		function Child(name) {
		  Parent.call(this, name)
		}
		
		function F(){}
		F.prototype = Parent.prototype
		Child.prototype = new F()
		Child.uber = Parent.prototype
		Child.prototype.constructor = Child
		
		console.log(new Child("Hello"))
		console.log(new Child("Hello").sayName())
		
		// 这种方法是目前最流行的方法。
		```
4. Es6的继承。

	类似于3.1
			
