const helper = require("protractor-helper");

const CreateImagePage = require("../page-objects/CreateImage");

describe("given I access the relative URL '/create-image'", () => {
  const createImagePage = new CreateImagePage();

  beforeEach(() => browser.get(createImagePage.relativeUrl));

  describe("happy path", () => {
    describe("when filling the image url field with a valid url", () => {
      const imageUrl = "http://example.com/some-image.png";

      beforeEach(() =>
        helper.fillFieldWithTextWhenVisible(
          createImagePage.form.imageUrlField,
          imageUrl
        ));

      it("then the image preview element uses the provided value in the 'src' attribute", () => {
        expect(createImagePage.preview.image.getAttribute("src")).toEqual(
          imageUrl
        );
      });
    });

    describe("when I submit the form with valid data", () => {
      beforeEach(() => {
        const data = {
          name: "Magic cube",
          description: "The nicest toy ever.",
          imageUrl: "http://example.com/magic-cube.png"
        };

        createImagePage.form.fillWithDataAndSubmit(data);
      });

      it("then all fields are cleared and a success message is shown", () => {
        expect(createImagePage.form.nameField.getText()).toEqual("");
        expect(createImagePage.form.descriptionField.getText()).toEqual("");
        expect(createImagePage.form.imageUrlField.getText()).toEqual("");

        const successMessage = element(by.css(".success-message"));

        expect(successMessage.isDisplayed()).toBe(true);
      });
    });
  });

  describe("alternate paths", () => {
    describe("when I submit the form without filling name, description, and image url", () => {
      it("then all required fields are shown in red, meaning error", () => {
        helper.clickWhenClickable(createImagePage.form.submitButton);

        expect(
          createImagePage.form.nameField.getAttribute("warning-color")
        ).toEqual("red");
        expect(
          createImagePage.form.descriptionField.getAttribute("warning-color")
        ).toEqual("red");
        expect(
          createImagePage.form.imageUrlField.getAttribute("warning-color")
        ).toEqual("red");
      });
    });

    describe("when I submit the form with a name and description, but a missing image url", () => {
      it("then the required field (image url) is shown in red, meaning error", () => {
        const dataSetWithMissingImageUrl = {
          name: "Boo",
          description: "The nicest girl. From Monters Inc."
        };

        createImagePage.form.fillWithDataAndSubmit(dataSetWithMissingImageUrl);

        expect(
          createImagePage.form.imageUrlField.getAttribute("warning-color")
        ).toEqual("red");
      });
    });
  });
});
