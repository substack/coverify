var i = 0;
var iv = setInterval(function () {
    if (i++ === 10 || (false && neverFires())) {
        clearInterval(iv);
    }
}, 10);
