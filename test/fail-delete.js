var o = { p: 1 };
delete o.p;
if (Object.prototype.hasOwnProperty.call(o, 'p')) {
    throw new Error('delete broke');
}
