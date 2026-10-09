/* Generates the four legal pages from a shared shell. */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'legal');

const PAGES = [
  {
    slug: 'disclaimer',
    title: 'Website Disclaimer',
    desc: 'Website disclaimer for kiwifinancial.co.nz - the information on this site is general in nature and is not personalised financial advice.',
    intro: 'The information published on this website is general in nature only. It does not take your particular financial situation, goals or needs into account and is not personalised financial advice.',
    sections: [
      ['General information only', [
        'Nothing on this website constitutes a recommendation to acquire, hold or dispose of any financial product, nor an offer of credit. Before acting on anything you read here you should seek advice specific to your circumstances from a licensed financial adviser, and where relevant from your accountant and solicitor.',
        'All lending is subject to the relevant lender\u2019s criteria, their responsible lending obligations under the Credit Contracts and Consumer Finance Act 2003 (CCCFA), and final approval. Interest rates, fees, cash contributions and lending policies change frequently and without notice.'
      ]],
      ['Calculators and estimates', [
        'The calculators on this website are illustrative tools. They apply standard amortisation mathematics to the figures you enter and assume a constant interest rate for the full term, which is not how New Zealand fixed-rate lending actually works in practice.',
        'Results are estimates only and do not constitute financial advice. They exclude establishment fees, legal fees, insurance, rates, body corporate levies, low-equity margins and any lender-specific charges. Your actual repayments will be set by your lender.'
      ]],
      ['Indicative interest rates', [
        'Any interest rates shown on this website are indicative only, are not an offer of credit, and may not reflect the rate you are offered. Advertised special rates typically require a minimum deposit of 20% and may carry other conditions. We update rates periodically but they can change at any time.'
      ]],
      ['Third-party links and content', [
        'This website may link to third-party websites. We do not control those sites and are not responsible for their content, accuracy or privacy practices. A link is not an endorsement.'
      ]],
      ['Limitation of liability', [
        'While we take reasonable care to keep this website accurate and up to date, we give no warranty that it is free from error or omission. To the maximum extent permitted by law, Kiwi Financial Solutions excludes liability for any loss arising from reliance on the content of this website. Nothing in this disclaimer limits your rights under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986 where those Acts apply.'
      ]]
    ]
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    desc: 'How Kiwi Financial Solutions collects, uses, stores and protects your personal information under the Privacy Act 2020.',
    intro: 'Kiwi Financial Solutions is committed to protecting your privacy. This policy explains what personal information we collect, why we collect it, and what we do with it. We handle all personal information in accordance with the Privacy Act 2020 and the Information Privacy Principles.',
    sections: [
      ['What we collect', [
        'To give you advice and arrange lending we generally need: your name, contact details and date of birth; identification documents; details of your income, employment, assets, liabilities and expenses; your credit history; and information about the property or asset involved.',
        'If you only use the calculators on this website, nothing you type into them is sent to us or stored. They run entirely in your browser.'
      ]],
      ['How we use it', [
        'We use your information to assess your situation, prepare and submit applications to lenders on your behalf, meet our obligations under anti-money laundering legislation, comply with the Code of Professional Conduct for Financial Advice Services, and keep you informed about your application.',
        'With your consent we may also contact you about reviewing your lending in future, for example when a fixed rate is due to expire.'
      ]],
      ['Who we share it with', [
        'We share your information with the lenders you ask us to approach, with credit reporting agencies where you have authorised a credit check, with insurers or solicitors where relevant to your transaction, and with our aggregator and compliance providers. We do not sell your information to anyone.'
      ]],
      ['Storage and security', [
        'Your information is held securely in our client management systems, which may be hosted in New Zealand or overseas. We retain records for at least seven years as required by our regulatory and tax obligations, after which they are securely destroyed.'
      ]],
      ['Your rights', [
        'You have the right to ask what personal information we hold about you, to request a copy of it, and to ask us to correct anything that is wrong. Email info@kiwifinancial.co.nz and we will respond within 20 working days. If you are not satisfied with how we handle your request you can contact the Office of the Privacy Commissioner.'
      ]],
      ['Cookies and analytics', [
        'This website uses minimal browser storage to remember whether you have already been shown our call-back prompt during your visit. That information stays in your browser and is cleared when you close the tab.'
      ]]
    ]
  },
  {
    slug: 'important-information',
    title: 'Important Information',
    desc: 'Important information about the financial advice services provided by Kiwi Financial Solutions, including scope, limitations and complaints.',
    intro: 'This page sets out important information about the nature and scope of the financial advice we provide, so you can decide whether our service is right for you.',
    sections: [
      ['Nature and scope of advice', [
        'We provide financial advice about residential and commercial lending, including home loans, refinancing, construction lending, asset finance, business lending and investment property lending. We arrange lending through a panel of New Zealand bank and non-bank lenders.',
        'We do not provide advice on investments, KiwiSaver fund selection, tax or legal matters. Where those issues arise we will tell you and recommend you speak to an appropriately qualified professional.'
      ]],
      ['Duties we owe you', [
        'When we give you regulated financial advice we are required by law to give priority to your interests, exercise care, diligence and skill, meet the standards of competence, knowledge and skill in the Code of Professional Conduct for Financial Advice Services, and ensure you understand the advice we give and any limitations on it.'
      ]],
      ['Lender panel', [
        'We compare lending across a panel that includes ANZ, ASB, BNZ, Westpac, Kiwibank, SBS Bank, TSB, ICBC, Bank of China, Heartland Bank, The Co-operative Bank and a range of non-bank lenders. We do not have access to every lender in the New Zealand market, and some lenders deal only directly with customers.'
      ]],
      ['Responsible lending', [
        'All consumer lending we arrange is subject to the lender\u2019s responsible lending obligations under the Credit Contracts and Consumer Finance Act 2003 (CCCFA). Lenders are required to make reasonable enquiries into your income and expenses and to be satisfied the lending is affordable without substantial hardship. This is why detailed bank statements and expense information are requested.'
      ]],
      ['Complaints and dispute resolution', [
        'If you are unhappy with our service, please tell us first by calling 027 303 0000 or emailing info@kiwifinancial.co.nz. We will acknowledge your complaint, investigate it and respond with an outcome.',
        'If we cannot resolve it to your satisfaction, you can refer the matter free of charge to our external dispute resolution scheme. Details of the scheme are provided in our disclosure statement, which is available on request at no cost.'
      ]]
    ]
  },
  {
    slug: 'disclosure',
    title: 'Disclosure Statement',
    desc: 'Disclosure statement for Kiwi Financial Solutions - licensing, fees, commissions and conflicts of interest.',
    intro: 'This is a summary of the disclosure information we are required to provide. A full copy of our disclosure statement is available free of charge on request - just email info@kiwifinancial.co.nz.',
    sections: [
      ['Licensing status', [
        'Kiwi Financial Solutions is a registered Financial Advice Provider under the Financial Markets Conduct Act 2013 and is listed on the Financial Service Providers Register (FSPR). We are authorised to provide regulated financial advice about lending products in New Zealand.'
      ]],
      ['Fees', [
        'In most cases you will not pay us a fee. We are remunerated by the lender you choose. In limited circumstances \u2014 for example complex commercial or development transactions, or where a lender does not pay commission \u2014 a fee may apply. Any fee will be agreed with you in writing before any work is undertaken, and you will never receive an invoice you have not already approved.',
        'Some lenders may claw back commission if a loan is repaid or refinanced within a set period, commonly 24 to 28 months. If that happens we may ask you to contribute toward the clawback. We will always tell you before this risk arises.'
      ]],
      ['Commissions and incentives', [
        'Lenders typically pay an upfront commission of approximately 0.50% to 0.85% of the loan amount drawn down, and in some cases an ongoing trail commission of around 0.15% to 0.20% per annum of the loan balance. The rate you are offered is not affected by what we are paid.',
        'From time to time lenders may offer advisers professional development, product training or hospitality. We maintain a register of any such benefits.'
      ]],
      ['Conflicts of interest', [
        'We are not owned by, and hold no shareholding in, any lender. To manage any potential conflict we follow an advice process that documents why a particular lender was recommended, have our files reviewed by our compliance provider, and never allow commission levels to determine a recommendation.'
      ]],
      ['Duties and complaints', [
        'We are bound by the duties set out in the Financial Markets Conduct Act 2013 and the Code of Professional Conduct for Financial Advice Services. If you wish to make a complaint, contact us on 027 303 0000 or info@kiwifinancial.co.nz. If we cannot resolve it, you may refer it free of charge to our external dispute resolution scheme. We are also a member of an approved professional body and hold professional indemnity insurance.'
      ]]
    ]
  }
];

