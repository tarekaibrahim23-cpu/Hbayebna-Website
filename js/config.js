/* =========================================================
   Hbayebna website — configuration
   ---------------------------------------------------------
   This is the ONLY file you need to edit to connect the two
   registration forms to Google Forms. See README.md for the
   step-by-step guide.

   For each form you can use ANY of these three methods
   (they can be combined; later ones override earlier ones):

   A) summaryEntry  — easiest. Create ONE "Paragraph" question
      in your Google Form (e.g. "Registration details") and put
      its entry ID here. Every answer is sent into that single
      question as a readable list.

   B) prefilledUrl  — recommended. In Google Forms use
      ⋮ > "Get pre-filled link", type each field KEY (listed in
      README.md, e.g. companyName) as the answer of the matching
      question, click "Get link" and paste the link here.
      The site reads the form ID and every entry ID from it.

   C) entries       — manual mapping { fieldKey: "entry.123456" }.

   formId is the long ID in your form's link:
   https://docs.google.com/forms/d/e/<<FORM_ID>>/viewform
   ========================================================= */
window.HBAYEBNA_CONFIG = {
  contact: {
    whatsapp: "9613788160",            // international format, digits only
    email: "hbayebna.lb@gmail.com"
  },

  // Set to true to print the data that would be sent in the browser console.
  debug: false,

  forms: {
    employer: {
      formId: "",          // e.g. "1FAIpQLSc...xyz"
      prefilledUrl: "",    // e.g. "https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url&entry.1111=companyName&entry.2222=contactName"
      summaryEntry: "",    // e.g. "entry.987654321"  (one Paragraph question that receives everything)
      checkboxesAsList: false, // true only if your multi-choice answers are Google "Checkboxes" questions with identical options
      entries: {
        // companyName: "entry.1111111111",
        // contactName: "entry.2222222222",
      }
    },
    employee: {
      formId: "",
      prefilledUrl: "",
      summaryEntry: "",
      checkboxesAsList: false,
      entries: {
        // fullName: "entry.3333333333",
      }
    }
  }
};
