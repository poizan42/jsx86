/*
x86 instruction decoding
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
	jsx86.instruction.FieldLength = {
		none: 0,
		one: 1,
		two: 2,
		four: 3,
		byMode: 4, //2 for 16bit and 4 for 32bit
		byModRM: 5
	}
	
	jsx86.instruction.SIBMode = {
		none: 0,
		byModRM: 1
	}
	
	//op1 is the register only operand
	//op2 is the register or effective address operan
	
	jsx86.instruction.OpMode =
	{
		none: 0,
		r8: 1,
		rOperandSize: 2,
		mm: 3,
		xmm: 4
	}
	
	//AL,CL,DL,BL,AH,CH,DH,BH
	jsx86.instruction.r8Map = [
		['(c.eax & 0xFF)', function (v){return 'c.eax = (('+v+') & 0xFF) | (c.eax & 0xFFFFFF00);'}],
		['(c.ecx & 0xFF)', function (v){return 'c.ecx = (('+v+') & 0xFF) | (c.ecx & 0xFFFFFF00);'}],
		['(c.edx & 0xFF)', function (v){return 'c.edx = (('+v+') & 0xFF) | (c.edx & 0xFFFFFF00);'}],
		['(c.ebx & 0xFF)', function (v){return 'c.ebx = (('+v+') & 0xFF) | (c.ebx & 0xFFFFFF00);'}],
		['((c.eax & 0xFF00) >> 8)', function (v){return 'c.eax = ((('+v+') & 0xFF) << 8) | (c.eax & 0xFFFF00FF);'}],
		['((c.ecx & 0xFF00) >> 8)', function (v){return 'c.ecx = ((('+v+') & 0xFF) << 8) | (c.ecx & 0xFFFF00FF);'}],
		['((c.edx & 0xFF00) >> 8)', function (v){return 'c.edx = ((('+v+') & 0xFF) << 8) | (c.edx & 0xFFFF00FF);'}],
		['((c.ebx & 0xFF00) >> 8)', function (v){return 'c.ebx = ((('+v+') & 0xFF) << 8) | (c.ebx & 0xFFFF00FF);'}]
	];
	//AX,CX,DX,BX,SP,BP,SI,DI
	jsx86.instruction.r16Map = [
		['(c.eax & 0xFFFF)', function (v){return 'c.eax = (('+v+') & 0xFFFF) | (c.eax & 0xFFFF0000);'}],
		['(c.ecx & 0xFFFF)', function (v){return 'c.ecx = (('+v+') & 0xFFFF) | (c.ecx & 0xFFFF0000);'}],
		['(c.edx & 0xFFFF)', function (v){return 'c.edx = (('+v+') & 0xFFFF) | (c.edx & 0xFFFF0000);'}],
		['(c.ebx & 0xFFFF)', function (v){return 'c.ebx = (('+v+') & 0xFFFF) | (c.ebx & 0xFFFF0000);'}],
		['(c.esp & 0xFFFF)', function (v){return 'c.esp = (('+v+') & 0xFFFF) | (c.esp & 0xFFFF0000);'}],
		['(c.ebp & 0xFFFF)', function (v){return 'c.ebp = (('+v+') & 0xFFFF) | (c.ebp & 0xFFFF0000);'}],
		['(c.esi & 0xFFFF)', function (v){return 'c.esi = (('+v+') & 0xFFFF) | (c.esi & 0xFFFF0000);'}],
		['(c.edi & 0xFFFF)', function (v){return 'c.edi = (('+v+') & 0xFFFF) | (c.edi & 0xFFFF0000);'}]
	];
	//EAX,ECX,EDX,EBX,ESP,EBP,ESI,EDI
	jsx86.instruction.r32Map = [
		['c.eax', function (v){return 'c.eax = '+v+';'}],
		['c.ecx', function (v){return 'c.ecx = '+v+';'}],
		['c.edx', function (v){return 'c.edx = '+v+';'}],
		['c.ebx', function (v){return 'c.ebx = '+v+';'}],
		['c.esp', function (v){return 'c.esp = '+v+';'}],
		['c.ebp', function (v){return 'c.ebp = '+v+';'}],
		['c.esi', function (v){return 'c.esi = '+v+';'}],
		['c.edi', function (v){return 'c.edi = '+v+';'}]
	];
	//MM0,MM1,MM2,MM3,MM4,MM5,MM6,MM7
	jsx86.instruction.mmMap = [
		['c.mm0', function (v){return 'c.mm0 = '+v+';'}],
		['c.mm1', function (v){return 'c.mm1 = '+v+';'}],
		['c.mm2', function (v){return 'c.mm2 = '+v+';'}],
		['c.mm3', function (v){return 'c.mm3 = '+v+';'}],
		['c.mm4', function (v){return 'c.mm4 = '+v+';'}],
		['c.mm5', function (v){return 'c.mm5 = '+v+';'}],
		['c.mm6', function (v){return 'c.mm6 = '+v+';'}],
		['c.mm7', function (v){return 'c.mm7 = '+v+';'}]
	];
	//XMM0,XMM1,XMM2,XMM3,XMM4,XMM5,XMM6,XMM7
	jsx86.instruction.xmmMap = [
		['c.xmm0', function (v){return 'c.xmm0 = '+v+';'}],
		['c.xmm1', function (v){return 'c.xmm1 = '+v+';'}],
		['c.xmm2', function (v){return 'c.xmm2 = '+v+';'}],
		['c.xmm3', function (v){return 'c.xmm3 = '+v+';'}],
		['c.xmm4', function (v){return 'c.xmm4 = '+v+';'}],
		['c.xmm5', function (v){return 'c.xmm5 = '+v+';'}],
		['c.xmm6', function (v){return 'c.xmm6 = '+v+';'}],
		['c.xmm7', function (v){return 'c.xmm7 = '+v+';'}]
	];
	//[BX+SI], [BX+DI], [BP+SI], [BP+DI], [SI], [DI], [BP] / disp16, [BX] 
	jsx86.instruction.ea16Map = [
		'((c.ebx & 0xFFFF) + (c.esi & 0xFFFF))',
		'((c.ebx & 0xFFFF) + (c.edi & 0xFFFF))',
		'((c.ebp & 0xFFFF) + (c.esi & 0xFFFF))',
		'((c.ebp & 0xFFFF) + (c.edi & 0xFFFF))',
		'(c.esi & 0xFFFF)',
		'(c.edi & 0xFFFF)',
		'(c.ebp & 0xFFFF)', //or disp16 if mod==0
		'(c.ebx & 0xFFFF)',
	];
	//[EAX], [ECX], [EDX], [EBX], [--][--] (SIP), [EBP] / disp32, [ESI], [EDI]
	jsx86.instruction.ea32Map = [
		'c.eax',
		'c.ecx',
		'c.edx',
		'c.ebx',
		'0',
		'c.ebp', //or disp32 if mod==0
		'c.esi',
		'c.edi'
	];

	//instruction maps
	/*instruction info format:
		{hasModRM: boolean, SIBMode: SIBMode, op1Mode: Op1Mode, op2Mode: Op2Mode, dispSize: FieldLength, immSize: FieldLength,
		 translator: function (prefixes, opcode, modRM, SIB, disp, imm, op1, op2)}
	  B1 instructions are indexed by their opcode
	  B2 instructions are indexed by their second opcode
	  B3 instructions are indexed by ther second and third opcode (Big Endian)
	  B2 and B3 instructions consists of arrays of four elements to define
	  different instructions depending on mandatory prefixes.
	  [0] = default, [1] = prefix 66, [2] = prefix F3, [3] = prefix F2
	*/
	jsx86.instruction.B1Instructions = [];
	jsx86.instruction.B23Instructions = [];

	jsx86.instruction.decodeInstruction = function(/*stream*/ code, /*bool*/ longMode)
	{
		var prefixes = [];
		var pgroups = [];
		var longOp = longMode;
		var longAddr = longMode;
		var checkGetByte = function()
		{
			var b;
			if ((b = code.getByte()) == -1)
				throw Error('EOF while decoding instruction');
			return b;
		}
		var getMap = function(m,longOp)
		{
			switch (m)
			{
				case jsx86.instruction.OpMode.r8: 
					return jsx86.instruction.r8Map;
				case jsx86.instruction.OpMode.rOperandSize:
					if (!longOp)
						return jsx86.instruction.r16Map;
					else
						return jsx86.instruction.r32Map;
				case jsx86.instruction.OpMode.mm:
					return jsx86.instruction.mmMap;
				case jsx86.instruction.OpMode.xmm:
					return jsx86.instruction.xmmMap;
				default:
					return null;
			}
		}
		var decodeFields = function(i,op)
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
			if (longAddr && modRM != null &&
			    i.SIBMode == jsx86.instruction.SIBMode.byModRM &&
			    modRM.mod != 3 && modRM.RM == 4)
			{
				b = checkGetByte();
				SIB = {};
				SIB.scale = b >> 6;
				SIB.index = (b >> 3) & 0x7;
				SIB.base = b & 0x7;
			}
			var op1 = null; //the register in reg/op
			var op2 = null; //the operand in RM
			var memOp2 = false; //is op2 a pointer
			if (modRM != null && i.op1Mode != jsx86.instruction.OpMode.none)
			{
				var map = getMap(i.op1Mode,longOp);
				op1 = map[modRM.regOp];
			}
			var dispSize = 0;
			if (modRM != null && i.op2Mode != jsx86.instruction.OpMode.none)
			{
				if (modRM.mod == 3)
				{
					var map = getMap(i.op2Mode,longOp);
					op2 = map[modRM.RM];
				}
				else
				{
					memOp2 = true;
					var op2s = '';
					if (modRM.mod == 1)
						dispSize = 1;
					else if (modRM.mod == 2 && !longAddr)
						dispSize = 2;
					else if (modRM.mod == 2 && longAddr)
						dispSize = 4;
					if (modRM.mod == 0 && modRM.RM == 6 && !longAddr)
					{
						dispSize = 2;
						op2s = '';
					}
					else if (modRM.mod == 0 && modRM.RM == 6 && longAddr)
					{
						dispSize = 4;
						op2s = '';
					}
					else if (longAddr && modRM.RM == 4) //use SIB
					{
						if (SIB == null)
							throw new Error('Unexpected SIB requirement');
						var indexReg = jsx86.instruction.ea32Map[SIB.index];
						var scale = 1 << SIB.scale;
						var scaledIndex = indexReg+'*'+scale;
						var baseReg = jsx86.instruction.ea32Map[SIB.base];
						if (SIB.base == 5 && modRM.mod == 0)
						{
							baseReg = '0';
							dispSize = 4;
						}
						op2s = scaledIndex + '+' + baseReg;
					}
					else if (!longAddr)
						op2s = jsx86.instruction.ea16Map[modRM.RM];
					else
						op2s = jsx86.instruction.ea32Map[modRM.RM];
				}
			}
			switch (i.dispSize)
			{
				case jsx86.instruction.OpMode.none:
					dispSize = 0;
					break;
				case jsx86.instruction.OpMode.one:
					dispSize = 1;
					break;
				case jsx86.instruction.OpMode.two:
					dispSize = 2;
					break;
				case jsx86.instruction.OpMode.four:
					dispSize = 4;
					break;
				case jsx86.instruction.OpMode.byMode:
					dispSize = longAddr ? 4 : 2;
					break;
				//case jsx86.instruction.OpMode.byModRM: (no change)
			}
			var disp = 0;
			for (var n = 0; n < dispSize; n++)
			{
				b = checkGetByte();
				disp |= b << (n*8);
			}
			if (memOp2)
			{
				op2 = [
					'm.get('+op2s+')',
					function (v) { return 'm.set('+op2s+','+v+');' }
				];
			}
			var immSize = 0;
			switch (i.immSize)
			{
				case jsx86.instruction.OpMode.none:
					immSize = 0;
					break;
				case jsx86.instruction.OpMode.one:
					immSize = 1;
					break;
				case jsx86.instruction.OpMode.two:
					immSize = 2;
					break;
				case jsx86.instruction.OpMode.four:
					immSize = 4;
					break;
				case jsx86.instruction.OpMode.byMode:
					immSize = longOp ? 4 : 2;
					break;
			}
			var imm = 0;
			for (var n = 0; n < immSize; n++)
			{
				b = checkGetByte();
				imm |= b << (n*8);
			}
			return {opcode:op, prefixes: prefixes, modRM: modRM, SIB: SIB,
			        disp: disp, imm: imm, op1: op1, op2: op2, info:i};
		}
		var b;
		
		while ((b = code.getByte()) != -1)
		{
			prefix = jsx86.instruction.prefixes[b];
			if (prefix != undefined)
			{
				if (pgroups[prefix[0]])
					throw Error('Multiple prefixes from same group');
				pgroups[prefix[0]] = b;
				prefixes.push(b);
				if (b == jsx86.instruction.prefixvals.OperandSizeOverride)
					longOp = !longOp;
				else if (b == jsx86.instruction.prefixvals.AddressSizeOverride)
					longAddr = !longAddr;
			}
			else
			{
				//2 byte instructions starts with 0F.
				//3 byte instructions starts with either 0F 38 or 0F 3A
				if (b != 0x0F)
				{
					var inst = jsx86.instruction.B1Instructions[b];
					if (inst === undefined)
						throw Error('Unknown instruction: 0x'+
						            b.toString(16));
					return decodeFields(inst,b);
				}
				b = checkGetByte();
				var opcode = b;
				if (b == 0x38 || b == 0x3A)
				{
					b = checkGetByte();
					opcode = (opcode << 8) | b;
				}
				var opstr = '0x0F'+opcode.toString(16);
				var insts = jsx86.instruction.B23Instructions[opcode];
				if (insts == undefined)
					throw Error('Unknown instruction: '+opstr);
				var inst = insts[0];
				if ((pgroups[3] == 0x66) && (insts[1] != undefined))
					inst = insts[1];
				else if (pgroups[1] == 0xF3) 
					inst = insts[2];
				else if (pgroups[1] == 0xF2)
					inst = insts[3];
				if (inst == undefined)
					throw Error('Missing mandatory prefix for: '+opstr);
				return decodeFields(inst,opcode);
			}
		}
		throw Error('EOF while decoding instruction');
	}
	
	jsx86.instruction.registerB1Instruction = function (opcode, iInfo)
	{
		jsx86.instruction.B1Instructions[opcode] = iInfo;
	}
	
	jsx86.instruction.registerB23Instruction = function (opcode, prefix, iInfo)
	{
		if (jsx86.instruction.B23Instructions[opcode] == undefined)
			jsx86.instruction.B23Instructions[opcode] = [];
		jsx86.instruction.B23Instructions[opcode][prefix] = iInfo;
	}
