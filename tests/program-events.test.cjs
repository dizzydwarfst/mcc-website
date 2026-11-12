const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../events.js'), 'utf8');
const event = {id:'fsl-1',slug:'fsl-session',title:'French session',status:'published',programs:['fsl'],
  featured:false,show_on_events_page:false,start_at:'2036-11-28T16:00:00-07:00',end_at:'2036-11-28T17:00:00-07:00',
  timezone:'Vancouver time',registration_open:true,agenda:[{time:'4:00 PM PST',title:'Welcome'}]};
async function render(items, {failure=false,pinned=false}={}) {
  const root={innerHTML:'',hidden:true,getAttribute:n=>({'data-events-program':'fsl','data-events-slug':pinned?'fsl-session':'','data-events-limit':'1'})[n]||'',hasAttribute:()=>false,removeAttribute(){},setAttribute(){}};
  const requests=[];
  vm.runInNewContext(source, {document:{readyState:'complete',body:{dataset:{}},querySelector:()=>null,querySelectorAll:()=>[root]},
    window:{location:{pathname:'/programs-french-language',search:''},setTimeout,clearTimeout},MutationObserver:class{observe(){}},
    URL,URLSearchParams,AbortController,Intl,console:{info(){}},fetch:async url=>{requests.push(new URL(url));return {ok:!failure,status:failure?503:200,json:async()=>pinned?{event:items[0]}:{items}};}});
  await new Promise(resolve=>setImmediate(resolve));
  return {root,query:requests[0].searchParams};
}
test('program events are independent of homepage and events index switches, with Pacific Time wording',async()=>{
  const {root,query}=await render([event]);
  assert.equal(root.hidden,false);assert.match(root.innerHTML,/French session/);assert.match(root.innerHTML,/Pacific Time \(PT\)/);assert.doesNotMatch(root.innerHTML,/\bPST\b/);
  assert.equal(query.get('program'),'fsl');assert.equal(query.get('upcoming'),'true');assert.equal(query.get('status'),'all');assert.equal(query.has('show_on_events_page'),false);assert.equal(query.has('featured'),false);
});
test('program sections reject past, archived, draft and unrelated events',async()=>{
  const {root}=await render([{...event,programs:['esl']},{...event,status:'archived'},{...event,status:'draft'},
    {...event,start_at:'2020-01-01',end_at:'2020-01-02'}]);
  assert.equal(root.hidden,true);assert.equal(root.innerHTML,'');
});
test('program feed failures hide the section without resurrecting the September event',async()=>{
  const {root}=await render([], {failure:true});assert.equal(root.hidden,true);assert.equal(root.innerHTML,'');
});
test('pinned program events also reject archived records',async()=>{
  const {root}=await render([{...event,status:'archived'}],{pinned:true});assert.equal(root.hidden,true);
});
test('closed program registrations retain the details link without a registration link',async()=>{
  const {root}=await render([{...event,status:'closed',registration_open:false}]);assert.equal(root.hidden,false);assert.match(root.innerHTML,/View Event Details/);assert.doesNotMatch(root.innerHTML,/#register/);
});
