/* ==========================================================================
   Site configuration. Fill these in before launch - everything is optional
   and each feature stays dormant until its ID is supplied.
   NEVER put API secrets (Twilio, Google service accounts, SMTP) in this file.
   Those belong in server environment variables, read by /api/lead.js.
   ========================================================================== */
window.KFS_CONFIG = {
  /* Google Analytics 4 - analytics.google.com, format G-XXXXXXXXXX */
  ga4MeasurementId: '',

  /* Microsoft Clarity - clarity.microsoft.com, free heatmaps + recordings */
  clarityProjectId: '',

  lead: {
    /* Serverless fan-out endpoint (email + sheet + SMS). Preferred.
       Set this to '/api/lead' once the function is deployed and at least one
       channel is configured. While it is empty the form logs the adviser
       payload to the console instead, so nothing breaks in development. */
    endpoint: '',

    /* EmailJS fallback for static hosting with no backend.
       emailjs.com -> Account for publicKey, Email Services for serviceId. */
    emailjs: {
      publicKey: '',
      serviceId: '',
      adviserTemplateId: '',
      autoReplyTemplateId: ''
    },

    adviserEmail: 'info@kiwifinancial.co.nz',
    adviserMobile: '+64273030000'
  }
};
