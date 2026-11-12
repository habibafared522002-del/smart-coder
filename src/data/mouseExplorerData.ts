export interface MouseExplorerLevelConfig {
  levelNumber: number;
  title: { ar: string; en: string };
  instruction: { ar: string; en: string };
  type: 'click' | 'drag' | 'shape_match' | 'picture_home' | 'choose_place' | 'sort' | 'puzzle_2' | 'puzzle_3_strip' | 'puzzle_3' | 'puzzle_4' | 'order' | 'assembly';
  xpReward: number;
  correctMessage: { ar: string; en: string };
  retryMessage: { ar: string; en: string };
  hintMessage: { ar: string; en: string };
}

export const mouseExplorerLevels: MouseExplorerLevelConfig[] = [
  {
    levelNumber: 1,
    title: { ar: 'المستوى 01: اضغط على الشكل', en: 'Level 01: Click the Object' },
    instruction: { ar: 'اضغط على الشكل الكبير المضيء!', en: 'Click on the large highlighted shape!' },
    type: 'click',
    xpReward: 5,
    correctMessage: { ar: 'برافو عليك! تم النقر بنجاح!', en: 'Excellent work! Clicked successfully!' },
    retryMessage: { ar: 'قربت جدًا! حاول النقر على الشكل بدقة.', en: 'Almost there! Try clicking the shape accurately.' },
    hintMessage: { ar: 'انظر إلى الدائرة الذهبية الكبيرة وسط الشاشة.', en: 'Look at the big golden circle in the center.' }
  },
  {
    levelNumber: 2,
    title: { ar: 'المستوى 02: اسحب الشكل', en: 'Level 02: Drag the Object' },
    instruction: { ar: 'اسحب الشكل إلى المكان المناسب.', en: 'Drag the shape into its correct place.' },
    type: 'drag',
    xpReward: 5,
    correctMessage: { ar: 'ممتاز! قدرت تعملها!', en: 'Great job! You did it!' },
    retryMessage: { ar: 'مفيش مشكلة، حاول سحب الشكل داخل الإطار مرة أخرى.', en: 'Let us try dragging inside the target frame again.' },
    hintMessage: { ar: 'اسحب الدائرة ببطء نحو الإطار المتقطع.', en: 'Drag the circle slowly towards the dashed frame.' }
  },
  {
    levelNumber: 3,
    title: { ar: 'المستوى 03: طابق الشكل', en: 'Level 03: Match the Shape' },
    instruction: { ar: 'اسحب كل شكل إلى الإطار المطابق له.', en: 'Drag each shape to its matching outline.' },
    type: 'shape_match',
    xpReward: 5,
    correctMessage: { ar: 'أحسنت! تطابق رائع للأشكال!', en: 'Well done! Wonderful shape matching!' },
    retryMessage: { ar: 'تأكد من وضع كل شكل في إطاره الصحيح.', en: 'Make sure to place each shape in its correct outline.' },
    hintMessage: { ar: 'قسّم الأشكال حسب ألوانها وأطرافها.', en: 'Match shapes by their colors and edges.' }
  },
  {
    levelNumber: 4,
    title: { ar: 'المستوى 04: ابحث عن منزل الصورة', en: 'Level 04: Find the Picture Home' },
    instruction: { ar: 'اسحب بطاقة الصورة إلى هدفها الصحيح.', en: 'Drag the picture card to its correct target.' },
    type: 'picture_home',
    xpReward: 5,
    correctMessage: { ar: 'رائع! وجدت المنزل الصحيح للصورة!', en: 'Awesome! Found the right home for the picture!' },
    retryMessage: { ar: 'جرب مكاناً آخر للإطار.', en: 'Try another target location.' },
    hintMessage: { ar: 'ابحث عن الظل المطابق لشكل الروبوت.', en: 'Look for the matching robot silhouette.' }
  },
  {
    levelNumber: 5,
    title: { ar: 'المستوى 05: اختر وضَع', en: 'Level 05: Choose and Place' },
    instruction: { ar: 'اختر العنصر الصحيح وضعه في الوجهة المحددة.', en: 'Select the correct item and place it in the target.' },
    type: 'choose_place',
    xpReward: 5,
    correctMessage: { ar: 'اختيار موفق ووضع دقيق!', en: 'Successful choice and precise placement!' },
    retryMessage: { ar: 'حاول اختيار العنصر المطلوب بدقة أكبر.', en: 'Try selecting the required item more carefully.' },
    hintMessage: { ar: 'اقرأ التلميح البصري واختر العنصر المناسب.', en: 'Read visual clue and pick the right item.' }
  },
  {
    levelNumber: 6,
    title: { ar: 'المستوى 06: صنّف العناصر', en: 'Level 06: Sort the Objects' },
    instruction: { ar: 'وزع العناصر على مناطق التصنيف الصحيحة.', en: 'Sort the objects into their correct classification areas.' },
    type: 'sort',
    xpReward: 5,
    correctMessage: { ar: 'ترتيب وتصنيف عبقري!', en: 'Genius sorting and organization!' },
    retryMessage: { ar: 'بعض العناصر تحتاج إلى إعادة تصنيف.', en: 'Some items need to be re-sorted.' },
    hintMessage: { ar: 'ضع كل صنف في مكانه المخصص حسب اللون.', en: 'Place each category into its color slot.' }
  },
  {
    levelNumber: 7,
    title: { ar: 'المستوى 07: لغز من قطعتين', en: 'Level 07: Two-Piece Puzzle' },
    instruction: { ar: 'ركب قطعتي الصورة لتكتمل اللوحة.', en: 'Combine two picture pieces to complete the painting.' },
    type: 'puzzle_2',
    xpReward: 10,
    correctMessage: { ar: 'أحسنت! اكتملت الصورة بنجاح!', en: 'You completed the two-piece picture!' },
    retryMessage: { ar: 'قرب القطعتين من بعضهما في المنتصف.', en: 'Bring the two pieces closer together in the center.' },
    hintMessage: { ar: 'القطعة الأولى يمين والثانية يسار.', en: 'First piece on right, second on left.' }
  },
  {
    levelNumber: 8,
    title: { ar: 'المستوى 08: الصورة المكونة من 3 شرائح', en: 'Level 08: Three-Strip Picture' },
    instruction: { ar: 'رتب الشرائح الثلاث عمودياً لتتكون الصورة.', en: 'Arrange the three image strips vertically to form the picture.' },
    type: 'puzzle_3_strip',
    xpReward: 10,
    correctMessage: { ar: 'تركيب مذهل للشرائح!', en: 'Amazing strip assembly!' },
    retryMessage: { ar: 'تأكد من ترتيب القطعة العليا والوسطى والسفلى.', en: 'Make sure to order top, middle, and bottom strips.' },
    hintMessage: { ar: 'رتب الشرائح من الأعلى للأسفل بالتسلسل.', en: 'Order strips from top to bottom sequentially.' }
  },
  {
    levelNumber: 9,
    title: { ar: 'المستوى 09: لغز من 3 قطع', en: 'Level 09: Three-Piece Puzzle' },
    instruction: { ar: 'اسحب الـ 3 قطع إلى أماكنها الصحيحة.', en: 'Drag the 3 puzzle pieces to their correct positions.' },
    type: 'puzzle_3',
    xpReward: 10,
    correctMessage: { ar: 'إنجاز عظيم في اللغز الثلاثي!', en: 'Great achievement in 3-piece puzzle!' },
    retryMessage: { ar: 'حاول تعديل أماكن القطع.', en: 'Try adjusting piece locations.' },
    hintMessage: { ar: 'انظر إلى الحواف المتطابقة لكل قطعة.', en: 'Look at matching edges of each piece.' }
  },
  {
    levelNumber: 10,
    title: { ar: 'المستوى 10: لغز من 4 قطع', en: 'Level 10: Four-Piece Puzzle' },
    instruction: { ar: 'ركب قطع اللغز الأربع لتظهر الصورة الأصلية.', en: 'Assemble the 4 puzzle pieces to reveal the original image.' },
    type: 'puzzle_4',
    xpReward: 12,
    correctMessage: { ar: 'مهندس ألغاز محترف!', en: 'Professional puzzle engineer!' },
    retryMessage: { ar: 'بعض القطع تحتاج لتبديل أماكنها.', en: 'Some pieces need to swap places.' },
    hintMessage: { ar: 'ابدأ بالزوايا الأربع أولاً.', en: 'Start with the four corners first.' }
  },
  {
    levelNumber: 11,
    title: { ar: 'المستوى 11: رتب الصور بالتسلسل', en: 'Level 11: Order the Picture' },
    instruction: { ar: 'رتب أجزاء الصورة بالتسلسل الصحيح.', en: 'Order the picture segments in the correct sequence.' },
    type: 'order',
    xpReward: 12,
    correctMessage: { ar: 'تسلسل منطقي مثالي!', en: 'Perfect logical sequence!' },
    retryMessage: { ar: 'تحقق من ترتيب الأرقام أو العلامات البصرية.', en: 'Check order of numbers or visual markers.' },
    hintMessage: { ar: 'رتب من اليسار لليمين أو حسب علامات التسلسل.', en: 'Order from left to right or by sequence marks.' }
  },
  {
    levelNumber: 12,
    title: { ar: 'المستوى 12: التجميع النهائي لسمارت كودرز', en: 'Level 12: Smart Coders Final Assembly' },
    instruction: { ar: 'اجمع كل مهارات النقر والسحب والتركيب لإتمام التحفة النهائية!', en: 'Combine all clicking, dragging, and assembling skills for final masterpiece!' },
    type: 'assembly',
    xpReward: 20,
    correctMessage: { ar: 'تهانينا! أنت بطل مستكشف الفأرة المعتمد!', en: 'Congratulations! You are certified Mouse Explorer Hero!' },
    retryMessage: { ar: 'أنت في الخطوة الأخيرة، دقق في المكان المناسب.', en: 'You are at the final step, look closely at the target.' },
    hintMessage: { ar: 'أتمم وضع القطعة الأخيرة بحرص.', en: 'Carefully place the final piece.' }
  }
];
