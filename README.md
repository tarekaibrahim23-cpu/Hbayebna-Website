# Hbayebna Recruitment Agency — Website

Plain HTML, CSS and JavaScript. No build step, no server code. Upload the whole folder to any web host (cPanel, Netlify, GitHub Pages, Hostinger…) and open `index.html`.

```
index.html        Home page (about, why us, services, strengths, clients, contact)
employer.html     Employer registration (restaurants requesting staff)
employee.html     Job seeker registration (candidates)
css/style.css     All styles (brand colours, RTL support, dark mode)
js/config.js      ← the only file you edit: Google Form IDs, WhatsApp, email
js/i18n.js        Arabic translations + dropdown / checkbox option lists
js/main.js        Language toggle, menu, client logos
js/forms.js       Validation, conditional questions, Google Forms submission
assets/           Logo, banner, office photo, client logos
```

## Language
The EN / عربي switch is in the header. Arabic switches the page to right-to-left. The choice is remembered, and you can link straight to Arabic with `?lang=ar` (e.g. `employee.html?lang=ar`).
Submitted answers are always stored in **English values** (e.g. "Sous Chef", "Saudi Arabia") so your Google Sheet stays consistent whatever language the visitor used.

## Connecting the forms to Google Forms

Create **two** Google Forms: one for employers and one for job seekers. Then pick one of the methods below for each and put the result in `js/config.js`.

### Method A: one question (5 minutes)
1. In the Google Form, add a single **Paragraph** question called "Registration details". Do not make it required.
2. Open the form → ⋮ → **Get pre-filled link** → type `summary` in that question → **Get link** → copy.
3. Paste the link in `prefilledUrl` in `config.js`.

Every registration arrives as one readable block of text (reference number, all answers).

### Method B: one question per field (recommended, one column per field in Google Sheets)
1. In the Google Form, create a **Short answer** or **Paragraph** question for each field you want as its own column. Do not mark questions as required in Google Forms because the website already validates them.
2. ⋮ → **Get pre-filled link**. In each question, type the **field key** from the tables below (for example type `companyName` in "Restaurant name").
3. Optional: add one Paragraph question and type `summary` in it to also receive the full text.
4. Click **Get link**, copy it, and paste it into `prefilledUrl` for that form in `config.js`.

The site reads the form ID and every `entry.XXXX` number from that link automatically.

### Method C: manual
Put the form ID in `formId` (the long code in `https://docs.google.com/forms/d/e/<FORM_ID>/viewform`) and map keys yourself:
```js
entries: { companyName: "entry.1234567890", phone: "entry.987654321" }
```

### Field keys

**Employer form (`employer`)**
`reference`, `submittedAt`, `language`, `companyName`, `contactName`, `contactRole`, `phone`, `email`, `country`, `city`, `restaurantType`, `restaurantTypeOther`, `cuisine`, `branches`, `seats`, `status`, `position`, `headcount`, `positionOther`, `otherPositions`, `employmentType`, `experienceRequired`, `educationRequired`, `languagesRequired`, `gulfExpPreferred`, `candidateSource`, `jobDescription`, `salaryMin`, `salaryMax`, `currency`, `salaryPeriod`, `benefits`, `workingHours`, `daysOff`, `contractDuration`, `startDate`, `otherServices`, `notes`, `consent`

**Job seeker form (`employee`)**
`reference`, `submittedAt`, `language`, `fullName`, `dob`, `gender`, `nationality`, `currentCountry`, `city`, `phone`, `email`, `position`, `secondPosition`, `positionOther`, `experienceYears`, `education`, `lastPosition`, `lastEmployer`, `cuisineSkills`, `gulfExperience`, `gulfCountries`, `languages`, `certificates`, `expectedSalary`, `currency`, `salaryNegotiable`, `workLocations`, `relocate`, `needAccommodation`, `employmentTypePref`, `availability`, `availableFrom`, `hasPassport`, `passportExpiry`, `hasVisa`, `visaCountry`, `visaType`, `visaExpiry`, `drivingLicense`, `cvLink`, `notes`, `consent`

You do not need every key. Fields with no matching question are still included in the `summary` question if you added one.

### Tips
- Use **Short answer / Paragraph** questions. Dates are sent as `YYYY-MM-DD` text and multi-choice answers as `Saudi Arabia, Qatar`.
- If you prefer Google "Checkboxes" questions, their options must match the English values in `js/i18n.js` exactly. Then set `checkboxesAsList: true`.
- Keep each Google Form to **one section** (no page breaks).
- In Google Forms → Responses → **Link to Sheets** to get a spreadsheet of all registrations.
- To test, set `debug: true` in `config.js` and open the browser console (F12) to see exactly what is sent.

### What happens when a visitor submits
- **Google Form connected:** answers are sent to Google, and the visitor sees a confirmation with a reference number (`HB-E-…` for employers, `HB-C-…` for candidates), a summary, and buttons to also send it by WhatsApp or email.
- **Not connected yet:** the visitor sees a summary and is asked to send it on WhatsApp (+961 3 788 160) or by email in one tap. You can put the site online before setting up Google Forms.

Google Forms cannot receive file uploads from an external site, so candidates paste a link to their CV (Google Drive / LinkedIn) or send it on WhatsApp.

## Editing content
- Text: edit the English directly in the HTML. The Arabic version is in `js/i18n.js`, under the same `data-i18n` key.
- Dropdown and checkbox options (positions, countries, cuisines, benefits…): `window.LISTS` in `js/i18n.js`.
- Client logos: `assets/clients/` + the `CLIENTS` list in `js/main.js`.
- Contact number and email: `js/config.js` (forms) and the contact section in `index.html`.
