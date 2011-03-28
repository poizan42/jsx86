/*
core stuff for jsx86
Copyright (C) 2011 Kasper Fabæch Brandt

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

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

function shallowCopy(obj)
{
	if(obj == null || typeof(obj) != 'object')
		return obj;
	if(obj.constructor == Array)
		return [].concat(obj);
	var temp = {};
	for(var key in obj)
		temp[key] = obj[key];
	return temp;
}

function unionMaps(obj1,obj2)
{
	var temp = {};
	for(var key in obj1)
		temp[key] = obj1[key];
	for(var key in obj2)
		temp[key] = obj2[key];
	return temp;
}

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
