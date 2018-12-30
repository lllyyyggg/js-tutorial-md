const compose = (...arguments) => {
  const size = arguments.length ;
  const id = x => x;
  if(size === 0) return id;
  if(size === 1)
    return arguments[0];
  const composeHelp = (f, g) =>  x => g(f(x))
  return arguments.reverse().reduce(composeHelp, id)
}

const Container = x => ({
  map: f => Container.of(f(x)),
  peek: () => x
})
Container.of = x => Container(x)


const map = f => c => c.map(f)
const Maybe = x => ({
  map: f => x === undefined || x === null ? Maybe.of(x) : Maybe.of(f(x)),
  peek: invalid => x === undefined || x === null ? invalid() : x,
})
Maybe.of = x => Maybe(x)

const split = s => s.split('');
const upperCase = array => array.map(e => e.toUpperCase())
const invalid = msg => () => msg
const id = x => x;
const success = f => f
// console.log( Maybe.of( "hello" ).map( split ).map( upperCase ).peek( invalid( '参数错误' ), success( id ) ) )
// console.log( compose( peek(invalid( '参数错误' )), map( compose( upperCase, split ) ) )( Maybe.of( "hello" ) ) )

const Left = x => ({
  x,
  map: f => Left(x),
  peek:(msg, f) => x === undefined || x === null ? msg : f(x)
});
Left.of = x => Left(x);

const Right = x => ({
  x,
  map: f => Right(f(x)),
  peek: (msg, f) => x === undefined || x === null ? msg : f(x)
})
Right.of = x => Right(x);

// const decorateString = s => s === undefined || s === null ? Left(s) : Right(s)
// const peek = (msg, f) => m => m.peek(msg, f);
// console.log(compose(peek('格式不正确，兄弟！', id), map(compose(upperCase, split))) (decorateString('hello')))
// console.log(compose(peek('格式不正确，兄弟！', id), map(compose(upperCase, split))) (decorateString(null)))

const getWindow = () => window
window.lanyage = 'lanyage'
const IO = x => ({
  x,
  map: f => IO(compose(f, x)),
  peek: f => f(x)
})
IO.of = x => IO(() => x);
const peek = f => m => m.peek(f)
// console.log(compose(peek(x => x), map(x => x * 3))(IO.of(2))())

const Monad = x => ({
  x,
  map: f=> Monad.of(f(x)),
  join: () => x
})
Monad.of = x => Monad(x);
const st = {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]};

const spl = s => {
  return Monad(s.split(''))
}
const lowercase = array => array.map(x => x.toLowerCase())
const join = m => m.join()
console.log(compose(join, map(lowercase), map(upperCase))(spl('hello')))
