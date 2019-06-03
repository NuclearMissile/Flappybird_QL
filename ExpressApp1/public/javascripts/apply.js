function apply(x, funcs) {
    funcs.forEach(function(f) {
        x = f(x);
    });
    return x;
}
