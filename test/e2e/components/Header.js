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
