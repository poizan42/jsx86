(function () //non-global scope
{
	var getValByMode = function(src,mode)
	{
		if (mode)
			return src;
		return '('+src+' & 0x0000FFFF)';
	}
	var setValByMode = function(dst,src,mode)
	{
		if (mode)
			return dst+' = '+src+';';
		return dst+' = '+src+' | ('+dst+' & 0xFFFF0000);';
	}
	var setValL8 = function(dst,src)
	{
		return dst+' = '+src+' | ('+dst+' & 0xFFFFFF00);';
	}
	var setValH8 = function(dst,src)
	{
		return dst+' = ('+src+' << 8) | ('+dst+' & 0xFFFF00FF);';
	}
	
	//i = {prefixes, opcode, modRM, SIB, disp, imm, op1, op2, info}
	var iNone = {hasModRM: false,
		 SIBMode: jsx86.instruction.SIBMode.none,
		 op1Mode: jsx86.instruction.OpMode.none,
		 op2Mode: jsx86.instruction.OpMode.none,
		 flags: {},
		 dispSize: jsx86.instruction.FieldLength.none,
		 immSize: jsx86.instruction.FieldLength.none};
	var iGvEv = {hasModRM: true,
		 SIBMode: jsx86.instruction.SIBMode.byModRM,
		 op1Mode: jsx86.instruction.OpMode.rOperandSize,
		 op2Mode: jsx86.instruction.OpMode.rOperandSize,
		 flags: {},
		 dispSize: jsx86.instruction.FieldLength.byModRM,
		 memSize: jsx86.instruction.FieldLength.byMode,
		 immSize: jsx86.instruction.FieldLength.none};
	var iEvGv = unionMaps(iGvEv, {flags: {ReverseArgs: true}});
	var iGbEb = unionMaps(iEvGv, {
		 op1Mode: jsx86.instruction.OpMode.r8,
		 op2Mode: jsx86.instruction.OpMode.r8,
		 memSize: jsx86.instruction.FieldLength.byMode});
	var iEbGb = unionMaps(iGbEb, {flags: {ReverseArgs: true}});
	var iEvSw = unionMaps(iEvGv,{
		op1Mode: jsx86.instruction.OpMode.segment,
		memSize: jsx86.instruction.FieldLength.one});
	var iSwEv = unionMaps(iEvSw, {flags: {ReverseArgs: true}});
	var iOb = unionMaps(iNone,{
		dispSize: jsx86.instruction.FieldLength.byMode,
		memSize: jsx86.instruction.FieldLength.one});
	var iOv = unionMaps(iNone,{
		dispSize: jsx86.instruction.FieldLength.byMode,
		memSize: jsx86.instruction.FieldLength.byMode});
	var iIb = unionMaps(iNone,{
		immSize: jsx86.instruction.FieldLength.one});
	var iIv = unionMaps(iNone,{
		immSize: jsx86.instruction.FieldLength.byMode});
	var iEvIv = unionMaps(iEvGv, {
		 op1Mode: jsx86.instruction.OpMode.none,
		 op2Mode: jsx86.instruction.OpMode.rOperandSize,
		 immSize: jsx86.instruction.FieldLength.byMode});	
	var iEbIb = unionMaps(iEvGv, {
		 op1Mode: jsx86.instruction.OpMode.none,
		 op2Mode: jsx86.instruction.OpMode.r8,
		 immSize: jsx86.instruction.FieldLength.one,
		 memSize: jsx86.instruction.FieldLength.one});
	var iEv = unionMaps(iEvGv, {
		 op1Mode: jsx86.instruction.OpMode.none});
	var movTrans = function (i)
	{
		return i.op1[1](i.op2[0])
	}
	var movMap = {translator: movTrans};
	//MOV Eb,Gb 0x88
	jsx86.instruction.registerB1Instruction(0x88, unionMaps(iEbGb,movMap));
	//MOV Ev,Gv 0x89
	jsx86.instruction.registerB1Instruction(0x89, unionMaps(iEvGv,movMap));
	//MOV Gb,Eb 0x8A
	jsx86.instruction.registerB1Instruction(0x8A, unionMaps(iGbEb,movMap));
	//MOV Gv,Ev 0x8B
	jsx86.instruction.registerB1Instruction(0x8B, unionMaps(iGvEv,movMap));
	//MOV Ev,Sw 0x8C
	jsx86.instruction.registerB1Instruction(0x8C, unionMaps(iEvSw,movMap));
	//LEA Gv,M 0x8D
	jsx86.instruction.registerB1Instruction(0x8D,
		unionMaps(iGvEv,{
			flags: {EffectiveAddress: true},
			translator: movTrans}));
	//MOV Sw,Ev 0x8E
	jsx86.instruction.registerB1Instruction(0x8E, unionMaps(iSwEv,movMap));
	//NOP 0x90
	jsx86.instruction.registerB1Instruction(0x90,
		unionMaps(iNone,{
			translator: function (i) {return ';'}}));
			
	//MOV AL,Ob 0xA0
	jsx86.instruction.registerB1Instruction(0xA0,
		unionMaps(iOb,{
			translator: function (i) {return setValL8('c.eax',i.op2[0])}}));
	//MOV rAX,Ov 0xA1
	jsx86.instruction.registerB1Instruction(0xA1,
		unionMaps(iOv,{
			translator: function (i) {return setValByMode('c.eax',i.op2[0],i.longOp)}}));
	//MOV Ob,AL 0xA2
	jsx86.instruction.registerB1Instruction(0xA2,
		unionMaps(iOb,{
			translator: function (i) {return i.op2[1]('c.eax & 0xFF')}}));
	//MOV Ov,rAX 0xA3
	jsx86.instruction.registerB1Instruction(0xA3,
		unionMaps(iOv,{
			translator: function (i) {return i.op2[1](getValByMode('c.eax',i.longOp))}}));
			
	//0xB0 - 0xB7
	//MOV immediate byte into byte register - low order byte is register
	var movib = function (i)
	{
		var reg = i.opcode & 0x0F;
		var set = jsx86.instruction.r8Map[reg][1];
		return set(i.imm);
	}
	var movibInf = unionMaps(iIb,{translator: movib});
	//MOV (r8),Ib 0xB0 - 0xB7
	for (var i=0; i <= 7; i++)
		jsx86.instruction.registerB1Instruction(0xB0|i,movibInf);
		
	//0xB8 - 0xBF
	//MOV immediate byte into (mode) register - lowest 3 bits is register
	var moviv = function (i)
	{
		var reg = i.opcode & 0x07;
		var map = i.longOp ? jsx86.instruction.r32Map :
		                     jsx86.instruction.r16Map;
		var set =  map[reg][1];
		return set(i.imm);
	}
	var movivInf = unionMaps(iIv,{
			translator: moviv});
	//MOV (rv),Iv 0xB8 - 0xBF
	for (var i=0; i <= 7; i++)
		jsx86.instruction.registerB1Instruction(0xB8|i,movivInf);
		
	//MOV Eb,Ib 0xC6 (ext 0)
	jsx86.instruction.registerB1InstructionEx(0xC6, 0,
		unionMaps(iEbIb,{
			translator: function (i) {return i.op1[1](i.imm)}}));
	//MOV Ev,Iz 0xC7 (ext 0)
	jsx86.instruction.registerB1InstructionEx(0xC7, 0,
		unionMaps(iEvIv,{
			translator: function (i) {return i.op1[1](i.imm)}}));
	
	//NOP Ev 0x0F 0D
	/*This encoding isn't listed under the description of NOP,
	  but it is in Volume 2B, Table A-3.
	  Note that both ndisasm and objdump errornously claims this to be an
	  encoding of prefetch.
	*/
	jsx86.instruction.registerB23Instruction(0x0D,0,
		unionMaps(iEv,{
			translator: function (i) {return ';'}}));
	//NOP Ev 0x0F 1F
	//This is the standard encoding of this strange instruction...
	jsx86.instruction.registerB23Instruction(0x1F,0,
		unionMaps(iEv,{
			translator: function (i) {return ';'}}));
})();
