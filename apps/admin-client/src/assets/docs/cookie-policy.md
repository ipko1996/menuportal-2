# COOKIE (SÜTI) TÁJÉKOZTATÓ

**Hatályos:** 2025. szeptember 9-től

## 1. MI AZ A COOKIE?

A cookie-k (sütik) kis szöveges fájlok, amelyeket a weboldal az Ön böngészőjében tárol. Ezek segítenek a weboldal működésében, a felhasználói élmény javításában és statisztikai adatok gyűjtésében.

## 2. MILYEN COOKIE-KAT HASZNÁLUNK?

### 2.1 Elengedhetetlen (technikai) cookie-k

Ezek a cookie-k a weboldal alapvető működéséhez szükségesek.

| Cookie neve               | Szolgáltató | Cél                              | Időtartam |
| ------------------------- | ----------- | -------------------------------- | --------- |
| `__session`               | Clerk       | Felhasználói munkamenet kezelése | 1 hét     |
| `__session_{suffix}`      | Clerk       | Többszörös munkamenet kezelése   | 1 hét     |
| `__client_uat`            | Clerk       | Kliens autentikációs token       | 1 hét     |
| `__client_uat_{suffix}`   | Clerk       | Többszörös kliens token          | 1 hét     |
| `__clerk_db_jwt`          | Clerk       | Adatbázis JWT token              | 1 hét     |
| `__clerk_db_jwt_{suffix}` | Clerk       | Többszörös JWT token             | 1 hét     |

### 2.2 Teljesítmény és biztonsági cookie-k

A Cloudflare által használt cookie-k a weboldal teljesítményének optimalizálására és biztonságának növelésére.

| Cookie neve | Szolgáltató | Cél                            | Időtartam  |
| ----------- | ----------- | ------------------------------ | ---------- |
| `__cf_bm`   | Cloudflare  | Bot védelem és forgalomkezelés | 30 perc    |
| `_cfuvid`   | Cloudflare  | Egyedi látogatók azonosítása   | Munkamenet |

### 2.3 Felhasználói preferencia cookie-k

| Cookie neve          | Szolgáltató | Cél                           | Időtartam |
| -------------------- | ----------- | ----------------------------- | --------- |
| `cookie-consent`     | MenuPortal  | Cookie hozzájárulás állapota  | 1 év      |
| `cookie-preferences` | MenuPortal  | Cookie kategóriák beállításai | 1 év      |

## 3. LOCALSTORAGE HASZNÁLATA

A cookie-k mellett localStorage-t is használunk az alábbi adatok tárolására:

### 3.1 Felhasználói autentikáció és környezet

- `__clerk_environment`: Clerk autentikációs környezet konfigurációja
- `clerk_telemetry_throttler`: Telemetria korlátozás adatok
- `clerk_active_context`: Aktív felhasználói kontextus

### 3.2 Felhasználói beállítások

- Cookie preferenciák részletes beállításai
- Felhasználói interfész beállítások

**Fontos:** A localStorage adatok csak az Ön böngészőjében maradnak és nem kerülnek továbbításra.

## 4. HARMADIK FÉLTŐL SZÁRMAZÓ SZOLGÁLTATÁSOK

### 4.1 Clerk Authentication

A Clerk felhasználói azonosítási szolgáltatás cookie-kat használ a biztonságos bejelentkezés és munkamenet kezelés érdekében. A Clerk szolgáltatás magában foglalja:

- Felhasználói regisztráció és bejelentkezés
- Munkamenet kezelés
- Email szolgáltatások (regisztrációs email, jelszó visszaállítás)
- Kétfaktoros hitelesítés támogatás

### 4.2 Cloudflare CDN és Biztonság

A Cloudflare szolgáltatás cookie-kat használ:

- DDoS védelem
- Bot detektálás
- Gyorsítótárazás optimalizálás
- Biztonságos tartalom kézbesítés

