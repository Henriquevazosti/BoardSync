console.log('=== DEBUG CARDS ===');
console.log('Total cards em data.cards:', Object.keys(data.cards).length);
console.log('Cards em colunas:');
Object.entries(data.columns).forEach(([colId, col]) => {
  console.log(\\: \ cards\, col.cardIds);
});
console.log('Cards órfãos (não estão em nenhuma coluna):');
const allCardIdsInColumns = Object.values(data.columns).flatMap(col => col.cardIds);
const orphanCards = Object.keys(data.cards).filter(cardId => !allCardIdsInColumns.includes(cardId));
console.log(orphanCards);
console.log('Cards duplicados em colunas:');
const duplicates = allCardIdsInColumns.filter((item, index) => allCardIdsInColumns.indexOf(item) !== index);
console.log(duplicates);
