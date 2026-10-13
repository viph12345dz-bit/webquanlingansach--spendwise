/**
 * SpendWise data service placeholder.
 * Current frontend prototype stores data in localStorage inside page modules.
 * When the project is connected to Supabase/Firebase/MockAPI, centralize
 * network requests in this file so UI modules stay easy to maintain.
 */
window.SpendWiseAPI = {
  async healthCheck() {
    return { ok: true, source: 'localStorage' };
  }
};
