# RCA's hjemmeside – vejledning

Hjemmesiden bygges automatisk af Netlify, hver gang der gemmes en ændring i GitHub.
Tekster og dokumenter redigeres på **https://rca-website.netlify.app/admin**.

## Opsætning (gøres én gang)

1. **GitHub-repository**
   - Opret et nyt repository på GitHub-kontoen `lemmykook-max` med navnet `rca-website`. Gør det **offentligt (Public)**.
     Indholdet er alligevel offentligt på hjemmesiden, og så bygger Netlify også Lenas ændringer uden ekstra medlemskab.
   - Vælg "uploading an existing file" og træk alle filer og mapper fra denne mappe ind. Tryk "Commit changes".
2. **Brugernavn**
   - `src/admin/config.yml` peger allerede på `lemmykook-max/rca-website`. Hvis repository'et får et andet navn, skal linjen `repo:` rettes.
3. **Forbind Netlify til GitHub**
   - I Netlify: åbn projektet `rca-website` → projektets konfiguration → Build & deploy → **Link repository** → GitHub → vælg `rca-website`.
   - Byggeindstillingerne læses fra `netlify.toml`, så I skal ikke udfylde noget.
4. **Login til redigeringsværktøjet**
   - På GitHub: Settings → Developer settings → OAuth Apps → **New OAuth App**.
     - Homepage URL: `https://rca-website.netlify.app`
     - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Kopiér Client ID, og lav en Client secret.
   - I Netlify: projektets konfiguration → Access & security → **OAuth** → Install provider → GitHub → indsæt Client ID og secret.
5. **Giv Lena adgang**
   - Lena opretter en gratis GitHub-konto.
   - På repository'et: Settings → Collaborators → **Add people** → Lenas brugernavn (skriveadgang).

## Sådan redigerer man

1. Gå til **https://rca-website.netlify.app/admin** og log ind med GitHub.
2. Vælg det, du vil rette:
   - **Nyheder** – opret en ny nyhed med "+ nyhed". De 3 nyeste vises på forsiden.
   - **Tekstsider** – sider med fri tekst, fx referater. Start et afsnit med `>` for at vise det som en fremhævet beslutning.
   - **Sider på hjemmesiden** – forsiden, Om RCA, Viden, Bliv medlem, Dokumenter, Kontakt og menuen.
3. Tryk **Publicer → Publicer nu**. Ændringen er på hjemmesiden efter ca. 1 minut.

PDF'er uploades i feltet "PDF-fil" under Dokumenter eller under "Medier" øverst.

Siden om generalforsamlingen (mødetilstand og referent-værktøj) kan ikke redigeres i /admin.

## Teknik

- Siden er bygget med Eleventy (`npm run build`), redigeringsværktøjet er Decap CMS.
- Tekster ligger i `src/_data/*.json`, nyheder i `src/nyheder/`, tekstsider i `src/sider/`, PDF'er i `src/files/`.
- Lokalt: `npm install` og `npm start`.
