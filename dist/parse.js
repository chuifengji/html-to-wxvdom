"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenStack = /** @class */ (function () {
    function tokenStack(capacity) {
        this.elements = [];
        this._size = capacity;
    }
    tokenStack.prototype.addElement = function (element) {
        if (element == null) {
            return false;
        }
        if (this._size != undefined && !isNaN(this._size)) {
            if (this.elements.length == this._size) {
                this.removeElement();
            }
        }
        this.elements.push(element);
        return true;
    };
    tokenStack.prototype.removeElement = function () {
        return this.elements.pop();
    };
    tokenStack.prototype.size = function () {
        return this.elements.length;
    };
    tokenStack.prototype.isempty = function () {
        return this.size() == 0;
    };
    tokenStack.prototype.getFirst = function () {
        return this.elements[this.size() - 1];
    };
    tokenStack.prototype.changePrev = function (item) {
        if (item != null) {
            this.elements[this.size() - 2].children.push(item);
        }
    };
    tokenStack.prototype.changePrevSelf = function (item) {
        if (item != null) {
            this.elements[this.size() - 1].children.push(item);
        }
    };
    tokenStack.prototype.clear = function () {
        delete this.elements;
        this.elements = [];
    };
    tokenStack.prototype.getAll = function () {
        return this.elements;
    };
    return tokenStack;
}());
exports.tokenStack = tokenStack;
var parser = function (TOKENS) {
    var MytokenStack = new tokenStack();
    var OutPutStack = new tokenStack();
    TOKENS.forEach(function (element) {
        if (MytokenStack.isempty()) {
            if (element.type === "Content") {
                var item = { type: element.type, text: element.content };
                OutPutStack.addElement(item);
            }
            else if (element.selfClosing) {
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                OutPutStack.addElement(item);
            }
            else {
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.addElement(item);
            }
        }
        else {
            if (element.type === "Content") {
                var item = { type: element.type, text: element.content };
                MytokenStack.changePrev(item);
            }
            else if (element.selfClosing) {
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.changePrevSelf(item);
            }
            else if (element.type === "EndTag" &&
                element.tagName === MytokenStack.getFirst().name) {
                if (MytokenStack.size() >= 2) {
                    var element_1 = MytokenStack.getFirst();
                    var item = {
                        name: element_1.name,
                        attrs: element_1.attrs,
                        children: element_1.children,
                    };
                    MytokenStack.changePrev(item);
                    MytokenStack.removeElement();
                }
                else {
                    OutPutStack.addElement(MytokenStack.getFirst());
                }
            }
            else {
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.addElement(item);
            }
        }
    });
    return OutPutStack.getAll();
};
