import ExcelJS from 'exceljs';

const SRC = 'C:\\Users\\Golf\\Desktop\\Gopremium new version\\ข้อมูลสินค้า.xlsx';
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(SRC);

console.log('=== Sheets ===');
wb.worksheets.forEach((ws, i) =>
  console.log(`[${i}] "${ws.name}"  rows=${ws.rowCount} cols=${ws.columnCount}`)
);

// Find the catalog tab (ข้อมูลแคตตาล็อค / catalog)
const target =
  wb.worksheets.find((w) => /แคตตาล็อค|แคตตาล็อก|catalog/i.test(w.name)) || wb.worksheets[0];
console.log(`\n=== Using tab: "${target.name}" ===`);

// header row
const head = target.getRow(1);
console.log('\nHeader (row 1):');
head.eachCell({ includeEmpty: true }, (c, n) =>
  console.log(`  col${n}: ${JSON.stringify(c.value)}`)
);

// first 3 data rows
for (let r = 2; r <= Math.min(4, target.rowCount); r++) {
  console.log(`\n--- row ${r} ---`);
  target.getRow(r).eachCell({ includeEmpty: true }, (c, n) => {
    let v = c.value;
    if (v && typeof v === 'object') v = v.text || v.hyperlink || v.result || JSON.stringify(v);
    console.log(`  col${n}: ${JSON.stringify(v)}`);
  });
}
