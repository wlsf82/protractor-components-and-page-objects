const helper = require("protractor-helper");

const ButtonsComponent = require("./buttons");
const FieldsComponent = require("./fields");
const HeaderComponent = require("./header");

class Form {
    constructor() {
        this.container = element(by.css("form"));

        this.buttons = new ButtonsComponent(this.container);
        this.fields = new FieldsComponent(this.container);
        this.header = new HeaderComponent(this.container);
    }

    fillWithDataAndSubmit(data) {
        helper.fillFieldWithTextWhenVisible(this.fields.name, data.name);
        helper.fillFieldWithTextWhenVisible(this.fields.message, data.message);
        helper.clickWhenClickable(this.buttons.submit);
    }
}

module.exports = Form;
