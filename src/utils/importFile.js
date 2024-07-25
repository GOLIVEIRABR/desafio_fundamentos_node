import fs from 'node:fs';
import { parse } from 'csv-parse';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const importFile = async () => {
  console.log('Importing file...')
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const records = [];
  const parser = fs.createReadStream(path.join(`${__dirname}`, '..', '..', 'import.csv')).pipe((parse()));

  let cont = 0;
  for await (const record of parser) {
    if (cont > 0) {

      await fetch('http://localhost:3333/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: record[0],
          description: record[1]
        }),
      })
    }
    cont++
  }


  console.log('File imported!')
  return records;
}
