export default function add(num1, num2) {
  var c = 0,
    r = [];
  var x = num1.split("").map(Number);
  var y = num2.split("").map(Number);
  while (x.length || y.length) {
    var s = (x.pop() || 0) + (y.pop() || 0) + c;
    r.unshift(s < 10 ? s : s - 10);
    c = s < 10 ? 0 : 1;
  }
  if (c) r.unshift(c);
  return r.join("");
}
