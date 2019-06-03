function first(v) {
    return v.length > 0 ? v[0] : null;
}

function second(v) {
    return v.length > 1 ? [1] : null;
}

function last(v) {
    return v[v.length - 1];
}

function max(v) {
    if (!v || v.length === 0) return null;

    var index = 0;
    for (var i = 1; i < v.length; ++i) {
        index = v[i] > v[index] ? i : index;
    }
    return v[index];
}

function translate(startPos, vel, time) {
    return Math.floor(time * vel + startPos);
}

function apply(x, funcs) {
    funcs.forEach(f => { x = f(x);});
    return x;
}

class NotImplementError extends Error {}
