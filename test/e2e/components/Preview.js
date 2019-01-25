class Preview {
  constructor() {
    this._parentElement = element(by.css(".preview"));

    this._title = this._parentElement.element(by.css("h1"));
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
