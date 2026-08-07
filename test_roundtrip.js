const Inko = require('inko');
const inko = new Inko();

console.log(inko.en2ko(inko.ko2en('r')));     // ㄱ
console.log(inko.en2ko(inko.ko2en('ㄱk')));   // 가
console.log(inko.en2ko(inko.ko2en('가s')));   // 간
console.log(inko.en2ko(inko.ko2en('간k')));   // 간ㅏ (Wait, rksk -> 가나. Let's check ko2en('간k'))
console.log("ko2en('간k') ->", inko.ko2en('간k'));
console.log("en2ko(rksk) ->", inko.en2ko('rksk'));
