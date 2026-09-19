# Graduation invitation

A one-page invitation site. Cream paper, washi tape and foil lettering, built
with Next.js 16, Tailwind v4 and Motion, deployed on Vercel.



## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Edit the content

Every string, date, place and photo path lives in one file:
[`src/data/content.ts`](src/data/content.ts). No component needs touching.

| Field | What it controls |
| --- | --- |
| `graduateName` | Name in the hero, and the letter on the wax seal |
| `title` | Poster-style heading. `\n` forces the line break |
| `eventStart` | Countdown target. ISO format, `+07:00` for Vietnam time |
| `date`, `time`, `venue` | The date strip and the three info cards |
| `venue.mapsUrl` | Destination of the directions button on the venue card |
| `parking` | Parking suggestions, each with its own map link |
| `gallery` | Photo album. Leave it empty and the section hides itself |
| `rsvp` | Every label on the RSVP form |
| `music` | Path to an mp3, or `null` to hide the music button |

## Replace the photos

Put files in `public/images/` and point `content.ts` at them.

| File | Where it shows | Aspect |
| --- | --- | --- |
| `hero-16x9.jpg` | Hero frame | any — the frame follows the file |
| `og.jpg` | Link preview on Zalo, Messenger, Facebook | 1.91:1 |

The hero frame takes its proportions from `heroPhoto.width` / `height`, so a
photo of different proportions only needs those two numbers updated. Nothing is
cropped.

**Give a replacement photo a new filename.** Next caches optimised images by
path, so overwriting an existing name keeps serving the old picture — in the
browser and on the server.

## Collect RSVPs in a Google Sheet

1. Create a sheet at [sheets.new](https://sheets.new).
2. **Extensions → Apps Script**. Replace the sample code with
   [`docs/google-sheet.gs`](docs/google-sheet.gs) and save.
3. **Deploy → New deployment**. Click the gear next to "Select type" and pick
   **Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**.
   Anything narrower fails: the caller is the Vercel server, which has no
   Google session.
4. Google will warn that the app is unverified. That screen is expected for
   your own script — **Advanced → Go to … (unsafe)**, then **Allow**.
5. Copy the web app URL, ending in `/exec`.
6. Open that URL in a browser. `{"ok":true,...}` means the deployment works.

Then wire it up:

```bash
cp .env.local.example .env.local
# paste the /exec URL into GOOGLE_SCRIPT_URL
```

The URL never reaches the guest's browser. The form posts to `/api/rsvp` on
this site, and only the server calls Apps Script.

The sheet formats itself as rows arrive: a gold header, sensible column
widths, and each row tinted by whether the guest is coming. Which replies
count as a decline is decided by `DECLINE_WORDS` at the top of the script —
edit that list if you reword `rsvp.attendingOptions`.

Changing a colour or width afterwards does not touch existing rows. Pick
`formatAll` from the function dropdown in the editor and press **Run** to
restyle the whole sheet in place.

> **Editing the script later**: a save is not enough. Go to **Deploy → Manage
> deployments → edit → Version: New version**, otherwise `/exec` keeps running
> the old code.

## See who opened the invitation

Two separate things, kept separate on purpose.

**Totals** come from Vercel Web Analytics, already wired up in
[`src/app/layout.tsx`](src/app/layout.tsx). Turn it on under the project's
**Analytics** tab and redeploy. It stores no cookie and nothing on the
visitor's device, and reports visitors, referrers, device and country.

**Detail** comes from the visit log: one row per opening, in a spreadsheet of
its own.

1. Create a **new** sheet at [sheets.new](https://sheets.new). Do not reuse the
   RSVP one; it is live, and a second script on it would mean redeploying the
   first.
2. **Extensions → Apps Script**, paste [`docs/visit-log.gs`](docs/visit-log.gs),
   and deploy it as a web app exactly as in the RSVP section above.
3. Put the `/exec` URL in `VISIT_LOG_URL`, locally and in Vercel, and redeploy.

> **Updating the script later**: paste the new [`docs/visit-log.gs`](docs/visit-log.gs),
> then **Deploy → Manage deployments → edit → Version: New version**, which
> keeps the same `/exec` URL. If the columns changed, run `formatAll` once to
> rewrite the header in place; it does not delete rows.

A row records the time, a random name for the browser, how many times that
browser has opened the page, how many seconds before they looked away, where
the link was followed from, phone or computer, the model, OS, browser, and the
place Vercel resolves from the request.

`Seconds` is written by a second beacon as the visitor leaves, onto the row the
first one wrote. It measures the moment they first looked away, so a phone that
locks or switches apps still reports; a tab left open all afternoon does not
inflate it.

`Model` is a real one on Android -- the phone will say so when asked directly,
even though it is kept out of the user agent. Apple publishes nothing, so an
iPhone is only ever `iPhone` plus its iOS version. Part numbers like `SM-A546E`
are named through `MODELS` in [`src/app/api/visit/route.ts`](src/app/api/visit/route.ts);
unknown ones pass through as the code, and the list is easy to extend.

`Place` is the town, or the region code when a mobile network resolves to no
town, and the country. It stays empty in local development, because those
headers only exist on Vercel. Vietnamese mobile IPs often resolve to the wrong
city or to none at all, so read it as a rough spread, not per visitor.

Crawlers, link-preview fetchers and Vercel's own thumbnail renderer are dropped
rather than logged, so the counts are people.

Run `summarise` from the editor's function list to collapse the rows into one
line per browser, most-opened first, on a second `Devices` sheet.

The name identifies a browser, never a person: the same phone in Chrome and in
Safari counts twice, and clearing site data starts a new one. **A link posted
in public cannot be made to say who clicked it.** If you need that, send each
person their own link with `?k=their-name` and it lands in the `Invite`
column — that is the only way a name ever appears here.

No IP address is stored, only the town Vercel has already resolved.
`VISIT_LOG_URL` is server-only, so the address of the log never reaches a
guest's browser.

## Deploy to Vercel

1. Push to GitHub and import the repository at [vercel.com/new](https://vercel.com/new).
   The Next.js preset and root directory are detected automatically.
2. Under **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `GOOGLE_SCRIPT_URL` | the `/exec` URL |
   | `VISIT_LOG_URL` | the visit log's `/exec` URL, if you set one up |
   | `NEXT_PUBLIC_SITE_URL` | the deployed origin, no trailing slash |

3. **Redeploy.** Environment variables only apply to new builds.

Without `GOOGLE_SCRIPT_URL` the form still shows its thank-you screen but
nothing is stored, so after deploying send one real RSVP and check that the row
lands in the sheet.

Apps Script answers slowly and unevenly — measured between 3 and 33 seconds —
so the card is shown the moment someone submits and the write continues
underneath. A reply is parked in `localStorage`, retried three times, and only
dropped once the server confirms it; whatever is still parked is retried on the
guest's next visit. Every reply carries a `submissionId` that the script checks
before appending, so none of that retrying can store the same guest twice.

`NEXT_PUBLIC_SITE_URL` feeds `metadataBase`. Without it the preview image
resolves against `localhost` and shared links show no thumbnail.
