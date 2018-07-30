# Protractor components and page objects

This sample project intends to demonstrate an architecture proposal for writing GUI tests with [Protractor](http://www.protractortest.org/#/) using a concept of components.

## The inspiration

In October, 2017 I went to Berlin for the SeleniumConf and I watched a presentation by Archit Pal Singh Sachdeva, Software Engineer at Facebook, about [readable, stable and maintainable E2E testing](https://www.seleniumconf.de/talks#archit-pal-singh-sachdeva), and this presentation made me re-think on how GUI E2E tests are written, where the main solution for code organization and maintainability is usually the use of the [Page Objects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) pattern.
But what about using Page Objects together with test components?

## The project structure

Ok, but what would be a test component and how does it work in terms of E2E test creation?

Alright, let's imagine a simple web page like this:

```
-----------------------------------
|              Contact            |
|                                 |
|  Name:    [         ]           |
|  Message: -------------         |
|           |           |         |
|           |           |         |
|           -------------         |
|                                 |
|               [Cancel] [Submit] |
-----------------------------------
```

Now, let's say this page is composed by a form component, with a header element (Contact), one input field element (Name), one text area field (Message), and two button elements (Cancel and Submit).

Ok, but you may be asking yourself, what is the difference between creating E2E tests using Page Objects and Components when comparing to the usage of only Page Objects?

Let's see.

### Page object definition

A Page Object is defined by a relative URL and one or more components. In our case, the `Contact` Page Object would look like this:

```js
// test/e2e/page-objects/contact.js

const FormComponent = require("../components/form/main");

class Contact {
    constructor() {
        this.relativeUrl = "contact";

        this.form = new FormComponent();
    }
}

module.exports = Contact;
```

Note that it starts requiring the `FormComponent` in the beginning and the class itself has only two attributes in the constructor, a `relativeUrl` with a string as value and a `form`, as an instance of the `FormComponent`.

In other words, the page object has no definition of the elements themselves, it just instantiates the component(s) that compose the page, which makes the code simple and separates better the responsibilities.

### Form component definition

Now let's examine the `FormComponent`.

```js
// test/e2e/components/form/main.js

const helper = require("protractor-helper");

class Form {
    constructor() {
        this.container = element(by.css("form"));

        this.header = this.container.element(by.css("header h1"));
        this.nameField = this.container.element(by.css(".fields #name"));
        this.messageField = this.container.element(by.css(".fields #message"));
        this.cancelButton = this.container.element(by.css(".actions .cancel-button"));
        this.submitButton = this.container.element(by.css(".actions input[type='submit']"));
    }

    fillWithDataAndSubmit(data) {
        helper.fillFieldWithTextWhenVisible(this.nameField, data.name);
        helper.fillFieldWithTextWhenVisible(this.messageField, data.message);
        helper.clickWhenClickable(this.submitButton);
    }
}

module.exports = Form;
```

First of all, the `Form` component requires an external library ([`protractor-helper`](http://npmjs.com/package/protractor-helper)). This will be used in the component's method `fillWithDataAndSubmit` to interact with the elements only when they are ready for it.

Then, differently of the Page Object, instead of having as first attribute of the constructor a relative URL, it has a `container` element, which in this case is a `form`. This `container` is used in the definition of any other element of this component, to ensure that the elements are the right ones, meaning that in the DOM the elements are inside their parent element (the `container` element).

As you can see, all other elements (`header`, `nameField`, `messageField`, `cancelButton` and `submitButton` are defined based on their parent (the `container` element)).

And finally, it defines the `fillWithDataAndSubmit` method, that receives a `data` object as an argument and uses this data for filling the form with and submitting it.

The `fillWithDataAndSubmit` method uses the `helper` defined in the beginning of the file to ensure that it will interact with the elements only when they are ready for it, as previously mentioned.

> By using this practice we give the component the responsibilities of defining the elements and methods, nothing else.

___

> Page Object and components are exported with `module.exports` to expose their APIs for usage, on tests, for example.

Now let's see how a test file would look like.

### Test definition

```js
// test/e2e/specs/contact.spec.js

const helper = require("protractor-helper");

const ContactPage = require("../page-objects/contact");

describe("given I access the relative URL 'contact'", () => {
    const contactPage = new ContactPage();

    beforeEach(() => browser.get(contactPage.relativeUrl));

    describe("happy path", () => {
        describe("when I submit the form with valid data", () => {
            it("then all fields are cleared and a success message is shown", () => {
                const data = {
                    name: "John",
                    message: "Just an example message"
                };

                contactPage.form.fillWithDataAndSubmit(data);

                expect(contactPage.nameField.getText()).toEqual("");
                expect(contactPage.messageField.getText()).toEqual("");

                const successMessage = element(by.css(".success-message"));

                expect(successMessage.isDisplayed()).toBe(true);
            });
        });
    });

    describe("alternate paths", () => {
        describe("when I submit the form without filling name and message", () => {
            it("then all required fields are shown in red, meaning error", () => {
                helper.clickWhenClickable(contactPage.form.submitButton);

                expect(contactPage.nameField.getAttribute("warning-color")).toEqual("red");
                expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");
            });
        });

        describe("when I submit the form with a name but a missing message", () => {
            it("then the required field (message) is shown in red, meaning error", () => {
                const invalidDataSet = {
                    name: "Josh",
                    message: ""
                };

                contactPage.form.fillWithDataAndSubmit(invalidDataSet);

                expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");
            });
        });
    });
});
```

In the test file it's worth paying attention to some things.

- Only the page object is required at the top of the file. There is no need to require the component since it is already available through the Page Object.
- When running the `browser.get()` in the `beforeEach` statement we pass the `relativeUrl` of the `contactPage` as argument (this will be concatenated with the `baseUrl` defined in the `protractor.conf.js` file). If this relative URL changes, we need to update it only in a single place.
- When running the test's **actions** and **assertions** (from arrange, **act**, **assert**), the following structure is used:

```js
// 1st test
// Act
contactPage.form.fillWithDataAndSubmit(data);
// Assert
expect(contactPage.nameField.getText()).toEqual("");
expect(contactPage.messageField.getText()).toEqual("");

// 2nd test
// Act
helper.clickWhenClickable(contactPage.form.submitButton);
// Assert
expect(contactPage.nameField.getAttribute("warning-color")).toEqual("red");
expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");

// 3rd test
// Act
contactPage.form.fillWithDataAndSubmit(invalidDataSet);
// Assert
expect(contactPage.messageField.getAttribute("warning-color")).toEqual("red");
```

Note how easy it becames to access the components, and its elements and method(s) from the Page Object.

Another example of an expectation, or **assertion** could be something like this:

```js
expect(contactPage.form.header.getText()).toEqual("Contact");
```

This expectation tells Protractor the following: get the text of the `header` element that is contained in the `form` component of the `contactPage` Page Object, and check if it is equal to a certain text ("Contact").

> Note that the `protractor-helper` library is not used in the above example.

Another example of expectation, now using the `protractor-helper` library could look like this:

```js
helper.waitForTextToBePresentInElement(contactPage.form.header, "Contact");
```

Differently from the previous expectation, this one tells Protractor the following: wait for the text "Contact" to be present in the `header` element of the `form` component, of the `contactPage` page object.

## Conclusion

By writing tests using not only Page Objects but also the concept of test components, we can benefit from:
- having smaller classes that are easier to read and maintain.
- we separate responsibilities, where Page Objects have only a relative URL and instances of the components they are composed by, while components define elements and methods.
- we have better defined elements, because we use the container element as parent element when defining the elements that will be used in the tests, making sure we will interact with the correct elements in cases of elements with the same CSS selector, but in different parts of the application.
- we have more reliable test cases, because with define elements in a smarter way, but also because we use the `protractor-helper` library to interact with elements only when they are ready for it.
- different page objects can share already existing test components without the need for code duplication.
- and in case we need we can even work with parent and child components.

___

**Note: if you try to run the tests in this project they will all fail since the application under test doesn't really exist. This project was created only to explain the concepts of writing GUI E2E tests with Protractor using the concept of components.**
