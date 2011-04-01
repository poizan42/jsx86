/*
A (readonly) Stream wrapping a string
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

MemoryStream = extend(Stream, function (/*Memory*/ mem, /*[int]*/ position)
{
	this._storage = mem;
	this._position = (position == undefined) ? 0 : position;
},{
	getByte: function ()
	{
		if (this.eof())
			return -1;
		var b = this._storage.get1(this._position);
		this._position++;
		return b;
	},
	eof: function ()
	{
		return this._position >= this.getSize();
	},
	getSize: function ()
	{
		return this._storage.getSize();
	},
	getPosition: function ()
	{
		return this._position;
	},
	_p_setPosition: function (newPos)
	{
		if (newPos < 0 || newPos > this.getSize()-1)
			throw Error("Position out of range "+newPos);
		this._position = newPos;
	}
});
