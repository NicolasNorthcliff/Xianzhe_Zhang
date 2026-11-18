# Xianzhe Zhang — Website V10

Multi-page static website, free to host on GitHub Pages.

## Preview
Unzip and double-click `index.html`. The quiz works locally and reveals the correct answer. The current-visit map can attempt IP-based positioning when online. **Shared quiz counts and historical visitor dots are not live until their optional providers are configured.**

## Publish
1. Create a public GitHub repo named `<github-username>.github.io`.
2. Upload the **contents** of this directory into the repo root (do not upload the ZIP as the website).
3. Settings > Pages > Deploy from a branch > `main` > `/(root)` > Save.
4. Check that `index.html`, the local images, and `research.html` load from your public URL.

## Two truths & one lie — aggregated visitor vote counts
The page immediately reveals the correct answer after a vote, and saves that selection in the browser to avoid an accidental second submission. GitHub Pages cannot hold shared votes; the public percentages require a backend. An optional **Cloudflare Workers + D1 free-tier** implementation is provided in `cloudflare-poll/`. It does not collect IP addresses in the application data, and uses a browser-generated random vote ID to avoid duplicate submissions with the same ID. It is a casual poll, not anti-fraud-secure.

1. Create a free Cloudflare account. In Workers & Pages > D1, create a database (for example `xianzhe_poll`).
2. Open its SQL console, paste and run the statements from `cloudflare-poll/schema.sql`.
3. In Workers & Pages, create a Worker and replace its starter source with `cloudflare-poll/worker.js`. Deploy it.
4. In that Worker's Settings > Bindings, add a **D1 Database** binding with variable name `DB` pointing at the database created in step 1. Redeploy if required.
5. Test the Worker URL in a browser: it should show `{ "counts": [0,0,0] }`, not an error.
6. In `poll-config.js` paste the Worker URL into `window.POLL_API_URL`. Push the updated file to GitHub.
7. Test with a fresh browser session. Results are real counts after successful submissions; they are **not** invented for the demo.

Cloudflare's plans and free-tier terms can change. The GET/POST API uses CORS so it can be called from GitHub Pages. For a public production site, restrict allowed origins and consider rate limiting to discourage abuse.

## Visitors map
The built-in map on the homepage displays the **current visit's approximate location** only after clicking the button, when the IP lookup succeeds. It does not automatically record other visitors. To show a history of visitor locations, obtain an actual widget embed URL from a provider and set it in `visitor-config.js`. Test on the published HTTPS site, because local `file://` browsing can prevent third-party scripts from loading. Do not misrepresent this as live historical tracking without a provider.

## Personal links and privacy
Replace `GITHUB_PROFILE_URL` in `site-config.js` after creating your GitHub account. The public CV has been carried forward without a phone number. The website includes user-provided industrial PCB photos and testing charts; check the relevant company sharing permissions before publishing. The schools and company marks are for descriptive affiliation only, not endorsement.


## V11 visual cleanup
Removed redundant public-facing explanatory captions, configuration notes, and template credits. Live visitor history and shared quiz totals still require the external services described above; their absence is not represented as real data.


## V12: GitHub, academic sections and game effects
- The linked GitHub account is `NicolasNorthcliff`; a GitHub user-site repo needs to be named `NicolasNorthcliff.github.io`, producing `https://nicolasnorthcliff.github.io` (unless a custom domain is configured).
- **Academic** has four accessible tabs: Service, Honors & Awards, Teaching, Leadership. Edit `academic.html` to update their contents.
- **Two truths & a lie** fireworks and gentle rain are purely local visual effects. They do not depend on Cloudflare voting and run only on a new answer, not on page reload.
- Shared vote percentages and historical visitor dots remain unconfigured until you supply service credentials/IDs.
- Teaching entries follow the supplied CV as written; double-check the EECE 2531 course title and the EECE 7201 dates before publishing.
- Charts in `assets/engineering/test-series-*.png` have their screenshot margins trimmed.


## V13 (2026-11) — quiz replay and fade polish
- Quiz: **Reset ↺** clears the revealed answer and reenables selection. Correct answer gets a subtle translucent green tint and an incorrect chosen option gets a translucent red tint. Reset does **not** generate another shared vote from a browser that already voted. Full-page fireworks / rain animations remain in place.
- Pages use a gentle fade/translate-in on navigation; Academic panels fade on tab changes. All transitions respect the reduced-motion setting.
- GitHub owner: `NicolasNorthcliff`. To use a free user-site URL, create the PUBLIC repo `NicolasNorthcliff.github.io`, upload all root website files, and set Settings → Pages → Deploy from a branch → main → /(root). The resulting URL is `https://nicolasnorthcliff.github.io`. The site title continues to be Xianzhe Zhang.
- Visitor history: first create the GitHub site, then create a free widget at https://mapmyvisitors.com/ . Copy the actual generated **https:// URL** for the image, iframe or script embed into the matching `window.VISITOR_MAP_CONFIG` property in `visitor-config.js`; do not paste the entire `<script>` or `<iframe>` tag as a property value. Only set one provider field. When configured, the public widget replaces the local single-visitor map to prevent duplicate maps. Check the provider's stats dashboard with an actual site visit after publishing. Map service may require consent/privacy disclosure and IP geolocation is approximate.
- Note: a provider may issue an HTML snippet instead of a standalone HTTPS link; extract its `src` URL verbatim. If it cannot be mapped to these 3 fields, add the snippet carefully to `index.html` in `providerMapMount` or supply the snippet for assistance.
