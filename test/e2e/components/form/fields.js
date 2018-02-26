class Fields {
    constructor(parentElement) {
        this.container = parentElement.element(by.className("fields"));

        this.name = this.container.element(by.id("name"));
        this.message = this.container.element(by.id("message"));
    }
}

module.exports = Fields;
