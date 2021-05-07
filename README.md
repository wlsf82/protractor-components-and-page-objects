# Protractor Components and Page Objects

This sample project intends to demonstrate an architecture proposal for writing graphical user interface (GUI) tests with [Protractor](http://www.protractortest.org/#/) using a concept of Page Objects composed by Components.

## The inspiration

In October, 2017 I went to Berlin for the SeleniumConf and I watched a presentation by Archit Pal Singh Sachdeva, Software Engineer at Facebook, about [readable, stable and maintainable E2E testing](https://www.seleniumconf.de/talks#archit-pal-singh-sachdeva), and this presentation made me **re-think** on how GUI E2E tests are written, where the main solution for code organization and maintainability is usually the use of the [Page Objects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) pattern.
But what about using Page Objects together with Components?

## A hypothetical example

I think examples are the better way to explain how code works, so I'll explain you this concept using a hypothetical example of a web application where you can create images, giving each image a name, a description, and a URL pointing to such image in the web.

The page that we will work in this example would look like this:

```
------------------------------------------------------
|                    Create image                    |
------------------------------------------------------
|                                  |                 |
|                                  |     Preview     |
|  Name:        [            ]     |    ---------    |
|  Description: [            ]     |    |       |    |
|  Image URL:   [            ]     |    |  \o/  |    |
|                                  |    |       |    |
|                                  |    ---------    |
|                                  |                 |
|              [Cancel] [Submit]   |                 |
-------------------------------------------------------
```

Imagine that this page is composed by three main components, the header component, the form component, and the preview component.
The header component contains one element, which is a heading with the text 'Create image'. That's it.
The form component contains five elements, three text input fields (Name, Description, and Image URL), and two buttons (Cancel and Submit).
And the preview component contains two elements, a title (Preview), which is a heading, and a preview image.

Now let's see how we would structure our `CreateImage` Page Object so that it could be composed by these three different Components.

### Page object definition

A Page Object is defined by a relative URL, and one or more components. In this case, the `CreateImage` Page Object would look like this:

```js
// test/e2e/page-objects/CreateImage.js

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
```

Note that it starts requiring the `FormComponent`, the `HeaderComponent` and the `PreviewComponent` in the beginning, and the class itself has only four attributes in the constructor, a `_relativeUrl` with a string as its value (`"/create-image"`), a `header`, as an instance of the `HeaderComponent`, a `form`, as an instance of the `FormComponent`, and a `preview`, as an instance of the `PreviewComponent`.

> Notice that the relative URL is prefixed with a underscore (`_`). In JavaScript, this means that such attribute should not be direclty accessed. To access it we need to use its `get` method, which is defined right after the constructor (`get relativeUrl()`).

As you can see, the page object has no definition of web elements, it just instantiates the components that compose it, which makes the code simpler and separates better the responsibilities.

### Form component definition

Let's examine the `FormComponent`.

```js
// test/e2e/components/Form.js

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
```

First of all, the `Form` component requires an external library ([`protractor-helper`](http://npmjs.com/package/protractor-helper)). This library will be used in the component's method `fillWithDataAndSubmit` to interact with the elements only when they are ready for interaction.

Then, differently than the Page Object, instead of having as first attribute of the constructor a relative URL, it has a `_parentElement`, which in this case is a `form`. This `_parentElement` is used in the definition of any other elements of this component, and this is done to ensure that the elements are correctly and specifically located, meaning that in the DOM the elements are inside their correct parent element (the `_parentElement`).

As you can see, all other elements (`_nameField`, `_descriptionField`, `_imageUrlField`, `_cancelButton`, and `_submitButton` are defined based on their parent element (`_parentElement`).

Then, getters are defined for all the previously mentioned elements (except for the `_parentElement`).

> This is why all elements are prefixed with an underscore (`_`). This, in JavaScript, means that such attributes should not be direclty accessed, and to access them we need to use their `get` methods.

And finally, it defines the `fillWithDataAndSubmit` method, that receives a `data` object as an argument, and uses it for filling the form with and submitting it.

The `fillWithDataAndSubmit` method uses the `helper` defined in the beginning of the file to ensure that it will interact with the elements only when they are ready for it, as previously mentioned.

> Note that the `fillWithDataAndSubmit` method interacts with the attributes (elements) through their `get` methods, not directly.

Let's see the `HeaderComponent` then.

```js
// test/e2e/components/Header.js

class Header {
  constructor() {
    this._parentElement = element(by.css("header"));

    this._heading = this._parentElement.element(by.css("h1"));
  }

  get heading() {
    return this._heading;
  }
}

module.exports = Header;
```

The `Header` component is a simpler one. As the `Form` component, it also defines a `_parentElement`, for the exact same reason, and then it defines a `_heading` element based on the `_parentElement`, and a `get` method for the `_heading` element.

And now let's examine the `PreviewComponent`.

```js
// test/e2e/components/Preview.js

class Preview {
  constructor() {
    this._parentElement = element(by.css(".preview"));

    this._title = this._parentElement.element(by.css("h2"));
    this._image = this._parentElement.element(by.css("img"));
  }

  get title() {
    return this._title;
  }

  get image() {
    return this._image;
  }
}

module.exports = Preview;
```

The `Preview` component is also a simple one. As the `Form` and the `Header` components, it also defines a `_parentElement`, and then it defines two other elements, `_title`, and `_image`, both based on the `_parentElement`. Also, it defines `get` methods for both `_title` and `_image` elements.

> By using this practice we give the components the responsibilities of defining the elements and methods, and nothing else.

___

> Page Objects and Components are exported using `module.exports` to expose their APIs for usage, on tests, for example.

Now let's see how a test file would look like.

### Test definition

```js
// test/e2e/specs/createImage.spec.js

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
```

In the test file it's worth paying attention to some things.

- The tests are written using the keywords **Given**, **When**, and **Then**. This helps on understanding the pre-requirements of each test case, what are the actions performed, and what are the expected conditions.
- Only the page object is required at the top of the file. There is no need to require the components since they are already available through the Page Object.
- When running the `browser.get()` in the `beforeEach` statement we pass the `relativeUrl` of the `createImagePage` as an argument (this will be concatenated with the `baseUrl` defined in the `protractor.conf.js` file). If the relative URL changes, we just need to update it in a single place, which is the configuration file.
- When running the test's **actions** and **assertions** (from [arrange, **act**, **assert**](http://wiki.c2.com/?ArrangeActAssert)), the following structure is used:

```js
// 1st test
// Assert
expect(createImagePage.preview.image.getAttribute("src")).toEqual(imageUrlValue);

// 2nd test
// Act
beforeEach(() => helper.click(createImagePage.header.heading));

// 3rd test
// Assert
helper.waitForTextNotToBePresentInElement(createImagePage.form.nameField, data.name);
helper.waitForTextNotToBePresentInElement(createImagePage.form.descriptionField, data.description);
helper.waitForTextNotToBePresentInElement(createImagePage.form.imageUrlField, data.imageUrlValue);

// 4th test
// Act
helper.click(createImagePage.form.submitButton);
// Assert
expect(createImagePage.form.nameField.getCssValue("background-color")).toEqual("rgb(255,0,0)");
expect(createImagePage.form.descriptionField.getCssValue("background-color")).toEqual("rgb(255,0,0)");
expect(createImagePage.form.imageUrlField.getCssValue("background-color")).toEqual("rgb(255,0,0)");

// 5th test
// Act
createImagePage.form.fillWithDataAndSubmit(dataSetWithMissingImageUrl);
// Assert
expect(createImagePage.form.imageUrlField.getCssValue("background-color")).toEqual("rgb(255,0,0)");
```

Note how easy it becames to access the components, and its elements and method(s) from the Page Object.

Another example of an expectation, or **assertion**, could be something like this:

```js
expect(createImagePage.preview.title.getText()).toEqual("Preview");
```

This expectation tells Protractor the following: get the text of the `title` element that is contained in the `preview` Component of the `createImagePage` Page Object, and check if it is equal to a certain text (`"Preview"`).

> Note that the `protractor-helper` library is not used in the above example.

Another example of expectation, now using the `protractor-helper` library would look like this:

```js
helper.waitForTextToBePresentInElement(createImagePage.preview.title, "Preview");
```

Differently from the previous expectation, this one tells Protractor the following: wait for the text `"Preview"` to be present in the `title` element of the `preview` component, of the `createImagePage` Page Object.

> This is more like an implicit expectation since there is no `expect` keyword on it, but if the text is not present in the element after the default timeout (which by default is 5000 milliseconds), the test would still fail, meaning that it can still be used as an expectation.

## Conclusion

By writing tests using not only Page Objects but also the concept of Components, we can benefit from:
- Having smaller classes that are easier to read and maintain.
- We separate responsibilities, where Page Objects have only a relative URL and instances of the Components they are composed by, while Components define elements and methods.
- We have better defined elements, because we use the `_parentElement` when defining the child elements that will be used in the tests, making sure we will interact with the correct elements in cases of elements in the DOM with part of the same CSS selector, but in different parts of the application.
- We have more reliable test cases, because we define elements in a smarter way, but also because we use the `protractor-helper` library to interact with elements only when they are ready for interaction.
- Different Page Objects can share already existing Components without the need for code duplication.
- And in case we need we can even work with parent and child components, or with generic (or common) components, wherein the first case the parent component pass its `_parentElement` to the constructor of the child component, and wherein the second case the components that share common elements can use JavaScript inheritance (but these cases are not examplified here).

___

**Note: If you try to run the tests in this project they will all fail since the application under test doesn't really exist. This project was created only to explain the concepts of writing GUI E2E tests with Protractor using the concept of Page Objects and Components.**

___

Made with 💚 by [Walmyr Filho](https://walmyr.dev)
