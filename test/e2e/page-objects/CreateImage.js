const FormComponent = require("../components/Form");
const HeaderComponent = require("../components/Header");
const PreviewComponent = require("../components/Preview");

class CreateImage {
  constructor() {
    this._relativeUrl = "/create-image";

    this.header = new HeaderComponent();
    this.form = new FormComponent();
    this.preview = new PreviewComponent();
  }

  get relativeUrl() {
    return this._relativeUrl;
  }
}

module.exports = CreateImage;
