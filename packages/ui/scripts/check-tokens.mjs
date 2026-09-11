import { readFile } from 'node:fs/promises';
import StyleDictionary from 'style-dictionary';

const dictionary = new StyleDictionary('style-dictionary.config.json');
const platforms = await dictionary.formatAllPlatforms();

for (const files of Object.values(platforms)) {
  for (const { destination, output } of files) {
    if (await readFile(destination, 'utf8') !== output) {
      throw new Error(`${destination} desatualizado. Execute pnpm --filter @niar/ui tokens:generate.`);
    }
  }
}
