"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokensTest = [
    {
        start: 1,
        end: 63,
        type: "StartTag",
        tagName: "div",
        selfClosing: false,
        attrs: {
            title: "表格",
            class: "wxml_editor_icon",
            id: "wxml_editor_table",
        },
    },
    {
        start: 65,
        end: 109,
        type: "StartTag",
        tagName: "i",
        selfClosing: false,
        attrs: { class: "iconfont iconbiaoge icon_font_size" },
    },
    { start: 112, end: 113, type: "EndTag", tagName: "i" },
    {
        start: 115,
        end: 117,
        type: "StartTag",
        tagName: "br",
        selfClosing: true,
        attrs: {},
    },
    { start: 121, end: 124, type: "EndTag", tagName: "div" },
];
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
            //栈为空
            if (element.type === "Content") {
                //文本类型
                var item = { type: element.type, text: element.content };
                OutPutStack.addElement(item);
            }
            else if (element.selfClosing) {
                //自闭合类型
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                OutPutStack.addElement(item);
            }
            else {
                //正常起始标签
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.addElement(item);
            }
            //栈不为空
        }
        else {
            if (element.type === "Content") {
                //是文本标签
                var item = { type: element.type, text: element.content };
                MytokenStack.changePrev(item);
                // console.log(MytokenStack.getFirst());
            }
            else if (element.selfClosing) {
                //是自闭合标签
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.changePrevSelf(item);
                // MytokenStack.changePrev(item);
            }
            else if (
            //是前一个标签的闭合标签
            element.type === "EndTag" &&
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
                    //   console.log(MytokenStack.size());
                }
                else {
                    OutPutStack.addElement(MytokenStack.getFirst());
                }
            }
            else {
                //啥也不是
                var item = {
                    name: element.tagName,
                    attrs: element.attrs,
                    children: [],
                };
                MytokenStack.addElement(item);
                // console.log(JSON.stringify(MytokenStack.getAll()));
            }
        }
    });
    return OutPutStack.getAll();
};
console.log(JSON.stringify(parser(tokensTest)));
