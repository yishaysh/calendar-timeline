import { SEED_TIMELINE_ITEMS } from '../src/store/seedData';
import { sanitizeItemTradition } from '../src/store/TimelineContext';

async function seed() {
  console.log(`Seeding ${SEED_TIMELINE_ITEMS.length} items to Neon DB...`);
  const sanitized = SEED_TIMELINE_ITEMS.map(sanitizeItemTradition);
  const res = await fetch('http://localhost:3000/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitized),
  });
  const data = await res.json();
  console.log('Seed response:', data);

  const getRes = await fetch('http://localhost:3000/api/items');
  const getData = await getRes.json();
  console.log(`Verified count in Neon DB: ${getData.count} items!`);
}

seed().catch(console.error);
