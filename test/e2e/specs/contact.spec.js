const helper = require("protractor-helper");

const ContactPage = require("../page-objects/contact");

describe("given I access the relative URL 'contact'", () => {
    const contactPage = new ContactPage();

    beforeEach(() => browser.get(contactPage.relativeUrl));

    describe("happy path", () => {
        describe("when I submit the form with valid data", () => {
            it("then all fields are cleared and a success message is shown", () => {
                const data = {
                    name: "John",
                    message: "Just an example message"
                };

                contactPage.form.fillWithDataAndSubmit(data);

                expect(contactPage.nameField.getText()).toEqual("");
                expect(contactPage.messageField.getText()).toEqual("");

                const successMessage = element(by.css(".success-message"));

                expect(successMessage.isDisplayed()).toBe(true);
            });
        });
    });

    describe("alternate paths", () => {
        describe("when I submit the form without filling name and message", () => {
            it("then all required fields are shown in red, meaning error", () => {
                helper.clickWhenClickable(contactPage.form.submitButton);

                expect(contactPage.nameField.getAttribute("warning-color")).toEqual("red");
                expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");
            });
        });

        describe("when I submit the form with a name but a missing message", () => {
            it("then the required field (message) is shown in red, meaning error", () => {
                const invalidDataSet = {
                    name: "Josh",
                    message: ""
                };

                contactPage.form.fillWithDataAndSubmit(invalidDataSet);

                expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");
            });
        });
    });
});
