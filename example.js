var map = f => array => array.map(f)
var even = x => x * 2
var evens = map(even)
console.log(evens([1,2,3,4,5]))
