const CH1_FIELD_NPCS = Object.freeze([
  {
    id: 'ch1-merchant',
    name: '마렌',
    role: 'merchant',
    x: 92,
    y: 176,
    collision: false,
    interaction: { action: 'open_shop', lines: ['길은 길고, 살아남을 물자는 부족하지.'] },
  },
  {
    id: 'ch1-survivor',
    name: '에단',
    role: 'survivor',
    x: 68,
    y: 131,
    collision: false,
    interaction: { action: 'start_rescue_hint', lines: ['북쪽으로 가려면, 뿌리 사이의 넓은 길을 따라가.'] },
  },
  {
    id: 'ch1-guide',
    name: '이실라',
    role: 'guide',
    x: 106,
    y: 54,
    collision: false,
    interaction: { action: 'show_gate_hint', lines: ['저 성문 너머에서 썩은 숲의 근원이 숨 쉬고 있어.'] },
  },
]);

export function buildCh1FieldNpcRoster() {
  return CH1_FIELD_NPCS.map((npc) => ({
    ...npc,
    interaction: { ...npc.interaction, lines: [...npc.interaction.lines] },
  }));
}

export function getNpcInteraction(roster, npcId) {
  const npc = roster.find((entry) => entry.id === npcId);
  if (!npc) throw new Error(`Unknown field NPC: ${npcId}`);
  return { ...npc.interaction, lines: [...npc.interaction.lines] };
}
