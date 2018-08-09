const FormComponent = require("../components/Form");
const PreviewComponent = require("../components/Preview");

class CreateImage {
    constructor() {
        this.relativeUrl = "/create-image";

        this.form = new FormComponent();
        this.preview = new PreviewComponent();
    }
}

module.exports = CreateImage;
