export const SERVICE_CATALOG = [
  { key: 'wash_fold', name: 'Wash & fold', desc: 'Washed, dried, and folded', unitLabel: 'per bag', price: 19.13 },
  { key: 'comforter', name: 'Comforter', desc: 'Washed separately, bagged', unitLabel: 'each', price: 15 },
  { key: 'delicates', name: 'Delicates', desc: 'Cold wash, hang-dry', unitLabel: 'per bag', price: 22.5 },
  { key: 'hang_dry', name: 'Hang-dry', desc: 'Air-dried, on hangers', unitLabel: 'per item', price: 4.5 },
];

export const DELIVERY_WINDOWS = [
  { key: 'today-4-6', day: 'Today', time: '4–6 PM', capLabel: '3 spots left' },
  { key: 'today-6-8', day: 'Today', time: '6–8 PM', capLabel: '5 spots left' },
  { key: 'tom-8-10', day: 'Tomorrow', time: '8–10 AM', capLabel: 'Open' },
  { key: 'tom-4-6', day: 'Tomorrow', time: '4–6 PM', capLabel: 'Open' },
];

export const STEP_TITLES = {
  1: { title: 'Choose your laundromat', label: 'Step 1 of 4' },
  2: { title: 'What are we washing?', label: 'Step 2 of 4' },
  3: { title: 'Pickup details', label: 'Step 3 of 4' },
  4: { title: 'Review & pay', label: 'Step 4 of 4' },
};

export const PROMO_CODE = 'LOOP10';
export const PROMO_DISCOUNT = 10;
