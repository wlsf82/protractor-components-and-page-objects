const helper = require("protractor-helper");

class Form {
    constructor() {
        this.container = element(by.css("form"));

        this.nameField = this.container.element(by.css(".fields #name"));
        this.descriptionField = this.container.element(by.css(".fields #description"));
        this.imageUrlField = this.container.element(by.css(".fields #image-url"));
        this.cancelButton = this.container.element(by.css(".actions .cancel-button"));
        this.submitButton = this.container.element(by.css(".actions input[type='submit']"));
    }

    fillWithDataAndSubmit(data) {
        helper.fillFieldWithTextWhenVisible(this.nameField, data.name);
        helper.fillFieldWithTextWhenVisible(this.descriptionField, data.description);
        helper.fillFieldWithTextWhenVisible(this.imageUrlField, data.imageUrl);
        helper.clickWhenClickable(this.submitButton);
    }
}

module.exports = Form;
