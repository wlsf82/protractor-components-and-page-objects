const FormComponent = require("../components/Form");
const HeaderComponent = require("../components/Header");
const PreviewComponent = require("../components/Preview");

class CreateImage {
  constructor() {
    this.relativeUrl = "/create-image";

    this.header = new HeaderComponent();
    this.form = new FormComponent();
    this.preview = new PreviewComponent();
  }
}

module.exports = CreateImage;
