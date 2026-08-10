/**
 * Build supplier registry (factory) + customer list (brand) split, and write all CSV seeds.
 */
import fs from 'node:fs';
const RAW = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J = (f) => JSON.parse(fs.readFileSync(`${RAW}/${f}.json`, 'utf8'));
const csv = (rows) => rows.map(r => r.map(c => {
  const s = String(c ?? ''); return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
}).join(',')).join('\r\n');
const writeCsv = (file, cols, objRows) => fs.writeFileSync(`${DATA}/${file}`,
  '﻿'+csv([cols, ...objRows.map(o => cols.map(c => o[c] ?? ''))]), 'utf8');

// ---- Suppliers (factory) registry from NT/Supplier ----
const supRaw = J('nt__Supplier');
const supCols = supRaw[0];
const suppliers = supRaw.slice(1).filter(r => r[0]).map(r => Object.fromEntries(supCols.map((c,i)=>[c, r[i]])));
writeCsv('suppliers.csv', supCols, suppliers);

// ---- Customers/brands (from NPD client column in master) ----
const all = JSON.parse(fs.readFileSync(`${DATA}/master-all.json`,'utf8')).rows;
const brands = {};
for (const r of all) { const b = String(r['ลูกค้า/Brand']||'').trim(); if (b && b!=='—') brands[b]=(brands[b]||0)+1; }
const custCols = ['ลูกค้า/Brand','จำนวนสินค้าที่อ้างอิง'];
const customers = Object.entries(brands).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({'ลูกค้า/Brand':k,'จำนวนสินค้าที่อ้างอิง':v}));
writeCsv('customers.csv', custCols, customers);

// ---- Master CSVs ----
const masterAll = JSON.parse(fs.readFileSync(`${DATA}/master-all.json`,'utf8'));
const pipe = JSON.parse(fs.readFileSync(`${DATA}/master-pipeline.json`,'utf8'));
writeCsv('PRODUCT-MASTER-all.csv', masterAll.cols, masterAll.rows);
writeCsv('PRODUCT-MASTER-pipeline.csv', pipe.cols, pipe.rows);
const cat = masterAll.rows.filter(r=>r['สถานะ'].startsWith('Active'));
writeCsv('PRODUCT-MASTER-catalog.csv', masterAll.cols, cat);

console.log('Suppliers (factory, SUP-codes):', suppliers.length);
console.log('Customers/brands distinct      :', customers.length, '-> top:', customers.slice(0,8).map(c=>c['ลูกค้า/Brand']).join(', '));
console.log('CSV written: suppliers, customers, PRODUCT-MASTER-{all,pipeline,catalog}');
console.log('master-all rows:', masterAll.rows.length);
