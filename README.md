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

## Deploy to Vercel

1. Push to GitHub and import the repository at [vercel.com/new](https://vercel.com/new).
   The Next.js preset and root directory are detected automatically.
2. Under **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `GOOGLE_SCRIPT_URL` | the `/exec` URL |
   | `NEXT_PUBLIC_SITE_URL` | the deployed origin, no trailing slash |

3. **Redeploy.** Environment variables only apply to new builds.

Without `GOOGLE_SCRIPT_URL` the form still shows its thank-you screen but
nothing is stored, so after deploying send one real RSVP and check that the row
lands in the sheet.

`NEXT_PUBLIC_SITE_URL` feeds `metadataBase`. Without it the preview image
resolves against `localhost` and shared links show no thumbnail.
