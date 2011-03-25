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
