StringStream = extend(Stream, function (/*string*/ str, /*int*/ position)
{
	this._storage = str;
	this._position = (position == undefined) ? 0 : position;
},{
	getByte: function ()
	{
		if (this.eof())
			return -1;
		var b = this._storage.charCodeAt(position);
		this._position++;
		return b;
	},
	eof: function ()
	{
		return this._position >= this._storage.length; 
	}
}
