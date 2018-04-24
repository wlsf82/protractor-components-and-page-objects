const helper = require("protractor-helper");

class Form {
    constructor() {
        this.container = element(by.css("form"));

        this.header = this.container.element(by.css("header h1"));
        this.nameField = this.container.element(by.css(".fields #name"));
        this.messageField = this.container.element(by.css(".fields #message"));
        this.cancelButton = this.container.element(by.css(".actions .cancel-button"));
        this.submitButton = this.container.element(by.css(".actions input[type='submit']"));
    }

    fillWithDataAndSubmit(data) {
        helper.fillFieldWithTextWhenVisible(this.nameField, data.name);
        helper.fillFieldWithTextWhenVisible(this.messageField, data.message);
        helper.clickWhenClickable(this.submitButton);
    }
}

module.exports = Form;