**Fontos:** A Cloudflare Analytics **NEM használ cookie-kat** és nem gyűjt személyes adatokat. Ez egy privacy-first analitikai megoldás.

### 4.3 Cloudflare R2 Storage

A fájlok és képek tárolásához használt Cloudflare R2 nem helyez el cookie-kat, de a feltöltött tartalmak URL-jei ideiglenesen cache-elődhetnek.

### 4.4 Közösségi média Integráció

Amikor engedélyezi a Facebook vagy Instagram integrációt, ezek a platformok saját cookie-kat használhatnak, de ez csak akkor történik meg, ha Ön kifejezetten aktiválja ezt a funkciót.

## 5. COOKIE-K KEZELÉSE

### 5.1 Hozzájárulás

A weboldal első látogatásakor cookie banner jelenik meg, ahol elfogadhatja vagy elutasíthatja a nem elengedhetetlen cookie-kat.

### 5.2 Cookie beállítások módosítása

Bármikor módosíthatja cookie beállításait:

- A weboldal láblécében található "Cookie beállítások" linkre kattintva
- Böngészője beállításaiban

### 5.3 Cookie-k törlése

Böngészőjében bármikor törölheti a cookie-kat:

- **Chrome:** Beállítások → Adatvédelem és biztonság → Cookie-k és más webhelyadatok
- **Firefox:** Beállítások → Adatvédelem és biztonság → Cookie-k és webhelyadatok
- **Safari:** Beállítások → Adatvédelem → Webhelyadatok kezelése
- **Edge:** Beállítások → Adatvédelem, keresés és szolgáltatások → Cookie-k és webhelyadatok

## 6. MI TÖRTÉNIK, HA LETILTJA A COOKIE-KAT?

### 6.1 Elengedhetetlen cookie-k letiltása

Ezek letiltása esetén:

- Nem tud bejelentkezni a szolgáltatásba
- A munkamenet nem marad fenn
- A weboldal alapvető funkciói nem működnek megfelelően

### 6.2 Teljesítmény cookie-k letiltása

Ezek letiltása esetén:

- A weboldal lassabban töltődhet be
- Fokozott bot támadások előfordulhatnak
- A biztonság szintje csökkenhet

### 6.3 Preferencia cookie-k letiltása

Ezek letiltása esetén:

- Minden látogatáskor újra meg kell adnia a cookie hozzájárulását
- Nem őrződnek meg a beállításai

## 7. COOKIE-K ÉS SZEMÉLYES ADATOK

Néhány cookie személyes adatokat tartalmazhat (pl. felhasználói azonosító a Clerk token-ekben). Ezek kezeléséről részletesen az Adatkezelési Tájékoztatónkban olvashat.

## 8. FEJLESZTŐI KÖRNYEZET

A fejlesztési fázisban további cookie-k és localStorage elemek jelenhetnek meg, amelyek a tesztelés és hibakeresés céljából kerülnek alkalmazásra. Ezek az éles verzióban nem lesznek jelen.

## 9. TOVÁBBI INFORMÁCIÓK

### 9.1 Cookie-król általában

- All About Cookies: https://www.allaboutcookies.org
- Your Online Choices: https://www.youronlinechoices.eu

### 9.2 Böngésző útmutatók

- Chrome: https://support.google.com/chrome/answer/95647
- Firefox: https://support.mozilla.org/en-US/kb/cookies
- Safari: https://support.apple.com/guide/safari/manage-cookies-and-website-data
- Edge: https://support.microsoft.com/en-us/microsoft-edge/delete-cookies

## 10. VÁLTOZÁSOK

Fenntartjuk a jogot, hogy cookie tájékoztatónkat frissítsük. Jelentős változások esetén értesítjük felhasználóinkat.

## 11. KAPCSOLAT

Kérdés esetén keressen minket:

**IPKOVICH BÁLINT E.V.**  
**E-mail:** info@menuportal.hu

---

_Utolsó frissítés: 2025. szeptember 9._
