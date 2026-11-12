const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const handler = require('../api/r/[code].js');
const config = require('../vercel.json');
const destination = 'https://metropolitancollege.ca/events/november?ref=K7M2QX4P&utm_source=agency';

async function redirect(code, { method='GET', headers={}, response=destination, fail=false, ok=true }={}) {
  const original = global.fetch;
  const calls=[];
  global.fetch=async (url, options)=>{
    calls.push({ url, ...options });
    if(fail) throw new Error('offline');
    return { ok, json:async()=>({ destination_url:response }) };
  };
  const res={ headers:{}, setHeader(k,v){this.headers[k]=v;}, end(){} };
  try { await handler({query:{code},method,headers},res); }
  finally { global.fetch=original; }
  return {res,calls};
}

test('printed QR path reaches the server redirector',()=>{
  assert(config.rewrites.some(r=>r.source==='/r/:code' && r.destination==='/api/r/:code'));
});
test('agency code resolves with referral tags intact and no permanent cache',async()=>{
  const {res,calls}=await redirect('k7m2qx4p');
  assert.equal(res.statusCode,302);
  assert.equal(res.headers.Location,destination);
  assert.match(res.headers['Cache-Control'],/no-store/);
  assert.match(res.headers['X-Robots-Tag'],/noindex/);
  assert.equal(calls[0].method,'POST');
  assert.match(calls[0].url,/K7M2QX4P\/click$/);
});
test('HEAD and prefetch requests resolve without counting agency clicks',async()=>{
  for(const options of [{method:'HEAD'},{headers:{'sec-purpose':'prefetch'}}]) {
    const {calls,res}=await redirect('K7M2QX4P',options);
    assert.equal(calls[0].method,'GET');
    assert.equal(res.headers.Location,destination);
  }
});
test('invalid, unknown, unavailable and unsafe destinations never strand visitors',async()=>{
  const invalid=await redirect('../invalid');
  assert.equal(invalid.calls.length,0);
  assert.equal(invalid.res.headers.Location,'https://metropolitancollege.ca/');
  for(const options of [{fail:true},{ok:false},{response:'javascript:alert(1)'},{response:'https://evil.example/'}]) {
    const {res}=await redirect('K7M2QX4P',options);
    assert.equal(res.statusCode,302);
    assert.equal(res.headers.Location,'https://metropolitancollege.ca/events');
  }
});

const capture=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8').split('// Scroll Handler')[0];
const eventSource=fs.readFileSync(path.join(__dirname,'../events.js'),'utf8')
  .replace('    ready(() => {','    window.testAttribution = attributionValues;\n    ready(() => {');
function visit(search, storage) {
  const window={location:{search},sessionStorage:storage};
  const context=vm.createContext({window,URLSearchParams,document:{readyState:'loading',addEventListener(){} }});
  vm.runInContext(capture,context);
  vm.runInContext(eventSource,context);
  return window.testAttribution();
}
function storage() {
  const data=new Map();
  return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
}
test('registration keeps the first agency across browsing and later agency links',()=>{
  const session=storage();
  let values=visit('?ref=k7m2qx4p&utm_source=first',session);
  assert.equal(values.referral_code,'K7M2QX4P');
  values=visit('',session);
  assert.equal(values.referral_code,'K7M2QX4P');
  assert.equal(values.utm_source,'first');
  values=visit('?ref=ABCDEFGH&utm_source=second&utm_term=second',session);
  assert.equal(values.referral_code,'K7M2QX4P');
  assert.equal(values.utm_source,'first');
  assert.equal(values.utm_term,'');
});
test('blocked storage does not break the page or lose current referral',()=>{
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.equal(visit('?ref=K7M2QX4P',blocked).referral_code,'K7M2QX4P');
  assert.equal(visit('?ref=invalid',blocked).referral_code,'');
});
