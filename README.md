# Protractor components and page objects

This sample project intends to demonstrate an architecture proposal for writing GUI tests with [Protractor](http://www.protractortest.org/#/) using a concept of components.

## The inspiration

In October, 2017 I went to Berlin for the SeleniumConf and I watched a presentation by Archit Pal Singh Sachdeva, Software Engineer at Facebook, about [readable, stable and maintainable E2E testing](https://www.seleniumconf.de/talks#archit-pal-singh-sachdeva), and this presentation made me re-think on how GUI E2E tests are written, where the main solution for code organization and maintainability is usually the use of the [Page Objects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) pattern.
But what about using Page Objects together with test components?

## The project structure

Ok, but what would be a test component and how does it work in terms of E2E test creation?

Alright, let's imagine a simple web page like this:

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

Now, let's imagine that this page is composed by two main components, the form component, and the preview component.
The form component contain five elements, three input fields (Name, Description, and Image URL), and two buttons (Cancel and Submit), and the preview component contain two elements, a title (Preview), which is a heading, and a preview image.

Ok, but you may be asking yourself, what is the difference between creating E2E tests using Page Objects and Components when comparing to the usage of only Page Objects?

Let's see.

### Page object definition

A Page Object is defined by a relative URL, and one or more components. In this case, the `CreateImage` Page Object would look like this:

```js
// test/e2e/page-objects/CreateImage.js

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
```

Note that it starts requiring the `FormComponent` and the `PreviewComponent` in the beginning, and the class itself has only three attributes in the constructor, a `relativeUrl` with a string as value (`"/create-image"`), a `form`, as an instance of the `FormComponent`, and a `preview`, as an instance of the `PreviewComponent`.

In other words, the page object has no definition of the elements themselves, it just instantiates the component(s) that compose the page, which makes the code simple and separates better the responsibilities.

### Form component definition

Now let's examine the `FormComponent`.

```js
// test/e2e/components/Form.js

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
```

First of all, the `Form` component requires an external library ([`protractor-helper`](http://npmjs.com/package/protractor-helper)). This library will be used in the component's method `fillWithDataAndSubmit` to interact with the elements only when they are ready for it.

Then, differently of the Page Object, instead of having as first attribute of the constructor a relative URL, it has a `container` element, which in this case is a `form`. This `container` is used in the definition of any other element of this component, and this is done to ensure that the elements are the right ones, meaning that in the DOM the elements are inside their parent element (the `container` element).

As you can see, all other elements (`nameField`, `descriptionField`, `imageUrlField`, `cancelButton`, and `submitButton` are defined based on their parent element (the `container`)).

And finally, it defines the `fillWithDataAndSubmit` method, that receives a `data` object as an argument, and uses this data for filling the form with and submitting it.

The `fillWithDataAndSubmit` method uses the `helper` defined in the beginning of the file to ensure that it will interact with the elements only when they are ready for it, as previously mentioned.

And now let's examine the `PreviewComponent`.

```js
// test/e2e/components/Preview.js

class Preview {
    constructor() {
        this.container = element(by.css(".preview"));

        this.title = this.container.element(by.css("h1"));
        this.image = this.container.element(by.css("img"));
    }
}

module.exports = Preview;
```

The `Preview` component is a simpler one. As the `Form` component, it also defines a `container` element, for the same reason, and then it defines two other elements, `title`, and `image`, both based on the parent element (the `container`).

> By using this practice we give the components the responsibilities of defining the elements and methods, and nothing else.

___

> Page Objects and components are exported with `module.exports` to expose their APIs for usage, on tests, for example.

Now let's see how a test file would look like.

### Test definition

```js
// test/e2e/specs/createImage.spec.js

const helper = require("protractor-helper");

const CreateImagePage = require("../page-objects/CreateImage");

describe("given I access the relative URL '/create-image'", () => {
    const createImagePage = new CreateImagePage();

    beforeEach(() => browser.get(createImagePage.relativeUrl));

    describe("happy path", () => {
        describe("when filling the image url field with a valid url", () => {
            const imageUrl = "http://example.com/some-image.png";

            beforeEach(() => helper.fillFieldWithTextWhenVisible(createImagePage.form.imageUrlField, imageUrl));

            it("then the image preview element uses the provided value in the 'src' attribute", () => {
                expect(createImagePage.preview.image.getAttribute("src")).toEqual(imageUrl);
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

                expect(createImagePage.form.nameField.getAttribute("warning-color")).toEqual("red");
                expect(createImagePage.form.descriptionField.getAttribute("warning-color")).toEqual("red");
                expect(createImagePage.form.imageUrlField.getAttribute("warning-color")).toEqual("red");
            });
        });

        describe("when I submit the form with a name and description, but a missing image url", () => {
            it("then the required field (image url) is shown in red, meaning error", () => {
                const dataSetWithMissingImageUrl = {
                    name: "Boo",
                    description: "The nicest girl. From Monters Inc."
                };

                createImagePage.form.fillWithDataAndSubmit(dataSetWithMissingImageUrl);

                expect(createImagePage.form.imageUrlField.getAttribute("warning-color")).toEqual("red");
            });
        });
    });
});
```

In the test file it's worth paying attention to some things.

- Only the page object is required at the top of the file. There is no need to require the components since they are already available through the Page Object.
- When running the `browser.get()` in the `beforeEach` statement we pass the `relativeUrl` of the `createImagePage` as argument (this will be concatenated with the `baseUrl` defined in the `protractor.conf.js` file). If this relative URL changes, we just need to update it in a single place.
- When running the test's **actions** and **assertions** (from [arrange, **act**, **assert**](http://wiki.c2.com/?ArrangeActAssert)), the following structure is used:

```js
// 1st test
// Assert
expect(createImagePage.preview.image.getAttribute("src")).toEqual(imageUrl);

// 2nd test
// Assert
expect(createImagePage.form.nameField.getText()).toEqual("");
expect(createImagePage.form.descriptionField.getText()).toEqual("");
expect(createImagePage.form.imageUrlField.getText()).toEqual("");

// 3rd test
// Act
helper.clickWhenClickable(createImagePage.form.submitButton);
// Assert
expect(createImagePage.form.nameField.getAttribute("warning-color")).toEqual("red");
expect(createImagePage.form.descriptionField.getAttribute("warning-color")).toEqual("red");
expect(createImagePage.form.imageUrlField.getAttribute("warning-color")).toEqual("red");

// 4th test
// Act
createImagePage.form.fillWithDataAndSubmit(dataSetWithMissingImageUrl);
// Assert
expect(createImagePage.form.imageUrlField.getAttribute("warning-color")).toEqual("red");
```

Note how easy it becames to access the components, and its elements and method(s) from the Page Object.

Another example of an expectation, or **assertion**, could be something like this:

```js
expect(createImagePage.preview.title.getText()).toEqual("Preview");
```

This expectation tells Protractor the following: get the text of the `title` element that is contained in the `preview` component of the `createImagePage` Page Object, and check if it is equal to a certain text (`"Preview"`).

> Note that the `protractor-helper` library is not used in the above example.

Another example of expectation, now using the `protractor-helper` library woule look like this:

```js
helper.waitForTextToBePresentInElement(createImagePage.preview.title, "Preview");
```

Differently from the previous expectation, this one tells Protractor the following: wait for the text `"Preview"` to be present in the `title` element of the `preview` component, of the `createImagePage` page object.

> This is more like an implicit expectation since there is not `expect` on it, but if the text is not present in the element after the default timeout, the test would still fail, which means that it can still be used as an expectation.

## Conclusion

By writing tests using not only Page Objects but also the concept of test components, we can benefit from:
- having smaller classes that are easier to read and maintain.
- we separate responsibilities, where Page Objects have only a relative URL and instances of the components they are composed by, while components define elements and methods.
- we have better defined elements, because we use the container element as parent element when defining the child elements that will be used in the tests, making sure we will interact with the correct elements in cases of elements with the same CSS selector, but in different parts of the application.
- we have more reliable test cases, because we define elements in a smarter way, but also because we use the `protractor-helper` library to interact with elements only when they are ready for it.
- different page objects can share already existing test components without the need for code duplication.
- and in case we need we can even work with parent and child components (but this is not examplified here).

___

**Note: if you try to run the tests in this project they will all fail since the application under test doesn't really exist. This project was created only to explain the concepts of writing GUI E2E tests with Protractor using the concept of components.**

___

Made with 💚 by [Walmyr Filho](http://walmyr-filho.com)
