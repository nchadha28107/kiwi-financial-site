/* Generates the six service pages from one template so they stay structurally identical. */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'services');

const SERVICES = [
  {
    slug: 'home-loans',
    name: 'Home Loans',
    title: 'Home Loans & First Home Buyers Auckland',
    metaDesc: 'Independent home loan advice in Auckland. We compare 15+ NZ lenders for first home buyers and movers, including First Home Loans and KiwiSaver withdrawals.',
    h1: 'Home loans, without the bank sales pitch',
    lede: 'Whether it is your first home or your fifth, we compare the whole market and structure the loan so you pay it off faster.',
    whatTitle: 'What is a home loan and who is it for?',
    what: [
      'A home loan is lending secured against a residential property you intend to live in. In New Zealand most owner-occupiers borrow up to 80% of the property value, with the balance coming from savings, KiwiSaver, equity or a family contribution.',
      'We work with first home buyers, people moving up, people downsizing, and anyone who has been told &ldquo;no&rdquo; by their own bank. Because we are not owned by a lender, we can go straight to the banks most likely to say yes to your situation rather than putting you through the same declined application twice.'
    ],
    benefits: [
      ['One application, every lender', 'We present your file to the lenders that fit, so your credit file is not hit by repeated enquiries.'],
      ['Structure that saves interest', 'Splitting fixed and floating, setting the right term, and using offset or revolving credit properly can save tens of thousands.'],
      ['First Home Loan &amp; KiwiSaver', 'We check your eligibility for a 5% deposit First Home Loan and help with the KiwiSaver first home withdrawal.'],
      ['We handle the chase-up', 'Conditions, valuations, solicitor coordination &mdash; we push the lender so you are not left waiting.']
    ],
    eligibility: [
      'A deposit of at least 5% (First Home Loan) or 10&ndash;20% for most standard lending',
      'Stable income &mdash; PAYE, self-employed with two years of accounts, or contract income',
      'A clean-ish credit history (small blemishes are usually workable)',
      'NZ citizen, permanent resident, resident visa, or in many cases a work visa',
      'Enough surplus income to pass the lender&rsquo;s servicing test at their stressed test rate'
    ],
    calc: { slug: 'repayment-calculator', name: 'Repayment calculator', blurb: 'See your weekly, fortnightly or monthly repayments and how much interest you will pay over the life of the loan.' },
    faqs: [
      ['How much deposit do I actually need?', 'For most owner-occupied lending the banks want 20%. There is a limited pool of low-deposit lending at 10%, and the Kainga Ora First Home Loan allows 5% for eligible buyers. We will tell you honestly which of these you qualify for before you waste time house hunting.'],
      ['Can I use my KiwiSaver?', 'Usually yes. After three years of membership you can generally withdraw your KiwiSaver balance less $1,000 and any Australian-sourced funds, provided you have not owned property before and will live in the home. Your scheme provider processes the withdrawal and we help you time it with settlement.'],
      ['Does using a mortgage adviser cost me anything?', 'No. We are paid a commission by the lender you choose. We disclose exactly what we receive in our disclosure statement, and that commission does not change your interest rate.'],
      ['My bank already declined me. Is it worth trying?', 'Very often, yes. Every lender has different servicing calculators, credit appetite and policies on things like overtime, bonuses, boarder income and self-employment. A decline from one bank says very little about the other fourteen.'],
      ['How long does a pre-approval take?', 'With complete documents we can usually have a pre-approval back within two to five working days, sometimes faster. Pre-approvals typically last 60 to 90 days.']
    ]
  },
  {
    slug: 'refinance',
    name: 'Refinance & Refix',
    title: 'Mortgage Refinance & Refix Auckland',
    metaDesc: 'Rolling off a fixed rate? We re-shop your whole mortgage across 15+ NZ lenders and negotiate cash contributions. Free, independent advice.',
    h1: 'Stop accepting the rate you are offered',
    lede: 'When your fixed rate rolls off, your bank quotes you a number. We quote you the market &mdash; and negotiate the cash contribution on top.',
    whatTitle: 'What is refinancing and who is it for?',
    what: [
      'Refixing means agreeing a new fixed rate with your existing lender. Refinancing means moving the loan to a different lender, usually to get a better rate, release equity, consolidate debt or restructure the loan entirely.',
      'If your fixed term is expiring in the next six months, or you have not reviewed your mortgage in two years, you are almost certainly leaving money on the table. Most lenders also pay a cash contribution for new business, which often more than covers your break and legal costs.'
    ],
    benefits: [
      ['We negotiate, you do not have to', 'We go back to your bank with competing offers in hand. Often they will match rather than lose you.'],
      ['Cash contributions', 'Lenders commonly offer around 0.6&ndash;0.9% of the loan to win your business. We make sure that is on the table.'],
      ['Restructure while you are at it', 'Rolling expiry dates, splitting across terms and adding a revolving credit facility can matter more than the headline rate.'],
      ['Debt consolidation done properly', 'Rolling short-term debt into a 30-year mortgage can cost you. We only recommend it when the numbers genuinely work.']
    ],
    eligibility: [
      'An existing mortgage on a NZ property',
      'Generally at least 20% equity (less in some cases)',
      'Current income that still meets lender servicing requirements',
      'Awareness of any break costs on a fixed rate that has not yet expired',
      'No cash contribution clawback period still running from a recent switch'
    ],
    calc: { slug: 'refinance-calculator', name: 'Refinance savings calculator', blurb: 'Compare your current rate against today\u2019s best, including break fees, and see your break-even point.' },
    faqs: [
      ['What are break fees and will I have to pay them?', 'If you break a fixed rate before it expires, the lender charges an economic cost based on how wholesale rates have moved since you fixed. If rates have risen since, the fee can be near zero. We get an exact figure from your lender before recommending anything.'],
      ['How long does refinancing take?', 'Typically three to five weeks from application to settlement, most of which is lender assessment and solicitor work. We coordinate both.'],
      ['Will refinancing hurt my credit score?', 'A credit enquiry is recorded when a formal application is made, but a single enquiry has minimal impact. Making the same application to five banks at once is what causes damage, which is exactly what using one adviser avoids.'],
      ['Should I refix with my current bank instead?', 'Sometimes. If your equity is low, your income has changed, or break costs are high, staying put can be the right call. We will tell you if that is the case &mdash; we would rather keep you as a client for the next review.'],
      ['Do I need a solicitor?', 'Yes, for a full refinance to a new lender you need a solicitor to handle the discharge and new mortgage registration. Budget roughly $900&ndash;$1,500. Many cash contributions are sized to cover this.']
    ]
  },
  {
    slug: 'construction-loans',
    name: 'Construction & Development',
    title: 'Construction & Build Finance Auckland',
    metaDesc: 'Construction and development lending in Auckland. Progressive drawdown loans for new builds, major renovations and multi-unit developments. Independent advice.',
    h1: 'Finance that keeps your build on schedule',
    lede: 'Progressive drawdowns, fixed-price contracts, turn-key purchases and multi-unit developments &mdash; arranged by people who have done it before.',
    whatTitle: 'What is construction lending and who is it for?',
    what: [
      'Construction lending funds a build in stages rather than one lump sum. The lender releases money as each stage is completed and signed off, and you generally pay interest only on what has been drawn until the build is finished.',
      'It suits anyone building a new home on their own section, buying a turn-key or house-and-land package, undertaking a major renovation, or developing multiple units. The paperwork is heavier than a standard home loan and lender appetite varies enormously, which is exactly where an adviser earns their keep.'
    ],
    benefits: [
      ['Progressive drawdown managed for you', 'We coordinate stage valuations and drawdown requests so your builder is paid on time.'],
      ['Fixed-price contract review', 'We check your build contract against lender requirements before you sign, not after.'],
      ['Contingency built in', 'Lenders want to see a buffer. We structure it so variations do not stall your build.'],
      ['Development-ready lenders', 'For multi-unit projects we access non-bank and specialist development funders the main banks cannot match.']
    ],
    eligibility: [
      'A fixed-price build contract with a licensed building practitioner (or a detailed costing for a labour-only build)',
      'Typically 20% equity in the land and build cost combined, more for development projects',
      'Council consent issued or lodged',
      'Builder&rsquo;s insurance, contract works insurance and a guarantee or warranty in place',
      'Income to service the completed loan, not just the interest during the build'
    ],
    calc: { slug: 'repayment-calculator', name: 'Repayment calculator', blurb: 'Model what the completed loan will cost once your build is finished and the full balance is drawn.' },
    faqs: [
      ['Do I pay full repayments during the build?', 'Usually not. Most construction loans are interest-only on the drawn balance during the build, switching to principal and interest at completion. That keeps cash flow manageable while you may also be paying rent.'],
      ['What is the difference between turn-key and progressive drawdown?', 'With turn-key you pay a deposit and the balance on completion, so you only need the loan to settle at the end. With progressive drawdown you own the land and the lender funds each construction stage. Turn-key is simpler but you have less control over specification.'],
      ['Can I use a labour-only builder?', 'Some lenders allow it, but you will need detailed costings, a larger contingency and often more equity. It narrows the lender list considerably, so talk to us before committing.'],
      ['What happens if the build goes over budget?', 'Lenders require a contingency, typically 5&ndash;10%. If variations exceed it you will need to fund the gap or apply to increase the facility, which requires a new assessment. We build headroom in from the start where we can.'],
      ['Can I get construction finance for a development with multiple units?', 'Yes. Once you move past two or three units, main bank appetite drops and specialist development funders become the realistic path. Pricing is higher but so is the speed. We will lay out both options.']
    ]
  },
  {
    slug: 'asset-finance',
    name: 'Asset Finance',
    title: 'Asset & Equipment Finance Auckland',
    metaDesc: 'Vehicle, plant and equipment finance for NZ businesses and individuals. Fast approvals, competitive rates, structured so you keep your cash working.',
    h1: 'Fund the gear without draining the bank',
    lede: 'Vehicles, trucks, plant, machinery and equipment &mdash; financed quickly so your capital stays in the business.',
    whatTitle: 'What is asset finance and who is it for?',
    what: [
      'Asset finance is lending secured against the asset itself rather than against your house. Because the asset provides the security, approvals are faster and you avoid tying up equity in your home.',
      'It suits tradies buying a ute or trailer, transport operators adding to a fleet, contractors acquiring plant, and businesses upgrading production equipment. Terms generally run one to five years and the structure can be matched to the asset&rsquo;s useful life.'
    ],
    benefits: [
      ['Keep your home out of it', 'The asset is the security, so your residential equity stays available for property lending.'],
      ['Fast turnaround', 'Straightforward deals can be approved in 24&ndash;48 hours with the right documentation.'],
      ['Structure to suit cash flow', 'Seasonal payments, balloon residuals and deposit-free options are all available depending on the lender.'],
      ['New and used assets', 'We work with lenders who will fund quality used equipment, not just new.']
    ],
    eligibility: [
      'A clearly identified asset with an invoice or quote from the supplier',
      'For business lending, generally 12 months trading history (start-ups are possible with support)',
      'Reasonable credit history for the borrower or guarantors',
      'A deposit in some cases, though many deals are funded at 100% of the asset value',
      'Evidence the asset will be insured for its full value'
    ],
    calc: { slug: 'repayment-calculator', name: 'Repayment calculator', blurb: 'Use the repayment calculator to model a short-term asset loan \u2014 just set the amount, rate and term.' },
    faqs: [
      ['How fast can I get approved?', 'For a clean deal with an invoice and up-to-date financials, 24 to 48 hours is realistic. More complex structures or start-up businesses take longer.'],
      ['Is this tax deductible?', 'Interest on finance used for business purposes is generally deductible and depreciation may apply to the asset. We are not tax advisers, so confirm the specifics with your accountant.'],
      ['What is a balloon or residual payment?', 'A lump sum due at the end of the term. It lowers your regular payments but you must either pay it, refinance it or sell the asset to cover it. Useful for cash flow, risky if the asset depreciates faster than expected.'],
      ['Can I finance a used vehicle?', 'Yes. Most lenders will fund used assets, though the maximum age at the end of the term is capped &mdash; commonly 10 to 15 years for vehicles. Rates are usually slightly higher than for new.'],
      ['Do I need to put down a deposit?', 'Often not. Many asset finance deals are written at 100% of the invoice value for established businesses. A deposit improves pricing and widens the lender pool.']
    ]
  },
  {
    slug: 'commercial-loans',
    name: 'Commercial & Business',
    title: 'Commercial & Business Loans Auckland',
    metaDesc: 'Commercial property, working capital and business acquisition finance in Auckland. We compare bank and non-bank lenders to get your deal funded.',
    h1: 'Lending that works at business speed',
    lede: 'Commercial property, working capital, business acquisition and bridging &mdash; structured around your cash flow, not a template.',
    whatTitle: 'What is commercial lending and who is it for?',
    what: [
      'Commercial lending covers borrowing for business purposes: buying or refinancing commercial premises, funding working capital, acquiring a business, or bridging a short-term gap. Pricing and terms are negotiated case by case rather than set by a rate card.',
      'It suits business owners buying their own premises instead of renting, investors acquiring commercial or industrial property, and established businesses that need facilities their bank manager keeps pushing back on. Deals are assessed on the strength of the business and the quality of the security.'
    ],
    benefits: [
      ['Bank and non-bank access', 'When the main banks will not move, specialist funders often will &mdash; faster, at a price that still makes sense.'],
      ['Negotiated pricing', 'Commercial margins and fees are negotiable. We benchmark your offer against what the market is actually doing.'],
      ['Own your premises', 'Buying the building your business occupies converts rent into equity, often through a separate holding structure.'],
      ['Covenants explained in English', 'Interest cover ratios, LVR covenants and review clauses decide what happens when things get tight. We make sure you understand them before you sign.']
    ],
    eligibility: [
      'Two years of business financials, or a credible forecast supported by contracts',
      'Typically 30&ndash;35% deposit for commercial property (less with residential security as support)',
      'Demonstrated ability to service the debt from business cash flow',
      'A clear purpose for the funds and an exit or repayment strategy',
      'Directors&rsquo; guarantees in most cases'
    ],
    calc: { slug: 'amortisation-calculator', name: 'Amortisation calculator', blurb: 'Model a commercial facility year by year to see how fast the principal actually reduces.' },
    faqs: [
      ['How much deposit do I need for commercial property?', 'Generally 30&ndash;35% of the purchase price, though that can reduce if you offer additional residential security. Lease quality, tenant strength and lease term all affect how much a lender will advance.'],
      ['Are commercial rates higher than home loan rates?', 'Usually yes, because the risk profile is different. The gap depends on the security, the lease and the strength of the business. Terms are also typically shorter, with facility reviews every one to three years.'],
      ['Can I buy my own business premises through my company?', 'Commonly the premises is bought by a separate entity, often a trust or holding company, which then leases it to the trading business. There are tax and asset protection implications, so this needs your accountant and lawyer alongside us.'],
      ['What is an interest cover ratio?', 'A covenant requiring your earnings to exceed your interest cost by a set multiple, often 1.5 to 2 times. Breaching it can trigger a review even if you have never missed a payment, so it is worth negotiating up front.'],
      ['Can you help with short-term bridging?', 'Yes. Non-bank lenders can fund bridging quickly where there is a clear, credible exit &mdash; a sale, a refinance or a settlement. We will always want to see the exit before recommending it.']
    ]
  },
  {
    slug: 'investment-property',
    name: 'Investment Property',
    title: 'Investment Property Loans Auckland',
    metaDesc: 'Investment property lending in Auckland. Structure your portfolio, release equity and compare 15+ NZ lenders with independent mortgage advice.',
    h1: 'Build the portfolio properly from loan one',
    lede: 'The right structure at property one is what makes property three possible. We plan the whole runway, not just this deal.',
    whatTitle: 'What is investment lending and who is it for?',
    what: [
      'Investment lending is borrowing secured against a property you will rent out rather than live in. Reserve Bank LVR restrictions mean investors generally need a 30% deposit, although new builds are often exempt and can be funded with as little as 20%.',
      'It suits anyone releasing equity from their own home to buy a rental, investors adding to an existing portfolio, and people restructuring a former family home into a rental. How the loans are split and secured matters enormously for flexibility and tax treatment later.'
    ],
    benefits: [
      ['Standalone security', 'We avoid cross-collateralising everything, so you can sell one property later without renegotiating the lot.'],
      ['Equity release done right', 'Drawing equity from your own home to fund a deposit is standard &mdash; but the loan split determines your deductibility.'],
      ['New build advantages', 'New builds are exempt from the 30% investor LVR rule and have different interest deductibility treatment.'],
      ['Portfolio runway planning', 'We model what your next two purchases need to look like so you do not hit a servicing wall.']
    ],
    eligibility: [
      '30% deposit for an existing property, or around 20% for a qualifying new build',
      'Equity in an existing property, or cash savings',
      'Income that services the debt at the lender&rsquo;s test rate, with rental income shaded (usually 75&ndash;80%)',
      'A credible rental appraisal from a property manager or agent',
      'Awareness of bright-line, interest deductibility and healthy homes obligations'
    ],
    calc: { slug: 'repayment-calculator', name: 'Repayment calculator', blurb: 'Model the loan on your next rental and see how the repayments stack up against the likely rent.' },
    faqs: [
      ['How much deposit do I need for a rental?', 'Generally 30% for an existing property under current Reserve Bank restrictions. Qualifying new builds are exempt and can often be funded at 80% LVR. Deposit can come from cash or equity released from another property.'],
      ['Can I use the equity in my own home?', 'Yes, this is how most investors fund their first rental. We set it up as a separate loan split so the borrowing attributable to the investment is cleanly identifiable for your accountant.'],
      ['Is interest on an investment loan tax deductible?', 'The rules changed several times recently and depend on when the property was acquired and whether it is a new build. Deductibility is a tax question &mdash; we structure the lending so your accountant has clean numbers to work with.'],
      ['Should I cross-secure my properties?', 'Generally no. Cross-securing means every property secures every loan, which makes selling one or moving a single loan to a better lender far harder. We set up standalone security wherever the numbers allow.'],
      ['What is the bright-line test?', 'A rule that taxes gains on residential property sold within a set period of purchase. The period has changed several times, so the rule that applies depends on when you bought. Confirm the current position with your accountant before you sell.']
    ]
  }
];

