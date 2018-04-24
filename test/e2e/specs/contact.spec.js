const helper = require("protractor-helper");

const ContactPage = require("../page-objects/contact");

describe("when accessing the relative URL 'contact'", () => {
    const contactPage = new ContactPage();

    beforeEach(() => browser.get(contactPage.relativeUrl));

    describe("happy path", () => {
        describe("when submitting the form with valid data", () => {
            it("cleans the fields and show a success message", () => {
                const data = {
                    name: "John",
                    message: "Just an example message"
                };

                contactPage.form.fillWithDataAndSubmit(data);

                // @TODO: add expectations
            });
        });
    });

    describe("alternate paths", () => {
        describe("when submitting the form without filling name and message", () => {
            it("shows required fields in red, meaning error", () => {
                helper.clickWhenClickable(contactPage.form.submitButton);

                // @TODO: add expectations
            });
        });

        describe("when submitting the form with name but missing message", () => {
            it("shows required field (message) in red, meaning error", () => {
                const invalidDataSet = {
                    name: "Josh",
                    message: ""
                };

                contactPage.form.fillWithDataAndSubmit(invalidDataSet);

                // @TODO: add expectations
            });
        });
    });
});
