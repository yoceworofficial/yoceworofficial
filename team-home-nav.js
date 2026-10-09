/* Shared helper for Team dashboards. It keeps the Supabase session intact while opening the public homepage. */
window.YOCEWOR_TEAM_NAV = {
  home(){ window.location.href = 'index.html'; },
  dashboard(role){
    const routes={owner:'owner-control.html',gm:'gm.html',admin:'admin.html',editor:'editor.html'};
    window.location.href = routes[String(role||'').toLowerCase()] || 'index.html';
  }
};
