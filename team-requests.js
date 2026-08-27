/* YOCEWOR Team Requests v2 — role-gated onboarding */
(function(){'use strict';
if(!window.supabase)return;
const db=window.supabase.createClient('https://mzntgjyecymcpzciklfk.supabase.co','sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr4Usn',{auth:{persistSession:true,autoRefreshToken:true}});
const ROLES=['owner','gm','admin','editor'];
async function me(){const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data}=await db.from('admin_users').select('role,is_active').eq('user_id',user.id).maybeSingle();if(!data?.is_active||!ROLES.includes(data.role))return null;return {...data,user};}
async function createRequest(form){const u=await me();if(!u)throw new Error('Unauthorized');const requestedRole=String(form.requested_role||'').toLowerCase();if(!['gm','admin','editor'].includes(requestedRole))throw new Error('Invalid requested role');if(u.role==='gm'&&requestedRole!=='admin')throw new Error('GM can request Admin only');if(u.role==='admin'&&requestedRole!=='editor')throw new Error('Admin can request Editor only');if(u.role==='editor')throw new Error('Editor cannot create team requests');const approvalLevel=u.role==='owner'?'owner':(requestedRole==='admin'?'owner':'gm');const {data,error}=await db.from('team_requests').insert({...form,requested_role:requestedRole,requested_by:u.user.id,requested_by_role:u.role,approval_level:approvalLevel,status:'pending'}).select().single();if(error)throw error;return data;}
window.YOCEWOR_TEAM_REQUESTS={me,createRequest};
})();
