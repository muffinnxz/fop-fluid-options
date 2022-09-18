import add from "./add";

export default function h2d(s) {
  var dec = "0";
  s.split("").forEach(function (chr) {
    var n = parseInt(chr, 16);
    for (var t = 8; t; t >>= 1) {
      dec = add(dec, dec);
      if (n & t) dec = add(dec, "1");
    }
  });
  return dec;
}
