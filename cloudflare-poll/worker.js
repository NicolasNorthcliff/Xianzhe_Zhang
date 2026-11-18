// Free Cloudflare Workers + D1 vote API for static GitHub Pages site.
// Bind D1 database with variable name DB in Worker settings.
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Cache-Control":"no-store"};
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{...headers,"Content-Type":"application/json; charset=utf-8"}});
async function results(db){const r=await db.prepare("SELECT choice, COUNT(*) AS n FROM votes GROUP BY choice").all();const counts=[0,0,0];for(const x of (r.results||[])){if(x.choice>=0&&x.choice<=2)counts[x.choice]=x.n;}return {counts};}
export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{headers});
  try {
    if(!env.DB)return json({error:'D1 database not configured'},503);
    if(request.method==='GET')return json(await results(env.DB));
    if(request.method!=='POST')return json({error:'Method not allowed'},405);
    if(Number(request.headers.get('content-length')||0)>2048)return json({error:'Payload too large'},413);
    const data=await request.json();
    if(!Number.isInteger(data.choice)||data.choice<0||data.choice>2 || typeof data.voteId!=='string' || !/^[a-zA-Z0-9-]{8,80}$/.test(data.voteId))return json({error:'Invalid vote'},400);
    await env.DB.prepare('INSERT OR IGNORE INTO votes (vote_id, choice) VALUES (?, ?)').bind(data.voteId,data.choice).run();
    return json(await results(env.DB));
  }catch(e){return json({error:'Could not process request'},500)}
}};
