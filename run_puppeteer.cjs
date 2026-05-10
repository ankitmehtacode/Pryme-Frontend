const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('Log:', msg.text()));
  page.on('pageerror', error => console.log('PageError:', error.message));
  page.on('requestfailed', request => console.log('Request failed:', request.url(), request.failure().errorText));

  // Go to the domain first so we can set sessionStorage
  await page.goto('http://localhost:8081/');
  
  await page.evaluate(() => {
    // Inject the old state without validationErrors
    const oldState = {
      state: {
        applicationId: "test-123",
        currentStage: 1,
        completedStages: [],
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        basicKYC: {
          fullName: '',
          mobileNumber: '',
          mobileVerified: false,
          email: '',
          dateOfBirth: '',
          panNumber: '',
          state: '',
          city: '',
          pinCode: '',
          religion: '',
          employmentType: null,
        },
        financialDetails: { path: null, data: {} },
        loanRequirements: {
          loanType: 'PERSONAL_LOAN',
          loanAmount: 500000,
          tenureYears: 5,
          purpose: '',
          cibilScore: 750,
        },
        financialFootprint: {
          panNumber: '',
          totalExistingEMI: 0,
          primaryBankName: '',
          hasCoApplicant: false,
          propertyIdentified: false,
          estimatedPropertyValue: 0,
          isAbove50Lakhs: false,
        },
        documents: [],
        consent: {
          termsAccepted: false,
          cibilPullAuthorized: false,
          dataSharingAuthorized: false,
        }
        // Notice: NO validationErrors
      },
      version: 4
    };
    sessionStorage.setItem('pryme-loan-session', JSON.stringify(oldState));
  });

  // Now load /apply which will hydrate from sessionStorage
  await page.goto('http://localhost:8081/apply', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
