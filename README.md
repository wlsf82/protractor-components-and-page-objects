# Protractor components and page objects

This sample project intends to demonstrate an architecture proposal for writing GUI tests with [Protractor](http://www.protractortest.org/#/) using a concept of components.

## The inspiration

In October, 2017 I went to Berlin for the SeleniumConf and I watched a presentation by Archit Pal Singh Sachdeva, Software Engineer at Facebook, about [readable, stable and maintainable E2E testing](https://www.seleniumconf.de/talks#archit-pal-singh-sachdeva), and this presentation made me re-think on how GUI E2E tests are written, where the main solution for code organization and maitainability is usually the use of the [Page Objects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) pattern.
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

Now let's try to think on different components that compose this page.

Firstly we can say that the whole page is the main or parent component. It could be called the form component in this context.

Then we have three sub-components: the header, the fieldset, and the actions.

The header sub-component has only the title (Contact) and it could be an h1 tag for example.

The fieldset component contains two elements. An input field (Name) and a text area field (Message).

And the actions component contains two elements as well, the Cancel and Submit buttons.

Ok, now that we have separated our web page in a parent and sub-components, and that our sub-components contain their elements, how differently than creating E2E with Page Objects only would it be?

We will still use Page Objects, but they will be simpler than we are used to.

### Page object definition

A Page Object is defined by a relative URL and one or more components. In our case, the `ContactPage` page object would look like this:

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

Note that it starts requiring the `FormComponent` and the class itself has only a `relativeUrl` and a `form` attributes, the first with a string and the second as an instance of the `FormComponent`.

### Form component definition

Now let's examine the `FormComponent`.

```js
// test/e2e/components/form/main.js

const helper = require("protractor-helper");

const ButtonsComponent = require("./buttons");
const FieldsComponent = require("./fields");
const HeaderComponent = require("./header");

class Form {
    constructor() {
        this.container = element(by.css("form"));

        this.buttons = new ButtonsComponent(this.container);
        this.fields = new FieldsComponent(this.container);
        this.header = new HeaderComponent(this.container);
    }

    fillWithDataAndSubmit(data) {
        helper.fillFieldWithTextWhenVisible(this.fields.name, data.name);
        helper.fillFieldWithTextWhenVisible(this.fields.message, data.message);
        helper.clickWhenClickable(this.buttons.submit);
    }
}

module.exports = Form;
```

First of all, the `Form` component requires an external library (`protractor-helper`). This will be used in a component's method.

The `Form` component also requires its sub-components (`ButtonsComponent`, `HeaderComponent` and `FieldsComponent`) in the beginning.

Then, differently of the page object, instead of having as first attribute a relative URL it has a `container` element, which in this case is a `form`.

After that it instantiates its sub-components (`buttons`, `header` and `fields`).

> Note that differently of the instance of the `FormComponent` in the page object, when instantiating the sub-components it pass its `container` as argument to each sub-component constructor. This helps in the creation of stable tests, where we're sure that the elements we are interacting with or running expectations on are the correct ones.

And finally it defines the `fillWithDataAndSubmit` method, that receives a `data` object as argument and uses this data for filling the form with and submitting it.

The `fillWithDataAndSubmit` method uses the `helper` defined in the beginning of the file to ensure it will interact with the elements only when they are ready for it.

> Note that for clicking in the submit button, for example, it uses the following structure as argument of the `helper.clickWhenClickable` method: `this.buttons.submit`, which means, clicks in the `submit` button from the `buttons` sub-component.

Now that we understood how the main or parent component works, let's dive into each of the sub-components.

### Buttons component definition

```js
// test/e2e/components/form/buttons.js

class Buttons {
    constructor(parentElement) {
        this.container = parentElement.element(by.className("actions"));

        this.cancel = this.container.element(by.className("cancel-button"));
        this.submit = this.container.element(by.css("input[type='submit']"));
    }
}

module.exports = Buttons;
```

Since the parent element pass to it its `container`, the `constructor` of the `Buttons` component expects a `parentElement` as parameter.

Then, for the creation of its `container` it uses the `parentElement` (`parentElement.element(by.className("actions"));`)

And finally it defines its own elements, based on its own `container`.

### Fields component definition

```js
// test/e2e/components/form/fields.js

class Fields {
    constructor(parentElement) {
        this.container = parentElement.element(by.className("fields"));

        this.name = this.container.element(by.id("name"));
        this.message = this.container.element(by.id("message"));
    }
}

module.exports = Fields;
```

The same applies to the `Fields` component in terms of the `parentElement` as parameter of the `constructor` and in the creation of its own `container`.

And then we see the definition of its own elements, the `name` and `message` fields.

### Header component definition

```js
// test/e2e/components/form/header.js

class Header {
    constructor(parentElement) {
        this.container = parentElement.element(by.css("header"));

        this.heading = this.container.element(by.css("h1"));
    }
}

module.exports = Header;
```

The same applies to the `Header` component in terms of the `parentElement` as parameter of the `constructor` and in the creation of its own `container`.

And finally it defines a `heading` element, based on its own `container`.

> All of them, page object and components, are exported with `module.exports` to be used in the tests themselves.

Now let's see how a test file would look like.

### Test definition

```js
// test/e2e/specs/contact.spec.js

const helper = require("protractor-helper");

const ContactPage = require("../page-objects/contact");

describe("when accessing the relative URL 'contact'", () => {
    const contactPage = new ContactPage();

    beforeEach(() => browser.get(contactPage.relativeUrl));

    describe("happy path", () => {
        describe("when submitting the form with valid data", () => {
            it("cleans the fields and show a success message", () => {
                const data = {
                    name: "John",
                    message: "Just an example message"
                };

                contactPage.form.fillWithDataAndSubmit(data);

                // @TODO: add expectations
            });
        });
    });

    describe("alternate paths", () => {
        describe("when submitting the form without filling name and message", () => {
            it("shows required fields in red, meaning error", () => {
                helper.clickWhenClickable(contactPage.form.buttons.submit);

                // @TODO: add expectations
            });
        });

        describe("when submitting the form with name but missing message", () => {
            it("shows required field (message) in red, meaning error", () => {
                const invalidDataSet = {
                    name: "Josh",
                    message: ""
                };

                contactPage.form.fillWithDataAndSubmit(invalidDataSet);

                // @TODO: add expectations
            });
        });
    });
});
```

In the test file it's interesting to pay more attention at some new things, different than when using only page objects.

- Only the page object is required at the top of the file. There is no need to require the components since they are already available through the page object, but this doesn't mean you can't require components, but in this case the page object is enough.
- When running the `browser.get()` in the `beforeEach` statement the `relativeUrl` of the `contactPage` is used (this will be concatenated with the `baseUrl` defined in the `protractor.conf.js` file).
- When running the test's **actions** (from arrange, **act**, assert), the following structure is used:

```js
// 1st test
contactPage.form.fillWithDataAndSubmit(data);

// 2nd test
helper.clickWhenClickable(contactPage.form.buttons.submit);

// 3rd test
contactPage.form.fillWithDataAndSubmit(invalidDataSet);
```

Note how easy it became to access the page object's components, sub-components and its elements.

An example of an expectation, not using the `protractor-helper`, could be something like this:

```js
expect(contactPage.form.header.heading.getText()).toEqual("Contact");
```

This expectation tells to Protractor the follwing: get the text of the `heading` element that is contained in the `header` sub-component of the `form` parent component of the `contactPage` page object.

## Conclusion

By writing tests using not only page objects, but also the concept of test components, we can benefit of:
- smaller classes that are easier to read and maintain
- well defined web elements, since we pass the containers of the parent components to the constructor of the sub-components, making sure we will interact with the correct elements in cases of elements with the same css selector structure but in different parts of the application
- more reliable test cases

___

**Note: if you try to run the tests in this project they will all fail since the application under test doesn't really exist. This project was created only to explain the concepts of writing GUI E2E tests with Protractor using the concept of components.**
