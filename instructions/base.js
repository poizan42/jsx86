if (1) //non-global scope
{
	//i = {prefixes, opcode, modRM, SIB, disp, imm, op1, op2, info}
	var iNone = {hasModRM: false,
		 SIBMode: jsx86.instruction.SIBMode.none,
		 op1Mode: jsx86.instruction.OpMode.none,
		 op2Mode: jsx86.instruction.OpMode.none,
		 op2Flags: {},
		 dispSize: jsx86.instruction.FieldLength.none,
		 immSize: jsx86.instruction.FieldLength.none};
	var iEvGv = {hasModRM: true,
		 SIBMode: jsx86.instruction.SIBMode.byModRM,
		 op1Mode: jsx86.instruction.OpMode.rOperandSize,
		 op2Mode: jsx86.instruction.OpMode.rOperandSize,
		 op2Flags: {},
		 dispSize: jsx86.instruction.FieldLength.byModRM,
		 immSize: jsx86.instruction.FieldLength.none};
	var iEbGb = unionMaps(iEvGv, {
		 op1Mode: jsx86.instruction.OpMode.r8,
		 op2Mode: jsx86.instruction.OpMode.r8});
	var iEvSw = unionMaps(iEvGv,{
		op1Mode: jsx86.instruction.OpMode.segment});
	var ib = unionMaps(iNone,{
		immSize: jsx86.instruction.FieldLength.one});
	//MOV Eb,Gb 0x88
	jsx86.instruction.registerB1Instruction(0x88,
		unionMaps(iEbGb,
		{translator: function (i) {return i.op2[1](i.op1[0])}}));
	//MOV Ev,Gv 0x89
	jsx86.instruction.registerB1Instruction(0x89,
		unionMaps(iEvGv,
		{translator: function (i) {return i.op2[1](i.op1[0])}}));
	//MOV Gb,Eb 0x8A
	jsx86.instruction.registerB1Instruction(0x8A,
		unionMaps(iEbGb,
		{translator: function (i) {return i.op1[1](i.op2[0])}}));
	//MOV Gv,Ev 0x8B
	jsx86.instruction.registerB1Instruction(0x8B,
		unionMaps(iEvGv,
		{translator: function (i) {return i.op1[1](i.op2[0])}}));
	//MOV Ev,Sw 0x8C
	jsx86.instruction.registerB1Instruction(0x8C,
		unionMaps(iEvSw,{
			translator: function (i) {return i.op2[1](i.op1[0])}}));
	//LEA Gv,M 0x8D
	jsx86.instruction.registerB1Instruction(0x8D,
		unionMaps(iEvGv,{
			op2Flags: {EffectiveAddress: true},
			translator: function (i) {return i.op1[1](i.op2[0])}}));
	//MOV Sw,Ev 0x8E
	jsx86.instruction.registerB1Instruction(0x8E,
		unionMaps(iEvSw,{
			translator: function (i) {return i.op1[1](i.op2[0])}}));
	//NOP 0x90
	jsx86.instruction.registerB1Instruction(0x90,
		unionMaps(iNone,{
			translator: function (i) {return ';'}}));
	//0xB0 - 0xB7
	//MOV immediate byte into byte register - low order byte is register
	var movib = function (i)
	{
		var reg = i.opcode & 0x0F;
		var set = jsx86.instruction.r8Map[reg][1];
		return set(i.imm);
	}
	var movibInf = unionMaps(ib,{
			translator: movib});
	//MOV (r8),Ib 0xB0 - 0xB7
	for (var i=0; i <= 7; i++)
		jsx86.instruction.registerB1Instruction(0xB0|i,movibInf);
}
