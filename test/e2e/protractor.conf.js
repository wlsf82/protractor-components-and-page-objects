const SpecReporter = require("jasmine-spec-reporter").SpecReporter;

module.exports.config = {
  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      args: ["--headless", "--disable-gpu", "--window-size=1024,768"]
    }
  },
  baseUrl: "https://example.com",
  specs: ["specs/*.spec.js"],
  onPrepare: () => {
    browser.waitForAngularEnabled(false);
    jasmine.getEnv().addReporter(
      new SpecReporter({
        displayFailuresSummary: true,
        displayFailedSpec: true,
        displaySuiteNumber: true,
        displaySpecDuration: true
      })
    );
  }
};
