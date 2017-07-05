function rando() {

var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

var text = '';

for (var i = 0; i < 6; i++)
  text += chars.charAt(Math.floor(Math.random() * chars.length));
  return text;


}
console.log(rando());