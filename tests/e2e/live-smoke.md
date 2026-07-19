# Live Supabase smoke check (event-day only)

Do not run the automated E2E suite against the live project. It intentionally starts in mock mode.

Before the stall opens, with a separate browser profile and the live `.env` configured:

1. Open `/`, complete one participant play using a recognisable temporary name such as `Smoke Check — DELETE`.
2. Sign into `/admin` and confirm the play appears in Participants and the dashboard total updates after refresh.
3. Open Media, upload one small non-sensitive test image, confirm its preview loads, then delete it.
4. In Supabase, confirm the temporary participant row and storage object are gone. Delete the participant row manually if your event policy permits it.
5. Check the browser console: there must be no application errors or failed first-party assets.

Keep regular question CRUD out of this smoke check unless you have a disposable test question and a named operator responsible for restoring it.

