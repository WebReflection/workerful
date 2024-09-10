import { join } from 'node:path';
import staticHandler from 'static-handler';

export default staticHandler(join(import.meta.dirname, 'public'));
