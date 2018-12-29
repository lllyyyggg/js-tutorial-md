var Maybe = function(x) {
  this.__value = x;
}

Maybe.of = function(x) {
  return new Maybe(x);
}
Maybe.prototype.isnothing = function() {
  return this.__value === null || this.__value === undefined;
}
Maybe.prototype.map = function(f) {
  return  this.isnothing() ? Maybe.of(null) : Maybe.of(f(this.__value))
}
Maybe.prototype.id = function() {
  return this.__value;
}

Maybe.prototype.join = function() {
  return this.isnothing() ? Maybe.of(null) : this.__value;
}

var compose = function(fns) {
		  if(fns.length === 1) {
		    return fns[0];
		  }
		  var compose = function(f,g) {
		    return function(o) {
		      return f(g(o));
		    }
		  }
		  if(fns.length === 2) {
		    return compose(fns[0], fns[1])
		  }else {
		    var arraylength = fns.length;
		    var result = compose(fns[arraylength - 2], fns[arraylength - 1]);
		    for(var i = arraylength - 3; i >= 0; i--) {
		      result = compose(fns[i], result)
		    }
		    return result;
		  }
}

var safeHead = function(array){
  return Maybe.of(array[0]);
}

var safeProp = function(name) {
  return function(object) {
    return Maybe.of(object[name])
  }
}
var map = function(f) {
  return function(mm) {
    return mm.map(f);
  }
}

var join = function(mm) {
  return mm.join();
}

var chain = function(f) {
  return function(m) {
    return m.map(f).join();
  }
}

var firstAddressStreet = compose([join,map(safeProp('street')),join,map(safeHead),safeProp('addresses')])
var firstAddressStreet2 = compose([chain(safeProp('street')),chain(safeHead),safeProp('addresses')])

console.log(firstAddressStreet( {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}))
console.log(firstAddressStreet2( {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}))
