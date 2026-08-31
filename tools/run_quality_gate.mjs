import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tests=[
  'test_asset_governance.mjs',
  'test_scene_layer_contracts.mjs',
  'test_seollal_pacing_and_ensemble.mjs',
  'test_locked_schedule_layers.mjs',
  'test_activity_face_consistency.mjs',
  'test_fixed_schedule_backgrounds.mjs',
  'test_save_recovery.mjs'
];
const results=[];
for(const test of tests){
  const run=spawnSync(process.execPath,[path.join(root,'tools',test)],{cwd:root,encoding:'utf8'});
  const result={test,passed:run.status===0,output:`${run.stdout||''}${run.stderr||''}`.trim()};
  results.push(result);console.log(`${result.passed?'PASS':'FAIL'} ${test}`);
  if(result.output)console.log(result.output);
}
const report={schemaVersion:1,generatedAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||'local',passed:results.every(r=>r.passed),results};
mkdirSync(path.join(root,'output'),{recursive:true});
try{writeFileSync(path.join(root,'output','quality-gate-report.json'),JSON.stringify(report,null,2));}
catch(error){if(process.env.GITHUB_ACTIONS)throw error;console.warn(`Local report skipped: ${error.code}`);}
if(!report.passed)process.exitCode=1;
