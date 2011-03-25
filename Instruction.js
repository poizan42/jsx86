jsx86.instruction = {};
if (1)
{
	var p = {};
	//Group 1 — Lock and repeat prefixes:
	//LOCK prefix is encoded using F0H
	p[0xF0] = [1,'LOCK'];
	/*REPNE/REPNZ prefix is encoded using F2H. Repeat-Not-Zero prefix
	  applies only to string and input/output instructions. (F2H is also
	  used as a mandatory prefix for some instructions) */
	p[0xF2] = [1,'REPN'];
	/*REP or REPE/REPZ is encoded using F3H. Repeat prefix applies only to
	  string and input/output instructions.(F3H is also used as a mandatory 
	  prefix for some instructions) */
	p[0xF3] = [1,'REP'];
	//Group 2 - Segment override prefixes:
	//2EH—CS segment override (use with any branch instruction is reserved)
	p[0x2E] = [2,'CSoverride'];
	//36H—SS segment override (use with any branch instruction is reserved)
	p[0x36] = [2,'SSoverride'];
	//3EH—DS segment override (use with any branch instruction is reserved)
	p[0x3E] = [2,'DSoverride'];
	//26H—ES segment override (use with any branch instruction is reserved)
	p[0x26] = [2,'ESoverride'];
	//64H—FS segment override (use with any branch instruction is reserved)
	p[0x64] = [2,'FSoverride'];
	//65H—GS segment override (use with any branch instruction is reserved)
	p[0x65] = [2,'GSoverride'];
	//— Branch hints:
	//3EH—Branch taken (used only with Jcc instructions)
	p[0x3E] = [2,'BranchTaken'];
	//2EH—Branch not taken (used only with Jcc instructions)
	p[0x2E] = [2,'BranchNotTaken'];
	//Group 3
	/*Operand-size override prefix is encoded using 66H (66H is also used as a
	  mandatory prefix for some instructions). */
	p[0x66] = [3,'OperandSizeOverride'];
	//Group 4
	//67H—Address-size override prefix
	p[0x67] = [4,'AddressSizeOverride'];
	jsx86.instruction.prefixes = p;
	jsx86.instruction.prefixvals = {};
	for (i in p)
	{
		jsx86.instruction.prefixvals[p[i][1]] = i;
	}
}
	//instruction maps
	/*instruction info format:
		{hasModRM: boolean, hasSIB: boolean, dispSize: int, immSize: int,
		 translator: function (prefixes, opcode, modRM, SIB, disp, imm)}
	  B1 instructions are indexed by their opcode
	  B2 instructions are indexed by their second opcode
	  B3 instructions are indexed by ther second and third opcode (Big Endian)
	  B2 and B3 instructions consists of arrays of four elements to define
	  different instructions depending on mandatory prefixes.
	  [0] = default, [1] = prefix 66, [2] = prefix F3, [3] = prefix F2
	*/
	jsx86.instruction.B1Instructions = [];
	jsx86.instruction.B23Instructions = [];

	jsx86.instruction.decodeInstruction = function(/*stream*/ code)
	{
		var prefixes = [];
		var pgroups = [];
		var checkGetByte()
		{
			var b;
			if ((b = code.getByte()) == -1)
				throw Error('EOF while decoding instruction');
			return b;
		}
		var decodeFields = function(i)
		{
			var b;
			var modRM = null;
			if (i.hasModRM)
			{
				b = checkGetByte();
				modRM = {};
				modRM.val = b;
				modRM.mod = b >> 6;
				modRM.regOp = (b >> 3) & 0x7;
				modRM.RM = b & 0x7;
			}
			var SIB = null;
			if (i.hasSIB)
			{
				b = checkGetByte();
				SIB = {};
				SIB.scale = b >> 6;
				SIB.index = (b >> 3) & 0x7;
				SIB.base = b & 0x7
			}
			var disp = 0;
			for (var n = 0; n < i.dispSize; n++)
			{
				b = checkGetByte();
				disp |= b << (n*8);
			}
			var imm = 0;
			for (var n = 0; n < i.immSize; n++)
			{
				b = checkGetByte();
				imm |= b << (n*8);
			}
			return {prefixes: prefixes, modRM: modRM, SIB: SIB, disp: disp, imm: imm};
		}
		var b;
		
		while ((b = code.getByte()) != -1)
		{
			prefix = jsx86.instructions.prefixes[b];
			if (prefix != undefined)
			{
				if (pgroups[prefix[0]])
					throw Error('Multiple prefixes from same group');
				prefixes.push(prefix);
			}
			else
			{
				//2 byte instructions starts with 0F.
				//3 byte instructions starts with either 0F 38 or 0F 3A
				if (b != 0F)
				{
					var inst = jsx86.instruction.B1Instructions[b];
					if (inst === undefined)
						throw Error('Unknown instruction: '+b);
					return decodeFields(inst);
				}
				b = checkGetByte();
				var opcode = b;
				if (b == 0x38 || b == 0x3A)
				{
					b = checkGetByte();
					opcode = (opcode << 8) | b;
				}
				var insts = jsx86.instruction.B23Instructions[opcode];
				if (insts == undefined)
					throw Error('Unknown instruction: '+b);
				var inst = insts[0];
				if ((pgroups[3] == 0x66) && (insts[1] != undefined))
					inst = insts[1];
				else if (pgroups[1] == 0xF3) 
					inst = insts[2];
				else if (pgroups[1] == 0xF2)
					inst = insts[3];
				if (inst == undefined)
					throw Error('Missing mandatory prefix for: '+b);
				return decodeFields(inst);
			}
		}
		throw Error('EOF while decoding instruction');
	}
