	//i = {prefixes, opcode, modRM, SIB, disp, imm, op1, op2, info}
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
