class Header {
    constructor(parentElement) {
        this.container = parentElement.element(by.css("header"));

        this.heading = this.container.element(by.css("h1"));
    }
}

module.exports = Header;
