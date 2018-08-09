class Preview {
    constructor() {
        this.container = element(by.css(".preview"));

        this.title = this.container.element(by.css("h1"));
        this.image = this.container.element(by.css("img"));
    }
}

module.exports = Preview;
