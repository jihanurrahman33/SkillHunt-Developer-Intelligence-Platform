import { getDashboardAnalytics } from './src/lib/repositories/analytics.repository.js';
import connectToDatabase from './src/lib/db.js';

async function test() {
  try {
    const data = await getDashboardAnalytics();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
