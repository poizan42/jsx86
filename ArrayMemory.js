/*
A Memory wrapping an array
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

StringMemory = extend(Memory, function (/*string*/ array, /*int*/ size)
{
	this._storage = array;
	this._size = size;
},{
	_checkRange: function (address)
	{
		if (address < 0 || address >= this._size.length)
			throw new OutOfRangeException('address out of range');
	},
	get1: function (address)
	{
		this._checkRange(address);
		var v = this._storage[address >> 2];
		if (v == undefined)
			return 0;
		else
			return (v >> (address % 4)*8) & 0xFF;
	},
	get4: function (address)
	{
		this._checkRange(address);
		var v = this._storage[address >> 2];
		if (v == undefined)
			return 0;
		else
			return v;
	},
	set1: function (address,value)
	{
		this._checkRange(address);
		if (this._storage[address >> 2] == undefined)
			this._storage[address >> 2] = 0;
		var sh = (address % 4)*8;
		this._storage[address >> 2] = (value << sh) |
			(this._storage[address >> 2] & ~(0xFF << sh))
	},
	set4: function (address,value)
	{
		this._checkRange(address);
		if (this._storage[address >> 2] == undefined)
			this._storage[address >> 2] = 0;
		his._storage[address >> 2] = value;
	},
	getSize: function ()
	{
		return this._size;
	}
});