/* -------------------------------------------------------------------- */
const head = (s) => `<!DOCTYPE html>
<html lang="en-NZ" data-root="../" data-page="services">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${s.title} | Kiwi Financial</title>
<meta name="description" content="${s.metaDesc}">
<link rel="canonical" href="https://kiwifinancial.co.nz/services/${s.slug}.html">
<meta name="theme-color" content="#0C0634">
<meta property="og:type" content="website">
<meta property="og:title" content="${s.title} | Kiwi Financial">
<meta property="og:description" content="${s.metaDesc}">
<meta property="og:url" content="https://kiwifinancial.co.nz/services/${s.slug}.html">
<meta property="og:image" content="https://kiwifinancial.co.nz/assets/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../assets/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: s.faqs.map(([q, a]) => ({
    '@type': 'Question',
    name: q.replace(/&[a-z]+;/g, "'"),
    acceptedAnswer: { '@type': 'Answer', text: a.replace(/&[a-z]+;/g, "'") }
  }))
}, null, 2)}
</script>
</head>`;

const page = (s) => `${head(s)}

<body>
<a class="skip-link" href="#main">Skip to content</a>
<div data-component="header"></div>
<noscript><div class="wrap" style="padding:20px 0"><img src="../assets/images/logo@2x.png" width="160" alt="Kiwi Financial Solutions - Auckland Mortgage Advisers"><p><a href="../index.html">Home</a> &middot; <a href="../apply.html">Apply</a> &middot; <a href="tel:+64273030000">027 303 0000</a></p></div></noscript>

<main id="main">

  <section class="hero page-hero">
    <div class="hero__mesh" aria-hidden="true"></div>
    <div class="wrap">
      <div class="page-hero__inner">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Home</a><span>/</span><a href="index.html">Services</a><span>/</span><span>${s.name}</span>
          </nav>
          <span class="eyebrow">${s.name}</span>
          <h1>${s.h1}</h1>
          <p>${s.lede}</p>
          <div class="btn-row" style="margin-top:26px">
            <a class="btn btn--cta" href="../apply.html">Apply for ${s.name.toLowerCase()}</a>
            <a class="btn btn--ghost" href="tel:+64273030000">Call 027 303 0000</a>
          </div>
          <p class="trust-row" style="margin-top:22px">
            <span data-tick>No credit check to enquire</span>
            <span data-tick>Free service</span>
            <span data-tick>100% independent</span>
          </p>
        </div>

        <div class="page-hero__media">
          <div class="glass" style="padding:28px">
            <h2 style="color:#fff;font-size:1.05rem">Why go through an adviser?</h2>
            <ul class="ticks" style="gap:14px;margin:18px 0 0">
              ${s.benefits.slice(0, 3).map(b => `<li><span class="tick">&#10003;</span><span><b>${b[0]}</b></span></li>`).join('\n              ')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- WHAT IT IS -->
  <section class="section">
    <div class="wrap" style="max-width:860px">
      <div class="section-head left" data-reveal style="max-width:none">
        <h2>${s.whatTitle}</h2>
      </div>
      ${s.what.map(p => `<p data-reveal="60" style="font-size:1.06rem;color:var(--muted)">${p}</p>`).join('\n      ')}
    </div>
  </section>

  <!-- BENEFITS -->
  <section class="section section--light">
    <div class="wrap">
      <div class="section-head" data-reveal>
        <span class="eyebrow">Key benefits</span>
        <h2>What you get working with us</h2>
      </div>
      <div class="grid grid-2">
        ${s.benefits.map((b, i) => `<article class="card" data-reveal="${i * 80}">
          <h3>${b[0]}</h3><p style="margin:0">${b[1]}</p>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <!-- ELIGIBILITY -->
  <section class="section">
    <div class="wrap split">
      <div data-reveal>
        <span class="eyebrow">Eligibility</span>
        <h2>What lenders will want to see</h2>
        <p style="color:var(--muted)">Nothing here is a hard rule &mdash; every lender weighs these differently, and
          part of our job is knowing which ones are flexible on which points.</p>
        <div class="btn-row" style="margin-top:24px">
          <a class="btn btn--cta" href="../apply.html">Check my eligibility free</a>
        </div>
      </div>
      <div data-reveal="120">
        <ul class="ticks" style="background:#fff;border:1px solid var(--line);border-radius:var(--r-lg);padding:30px;margin:0">
          ${s.eligibility.map(e => `<li><span class="tick">&#10003;</span><span><b style="font-weight:500;font-family:var(--font-body);color:var(--text)">${e}</b></span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="section section--light">
    <div class="wrap">
      <div class="section-head" data-reveal>
        <span class="eyebrow">The process</span>
        <h2>How it runs from here</h2>
      </div>
      <ol class="steps">
        <li class="step" data-reveal>
          <div class="step__num"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg></div>
          <span class="step__badge">1</span>
          <h3>Tell us about your needs</h3>
          <p>A short application or a 15-minute conversation. We work out what is actually achievable before you commit to anything.</p>
        </li>
        <li class="step" data-reveal="120">
          <div class="step__num"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div>
          <span class="step__badge">2</span>
          <h3>We compare 15+ lenders</h3>
          <p>We match your situation to the lenders most likely to approve it at the sharpest price, then present you the shortlist.</p>
        </li>
        <li class="step" data-reveal="240">
          <div class="step__num"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2 4-4"/><path d="M3 10h4l3-3 4 4 3-3h4"/><path d="M3 10v7a2 2 0 0 0 2 2h3"/></svg></div>
          <span class="step__badge">3</span>
          <h3>We manage it to settlement</h3>
          <p>Conditions, valuations, solicitors and lender chase-ups. You get updates; we do the chasing.</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- CALCULATOR TEASER -->
  <section class="section">
    <div class="wrap">
      <div class="card" data-reveal style="display:grid;grid-template-columns:1fr auto;gap:28px;align-items:center;padding:clamp(28px,4vw,44px)">
        <div>
          <span class="eyebrow">Run the numbers</span>
          <h2 style="font-size:clamp(1.4rem,2.6vw,1.9rem);margin-bottom:10px">${s.calc.name}</h2>
          <p style="margin:0;color:var(--muted)">${s.calc.blurb}</p>
        </div>
        <a class="btn btn--accent" href="../tools/${s.calc.slug}.html">Open calculator</a>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--light">
    <div class="wrap" style="max-width:860px">
      <div class="section-head" data-reveal>
        <span class="eyebrow">FAQ</span>
        <h2>${s.name} questions, answered</h2>
      </div>
      <div class="accordion">
        ${s.faqs.map(([q, a], i) => `<div class="acc-item" data-reveal="${i * 50}">
          <h3 style="margin:0"><button class="acc-btn" type="button" aria-expanded="false" aria-controls="faq${i}">
            ${q}<span class="pm" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
          </button></h3>
          <div class="acc-panel" id="faq${i}"><div class="acc-panel__inner">${a}</div></div>
        </div>`).join('\n        ')}
      </div>
      <p class="disclaimer" style="margin-top:26px">All lending is subject to lender criteria, responsible lending
        obligations under the Credit Contracts and Consumer Finance Act 2003 (CCCFA), and approval. The information on
        this page is general in nature and is not personalised financial advice.</p>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2>Apply for ${s.name.toLowerCase()}</h2>
      <p>It costs nothing to ask, and we will tell you honestly whether we can help.</p>
      <div class="btn-row">
        <a class="btn btn--cta" href="../apply.html">Apply Now</a>
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
SERVICES.forEach(s => {
  fs.writeFileSync(path.join(OUT, s.slug + '.html'), page(s), 'utf8');
  console.log('  wrote services/' + s.slug + '.html');
});
console.log('Service pages generated.');
