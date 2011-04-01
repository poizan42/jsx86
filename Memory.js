/*
Abstract Random Access Memory class
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

OutOfRangeException = extend(Error, function (msg){
	this.superclass(msg);
});

Memory = extend(Object, function ()
{
	throw new Error("Pure virtual!");
},{
	get1: function (address)
	{
		throw new Error("Not implemented!");
	},
	set1: function (address, value)
	{
		throw new Error("Not implemented!");
	},
	getSize: function ()
	{
		throw new Error("Not implemented!");
	},
	get2: function (address) //little endian  default
	{
		return (get1(address+1) << 8) | get1(address);
	},
	get4: function (address)
	{
		return (get2(address+1) << 16) | get2(address);
	},
	set2: function (address, value)
	{
		set1(address, value & 0xFF);
		set1(address+1, value >> 8);
	},
	set4: function (address, value)
	{
		set2(address, value & 0xFFFF);
		set2(address+3, value >> 16);
	}
	});
