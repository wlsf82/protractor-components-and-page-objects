class Buttons {
    constructor(parentElement) {
        this.container = parentElement.element(by.className("actions"));

        this.cancel = this.container.element(by.className("cancel-button"));
        this.submit = this.container.element(by.css("input[type='submit']"));
    }
}

module.exports = Buttons;
