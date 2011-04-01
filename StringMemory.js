/*
A (readonly) Memory wrapping a string
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

StringMemory = extend(Memory, function (/*string*/ str)
{
	this._storage = str;
},{
	get1: function (address)
	{
		if (address < 0 || address >= this._storage.length)
			throw new OutOfRangeException('address out of range');
		return this._storage.charCodeAt(address);
	},
	getSize: function ()
	{
		return this._storage.length;
	}
});
