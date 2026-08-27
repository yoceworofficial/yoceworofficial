/* YOCEWOR Owner Live Command Center
 * Reads the existing analytics/activity tables through the authenticated team-management function.
 * UI can call YOCEWOR_OWNER_LIVE.refresh() from owner-control.html.
 */
window.YOCEWOR_OWNER_LIVE = (() => {
  const db = window.db || (window.supabase ? window.supabase.createClient(
    'https://mzntgjyecymcpzciklfk.supabase.co',
    'sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn'
  ) : null);
  const esc = x => String(x ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  async function api(action, extra={}) {
    if (!db) throw Error('Supabase client unavailable');
    const r = await db.functions.invoke('team-management', {body:{action, ...extra}});
    if (r.error) throw r.error;
    if (r.data?.error) throw Error(r.data.error);
    return r.data;
  }
  async function refresh() {
    const out = {analytics:null, activity:null, team:null};
    try { out.analytics = await api('analytics_summary'); } catch (_) {}
    try { out.activity = await api('activity_summary'); } catch (_) {}
    try { out.team = await api('list_team'); } catch (_) {}
    return out;
  }
  return {refresh, esc};
})();
