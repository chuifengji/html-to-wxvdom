"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***
 * Copyright 2020 Ethan_Lv
 * @author Ethan_Lv ldlandchuifengji@gmail.com
 * @since 2020-05-06
 * @version 0.0.1
 * @desc tokenize.ts  State-Number:10 TokenType-Number:3
 * @attention parsing for comment and document type is not considered.
 * Fault tolerance is important,but unfortunately I have't added it yet.
 * I will do it in some time.
 * @reference html5parser by acrazing
 */
var TokenType;
(function (TokenType) {
    TokenType["Content"] = "Content";
    TokenType["StartTag"] = "StartTag";
    TokenType["EndTag"] = "EndTag";
})(TokenType || (TokenType = {}));
var Chars;
(function (Chars) {
    Chars[Chars["_S"] = " ".charCodeAt(0)] = "_S";
    Chars[Chars["Lt"] = "<".charCodeAt(0)] = "Lt";
    Chars[Chars["Sl"] = "/".charCodeAt(0)] = "Sl";
    Chars[Chars["Gt"] = ">".charCodeAt(0)] = "Gt";
    Chars[Chars["Qm"] = "?".charCodeAt(0)] = "Qm";
    Chars[Chars["La"] = "a".charCodeAt(0)] = "La";
    Chars[Chars["Lz"] = "z".charCodeAt(0)] = "Lz";
    Chars[Chars["Ua"] = "A".charCodeAt(0)] = "Ua";
    Chars[Chars["Uz"] = "Z".charCodeAt(0)] = "Uz";
    Chars[Chars["Eq"] = "=".charCodeAt(0)] = "Eq";
    Chars[Chars["Sq"] = "'".charCodeAt(0)] = "Sq";
    Chars[Chars["Dq"] = '"'.charCodeAt(0)] = "Dq";
})(Chars || (Chars = {}));
var state;
var buffer;
var bufSize;
var sectionStart; // the starting position of the token,not accurate.
var index; // the current location
var tokens; // parsed list of tokens
var char; // the unicode number of the character at the current parse position
var attrs; //the list of props being processed
var attrName;
var attrStart;
var tagName;
var tagStart; //the location of the property name being processed
var attrVaule; //the value of an attribute being processed
function clearVoidSpace(input) {
    return input.replace(/(?<=\>)[\s]+/g, "");
}
function clearComment(input) {
    return input;
}
function init(input) {
    clearVoidSpace(clearComment(input));
    state = State.defaultState;
    buffer = input;
    bufSize = input.length;
    sectionStart = 0;
    index = 0;
    char = 0;
    tokens = [];
    attrs = {};
}
var State;
(function (State) {
    State["defaultState"] = "defaultState";
    State["DataState"] = "DataState";
    State["TagOpenState"] = "TagOpenState";
    State["TagNameState"] = "TagNameState";
    State["BeforeAttributeNameState"] = "BeforeAttributeNameState";
    State["AttributeNameState"] = "AttributeNameState";
    State["BeforeAttributeValueState"] = "BeforeAttributeValueState";
    State["AttributeValueState"] = "AttributeValueState";
    State["AfterAttributeValueQuotedState"] = "AfterAttributeValueQuotedState";
    State["EndTagState"] = "EndTagState";
})(State || (State = {}));
var pushToken = function (type, start, end, selfClosing, attrs) {
    if (start === void 0) { start = sectionStart; }
    if (end === void 0) { end = index; }
    if (type === TokenType.StartTag) {
        if (tagName) {
            tokens.push({ start: start, end: end, type: type, tagName: tagName, selfClosing: selfClosing, attrs: attrs });
        }
        else {
            var tagName_1 = buffer.substring(start, end);
            tokens.push({ start: start, end: end, type: type, tagName: tagName_1, selfClosing: selfClosing, attrs: attrs });
        }
    }
    else if (type === TokenType.Content) {
        var content = buffer.substring(sectionStart, index);
        tokens.push({ start: start, end: end, type: type, content: content });
    }
    else {
        var tagName_2 = buffer.substring(start, end);
        tokens.push({ start: start, end: end, type: type, tagName: tagName_2 });
    }
};
var pushAttr = function (attrName, attrVaule) {
    attrs[attrName] = attrVaule;
};
var atdefaultState = function () {
    if (char === Chars.Lt) {
        state = State.TagOpenState;
    }
    else {
        sectionStart = index;
        state = State.DataState;
    }
};
var atDataState = function () {
    if (char === Chars.Lt) {
        pushToken(TokenType.Content, sectionStart, index);
        state = State.TagOpenState;
    }
    else if (char === Chars.Gt) {
        state = State.defaultState;
    }
    else {
        state = State.DataState;
    }
};
var atTagOpenState = function () {
    if (char >= Chars.Ua && char <= Chars.Lz) {
        sectionStart = index;
        tagStart = index;
        state = State.TagNameState;
    }
    else if (char === Chars.Sl) {
        if (buffer.charCodeAt(index - 1) != Chars.Lt) {
            pushToken(TokenType.StartTag, sectionStart, index, true, {});
        }
        state = State.EndTagState;
    }
};
var atTagNameState = function () {
    if (char >= Chars.Ua && char <= Chars.Lz) {
        state = State.TagNameState;
    }
    else if (char === Chars.Sl) {
        pushToken(TokenType.StartTag, sectionStart, index, true, {});
        state = State.defaultState;
        index = index + 1;
    }
    else if (char === Chars.Gt && buffer.charCodeAt(index - 1) != Chars.Sl) {
        pushToken(TokenType.StartTag, sectionStart, index, false, {});
        state = State.defaultState;
    }
    else if (char === Chars._S) {
        tagName = buffer.substring(tagStart, index);
        state = State.BeforeAttributeNameState;
    }
};
var atBeforeAttributeNameState = function () {
    if (char === Chars._S) {
        state = State.BeforeAttributeNameState;
    }
    else if (char >= Chars.Ua && char <= Chars.Lz) {
        state = State.AttributeNameState;
        attrStart = index;
    }
};
var atAttributeNameState = function () {
    if (char >= Chars.Ua && char <= Chars.Lz) {
        state = State.AttributeNameState;
    }
    else if ((char = Chars.Eq)) {
        attrName = buffer.substring(attrStart, index);
        state = State.BeforeAttributeValueState;
    }
};
var atBeforeAttributeValueState = function () {
    if (char === Chars.Dq || char === Chars.Sq) {
        attrStart = index + 1;
        state = State.AttributeValueState;
    }
};
var atAttributeValueState = function () {
    if (char === Chars.Dq || char === Chars.Sq) {
        attrVaule = buffer.substring(attrStart, index);
        pushAttr(attrName, attrVaule);
        state = State.AfterAttributeValueQuotedState;
    }
    else {
        state = State.AttributeValueState;
    }
};
var atAfterAttributeValueQuotedState = function () {
    if (char === Chars._S) {
        state = State.AfterAttributeValueQuotedState;
    }
    else if (char >= Chars.Ua && char <= Chars.Lz) {
        attrStart = index;
        state = State.AttributeNameState;
    }
    else if (char === Chars.Gt) {
        pushToken(TokenType.StartTag, sectionStart, index, false, attrs);
        state = State.defaultState;
        attrs = {};
        tagName = "";
    }
    else if (char === Chars.Sl) {
        state = State.EndTagState;
    }
};
var atEndTagState = function () {
    if (char >= Chars.Ua && char <= Chars.Lz) {
        if (buffer.charCodeAt(index - 1) === Chars.Sl) {
            sectionStart = index;
        }
        state = State.EndTagState;
    }
    else if (char === Chars.Gt) {
        if (buffer.charCodeAt(index - 1) === Chars.Sl) {
            pushToken(TokenType.StartTag, sectionStart, index, true, {});
        }
        else {
            pushToken(TokenType.EndTag, sectionStart, index);
        }
        state = State.defaultState;
    }
};
var unexpected = function () {
    throw new SyntaxError("Unexpected token \"" + buffer.charAt(index) + "\" at " + index + " when parse " + state);
};
function tokenize(input) {
    init(input);
    while (index < bufSize) {
        char = buffer.charCodeAt(index);
        switch (state) {
            case State.defaultState:
                atdefaultState();
                break;
            case State.TagOpenState:
                atTagOpenState();
                break;
            case State.TagNameState:
                atTagNameState();
                break;
            case State.BeforeAttributeNameState:
                atBeforeAttributeNameState();
                break;
            case State.AttributeNameState:
                atAttributeNameState();
                break;
            case State.BeforeAttributeValueState:
                atBeforeAttributeValueState();
                break;
            case State.AttributeValueState:
                atAttributeValueState();
                break;
            case State.AfterAttributeValueQuotedState:
                atAfterAttributeValueQuotedState();
                break;
            case State.EndTagState:
                atEndTagState();
                break;
            case State.DataState:
                atDataState();
                break;
            default:
                unexpected();
                break;
        }
        index++;
    }
    return tokens;
}
exports.tokenize = tokenize;
console.log(tokenize("<div title=\"\u8868\u683C\" class=\"wxml_editor_icon\" id=\"wxml_editor_table\"><i class=\"iconfont iconbiaoge icon_font_size\"></i><br/></div>\n<div title=\"\u9996\u884C\u7F29\u8FDB\" class=\"wxml_editor_icon\" id=\"wxml_editor_indent\"><i class=\"iconfont iconshouhangsuojin icon_font_size\"></i></div>"));
