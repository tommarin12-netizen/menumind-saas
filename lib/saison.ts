const PRODUITS: Record<number, { produit: string; emoji: string }[]> = {
  1: [{produit:'Endives',emoji:'🥬'},{produit:'Poireaux',emoji:'🧅'},{produit:'Chou-fleur',emoji:'🥦'},{produit:'Oranges',emoji:'🍊'},{produit:'Kiwi',emoji:'🥝'},{produit:'Huîtres',emoji:'🦪'}],
  2: [{produit:'Épinards',emoji:'🌿'},{produit:'Endives',emoji:'🥬'},{produit:'Pomelos',emoji:'🍋'},{produit:'Rhubarbe',emoji:'🌱'},{produit:'Huîtres',emoji:'🦪'},{produit:'Poireaux',emoji:'🧅'}],
  3: [{produit:'Asperges blanches',emoji:'🌾'},{produit:'Épinards',emoji:'🌿'},{produit:'Radis',emoji:'🌶️'},{produit:'Artichauts',emoji:'🥬'},{produit:'Rhubarbe',emoji:'🌱'},{produit:'Oseille',emoji:'🌿'}],
  4: [{produit:'Asperges vertes',emoji:'🌿'},{produit:'Petits pois',emoji:'🟢'},{produit:'Fraises',emoji:'🍓'},{produit:'Fèves',emoji:'🫘'},{produit:'Radis',emoji:'🌶️'},{produit:'Morilles',emoji:'🍄'}],
  5: [{produit:'Petits pois',emoji:'🟢'},{produit:'Fèves',emoji:'🫘'},{produit:'Cerises',emoji:'🍒'},{produit:'Fraises',emoji:'🍓'},{produit:'Courgettes',emoji:'🥒'},{produit:'Ail nouveau',emoji:'🧄'}],
  6: [{produit:'Courgettes',emoji:'🥒'},{produit:'Tomates',emoji:'🍅'},{produit:'Fraises',emoji:'🍓'},{produit:'Framboises',emoji:'🫐'},{produit:'Abricots',emoji:'🍑'},{produit:'Haricots verts',emoji:'🌿'}],
  7: [{produit:'Aubergines',emoji:'🍆'},{produit:'Poivrons',emoji:'🫑'},{produit:'Melon',emoji:'🍈'},{produit:'Pêches',emoji:'🍑'},{produit:'Tomates',emoji:'🍅'},{produit:'Maïs',emoji:'🌽'}],
  8: [{produit:'Tomates',emoji:'🍅'},{produit:'Maïs',emoji:'🌽'},{produit:'Figues',emoji:'🫐'},{produit:'Prunes',emoji:'💜'},{produit:'Poivrons',emoji:'🫑'},{produit:'Basilic',emoji:'🌿'}],
  9: [{produit:'Figues',emoji:'🫐'},{produit:'Raisins',emoji:'🍇'},{produit:'Champignons',emoji:'🍄'},{produit:'Courges',emoji:'🎃'},{produit:'Poires',emoji:'🍐'},{produit:'Pommes',emoji:'🍎'}],
  10: [{produit:'Potirons & courges',emoji:'🎃'},{produit:'Champignons',emoji:'🍄'},{produit:'Coings',emoji:'🍐'},{produit:'Pommes',emoji:'🍎'},{produit:'Châtaignes',emoji:'🌰'},{produit:'Noix',emoji:'🥜'}],
  11: [{produit:'Chou-fleur',emoji:'🥦'},{produit:'Céleri-rave',emoji:'🌿'},{produit:'Noix',emoji:'🥜'},{produit:'Châtaignes',emoji:'🌰'},{produit:'Endives',emoji:'🥬'},{produit:'Poireaux',emoji:'🧅'}],
  12: [{produit:'Huîtres',emoji:'🦪'},{produit:'Truffes',emoji:'🍄'},{produit:'Clémentines',emoji:'🍊'},{produit:'Endives',emoji:'🥬'},{produit:'Marrons',emoji:'🌰'},{produit:'Chou de Bruxelles',emoji:'🥦'}],
}

export function getProduitsSaison(): { produit: string; emoji: string }[] {
  const month = new Date().getMonth() + 1
  return PRODUITS[month] ?? []
}

export function getMoisLabel(): string {
  return new Date().toLocaleDateString('fr-FR', { month: 'long' })
}
