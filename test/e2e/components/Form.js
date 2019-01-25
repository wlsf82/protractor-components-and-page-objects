const helper = require("protractor-helper");

class Form {
  constructor() {
    this._parentElement = element(by.css("form"));

    this._nameField = this._parentElement.element(by.css(".fields #name"));
    this._descriptionField = this._parentElement.element(
      by.css(".fields #description")
    );
    this._imageUrlField = this._parentElement.element(by.css(".fields #image-url"));
    this._cancelButton = this._parentElement.element(
      by.css(".actions .cancel-button")
    );
    this._submitButton = this._parentElement.element(
      by.css(".actions input[type='submit']")
    );
  }

  get nameField() {
    return this._nameField;
  }

  get descriptionField() {
    return this._descriptionField;
  }

  get imageUrlField() {
    return this._imageUrlField;
  }

  get cancelButton() {
    return this._cancelButton;
  }

  get submitButton() {
    return this._submitButton;
  }

  fillWithDataAndSubmit(data) {
    helper.fillFieldWithText(this.nameField, data.name);
    helper.fillFieldWithText(this.descriptionField, data.description);
    helper.fillFieldWithText(this.imageUrlField, data.imageUrlValue);
    helper.click(this.submitButton);
  }
}

module.exports = Form;
