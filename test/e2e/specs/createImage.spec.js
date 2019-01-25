const helper = require("protractor-helper");

const CreateImagePage = require("../page-objects/CreateImage");

describe("Given I access the relative URL '/create-image'", () => {
  const createImagePage = new CreateImagePage();

  beforeEach(() => browser.get(createImagePage.relativeUrl));

  describe("Happy path", () => {
    describe("When I fill the image URL field with a valid value", () => {
      const imageUrlValue = "http://example.com/some-image.png";

      beforeEach(() =>
        helper.fillFieldWithText(
          createImagePage.form.imageUrlField,
          imageUrlValue
        )
      );

      it("Then the image preview element uses the provided value in the 'src' attribute", () => {
        expect(createImagePage.preview.image.getAttribute("src")).toEqual(
          imageUrlValue
        );
      });
    });

    describe("When I click the header's heading", () => {
      beforeEach(() => helper.click(createImagePage.header.heading));

      it("Then I'm redirected to the home page", () => {
        helper.waitForUrlToBeEqualToExpectedUrl(browser.baseUrl);
      });
    });

    describe("When I submit the form with valid data", () => {
      let data;

      beforeEach(() => {
        data = {
          name: "Magic cube",
          description: "The nicest toy ever.",
          imageUrlValue: "http://example.com/magic-cube.png"
        };

        createImagePage.form.fillWithDataAndSubmit(data);
      });

      it("Then all fields are cleared and a success message is shown", () => {
        helper.waitForTextNotToBePresentInElement(
          createImagePage.form.nameField,
          data.name
        );
        helper.waitForTextNotToBePresentInElement(
          createImagePage.form.descriptionField,
          data.description
        );
        helper.waitForTextNotToBePresentInElement(
          createImagePage.form.imageUrlField,
          data.imageUrlValue
        );

        const successMessage = element(by.css(".success-message"));

        helper.waitForElementVisibility(successMessage);
      });
    });
  });

  describe("Alternate paths", () => {
    describe("When I submit the form without filling the name, description, and image URL", () => {
      it("Then all required fields are shown in red, meaning error", () => {
        helper.click(createImagePage.form.submitButton);

        expect(
          createImagePage.form.nameField.getCssValue("background-color")
        ).toEqual("rgb(255,0,0)");
        expect(
          createImagePage.form.descriptionField.getCssValue("background-color")
        ).toEqual("rgb(255,0,0)");
        expect(
          createImagePage.form.imageUrlField.getCssValue("background-color")
        ).toEqual("rgb(255,0,0)");
      });
    });

    describe("When I submit the form with a name and description, but a missing image URL", () => {
      beforeEach(() => {
        const dataSetWithMissingImageUrl = {
          name: "Boo",
          description: "The nicest kid! From Monters Inc.",
          imageUrlValue: ""
        };

        createImagePage.form.fillWithDataAndSubmit(dataSetWithMissingImageUrl);
      });

      it("Then the required field (image URL) is shown in red, meaning error", () => {
        expect(
          createImagePage.form.imageUrlField.getCssValue("background-color")
        ).toEqual("rgb(255,0,0)");
      });
    });
  });
});
