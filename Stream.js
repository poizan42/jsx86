/*
Abstract Stream class
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

Stream = extend(Object, function ()
{
	throw new Error("Pure virtual!");
},{
	getByte: function ()
	{
		throw new Error("Not implemented!");
	},
	putByte: function ()
	{
		throw new Error("Not implemented!");
	},
	getSize: function ()
	{
		throw new Error("Not implemented!");
	},
	getPosition: function ()
	{
		throw new Error("Not implemented!");
	},
	eof: function ()
	{
		return this.getPosition() >= this.getSize();
	},
	read: function (/*array*/ buffer, /*int*/ count)
	{
		var c = 0;
		while (((b = this.getByte()) != -1) && (c < count))
		{
			buffer[c] = b;
			c++;
		}
		return c;
	});
