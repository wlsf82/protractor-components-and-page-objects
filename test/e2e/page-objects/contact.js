const FormComponent = require("../components/form/main");

class Contact {
    constructor() {
        this.relativeUrl = "contact";

        this.form = new FormComponent();
    }
}

module.exports = Contact;
