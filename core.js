function extend(superc, ctor, overrides) {
	var subc = ctor;
 
	var F = function() {};
	F.prototype = superc.prototype;
	subc.prototype = new F();
	subc.prototype.constructor = ctor;
	subc.prototype.prototype = subc.prototype;
	subc.prototype.superclass = superc.prototype;
 
	if (overrides) {
		for (var i in overrides) {
			subc.prototype[i] = overrides[i];
		}
	}
	return subc;
};

var jsx86 = {};

jsx86.cpu = {
	eip: 0,
	eax: 0,
	ebx: 0,
	ecx: 0,
	edx: 0,
	esi: 0,
	edi: 0,
	ebp: 0,
	esp: 0,
	eflags: 0,
	cs: 0,
	ds: 0,
	ss: 0,
	es: 0,
	fs: 0,
	gs: 0
};