const page = (p) => `<!DOCTYPE html>
<html lang="en-NZ" data-root="../" data-page="legal">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title} | Kiwi Financial Solutions</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="https://kiwifinancial.co.nz/legal/${p.slug}.html">
<meta name="theme-color" content="#0C0634">
<meta property="og:type" content="website">
<meta property="og:title" content="${p.title} | Kiwi Financial Solutions">
<meta property="og:description" content="${p.desc}">
<meta property="og:image" content="https://kiwifinancial.co.nz/assets/images/og-image.png">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../assets/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
</head>

<body>
<a class="skip-link" href="#main">Skip to content</a>
<div data-component="header"></div>
<noscript><div class="wrap" style="padding:20px 0"><img src="../assets/images/logo@2x.png" width="160" alt="Kiwi Financial Solutions - Auckland Mortgage Advisers"><p><a href="../index.html">Home</a> &middot; <a href="tel:+64273030000">027 303 0000</a></p></div></noscript>

<main id="main">

  <section class="hero page-hero" style="padding-bottom:clamp(40px,5vw,56px)">
    <div class="hero__mesh" aria-hidden="true"></div>
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>/</span><span>${p.title}</span></nav>
      <h1 style="margin-bottom:12px">${p.title}</h1>
      <p>${p.intro}</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap" style="max-width:800px">
      ${p.sections.map(([h, paras]) => `<h2 style="font-size:clamp(1.25rem,2.2vw,1.6rem);margin-top:2em">${h}</h2>
      ${paras.map(t => `<p style="color:var(--muted)">${t}</p>`).join('\n      ')}`).join('\n      ')}

      <p class="disclaimer" style="margin-top:40px">Last updated ${new Date().toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}.
        Kiwi Financial Solutions is a registered Financial Advice Provider under the Financial Markets Conduct Act 2013.
        Questions? Email <a href="mailto:info@kiwifinancial.co.nz">info@kiwifinancial.co.nz</a> or call
        <a href="tel:+64273030000">027 303 0000</a>.</p>

      <div class="btn-row" style="margin-top:28px">
        ${PAGES.filter(o => o.slug !== p.slug).map(o => `<a class="btn btn--outline btn--sm" href="${o.slug}.html">${o.title}</a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2>Still have a question?</h2>
      <p>Ask us directly &mdash; we would rather explain it than have you guess.</p>
      <div class="btn-row">
        <a class="btn btn--cta" href="../contact.html">Contact us</a>
        <a class="btn btn--ghost" href="tel:+64273030000">Call 027 303 0000</a>
      </div>
    </div>
  </section>

</main>

<div data-component="footer"></div>
<script src="../assets/js/config.js"></script>
<script src="../assets/js/analytics.js" defer></script>
<script src="../assets/js/site.js" defer></script>
</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
PAGES.forEach(p => {
  fs.writeFileSync(path.join(OUT, p.slug + '.html'), page(p), 'utf8');
  console.log('  wrote legal/' + p.slug + '.html');
});
console.log('Legal pages generated.');
