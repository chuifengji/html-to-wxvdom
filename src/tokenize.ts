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
enum TokenType {
  Content = "Content",
  StartTag = "StartTag", //self-closing tag is also belong to it
  EndTag = "EndTag",
}
enum Chars {
  _S = " ".charCodeAt(0),
  Lt = "<".charCodeAt(0),
  Sl = "/".charCodeAt(0),
  Gt = ">".charCodeAt(0),
  Qm = "?".charCodeAt(0),
  La = "a".charCodeAt(0),
  Lz = "z".charCodeAt(0),
  Ua = "A".charCodeAt(0),
  Uz = "Z".charCodeAt(0),
  Eq = "=".charCodeAt(0),
  Sq = "'".charCodeAt(0),
  Dq = '"'.charCodeAt(0),
}
interface TokenBase {
  start: number;
  end: number;
  type: TokenType;
}
interface TokenTag extends TokenBase {
  tagName: string;
}
interface TokenContent extends TokenBase {
  content: string;
}
interface TokenST extends TokenBase {
  attrs: any;
  selfClosing: boolean; //whether the label is self-closing
}
let state: State;
let buffer: string;
let bufSize: number;
let sectionStart: number; // the starting position of the token,not accurate.
let index: number; // the current location
let tokens: (TokenST | TokenTag | TokenContent)[]; // parsed list of tokens
let char: number; // the unicode number of the character at the current parse position
let attrs: any; //the list of props being processed
let attrName: string;
let attrStart: number;
let tagName: string;
let tagStart: number; //the location of the property name being processed
let attrVaule: string; //the value of an attribute being processed
function clearVoidSpace(input: string) {
  return input.replace(/(?<=\>)[\s]+/g, "");
}
function clearComment(input: string) {
  return input;
}
function init(input: string) {
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
enum State {
  defaultState = "defaultState",
  DataState = "DataState",
  TagOpenState = "TagOpenState",
  TagNameState = "TagNameState",
  BeforeAttributeNameState = "BeforeAttributeNameState",
  AttributeNameState = "AttributeNameState",
  BeforeAttributeValueState = "BeforeAttributeValueState",
  AttributeValueState = "AttributeValueState",
  AfterAttributeValueQuotedState = "AfterAttributeValueQuotedState",
  EndTagState = "EndTagState",
}
let pushToken = function (
  type: TokenType,
  start = sectionStart,
  end = index,
  selfClosing?: boolean,
  attrs?: any
) {
  if (type === TokenType.StartTag) {
    if (tagName) {
      tokens.push({ start, end, type, tagName, selfClosing, attrs });
    } else {
      let tagName = buffer.substring(start, end);
      tokens.push({ start, end, type, tagName, selfClosing, attrs });
    }
  } else if (type === TokenType.Content) {
    let content = buffer.substring(sectionStart, index);
    tokens.push({ start, end, type, content });
  } else {
    let tagName = buffer.substring(start, end);
    tokens.push({ start, end, type, tagName });
  }
};
let pushAttr = function (attrName: string, attrVaule: string) {
  attrs[attrName] = attrVaule;
};
let atdefaultState = function () {
  if (char === Chars.Lt) {
    state = State.TagOpenState;
  } else {
    sectionStart = index;
    state = State.DataState;
  }
};
let atDataState = function () {
  if (char === Chars.Lt) {
    pushToken(TokenType.Content, sectionStart, index);
    state = State.TagOpenState;
  } else if (char === Chars.Gt) {
    state = State.defaultState;
  } else {
    state = State.DataState;
  }
};
let atTagOpenState = function () {
  if (char >= Chars.Ua && char <= Chars.Lz) {
    sectionStart = index;
    tagStart = index;
    state = State.TagNameState;
  } else if (char === Chars.Sl) {
    if (buffer.charCodeAt(index - 1) != Chars.Lt) {
      pushToken(TokenType.StartTag, sectionStart, index, true, {});
    }
    state = State.EndTagState;
  }
};
let atTagNameState = function () {
  if (char >= Chars.Ua && char <= Chars.Lz) {
    state = State.TagNameState;
  } else if (char === Chars.Sl) {
    pushToken(TokenType.StartTag, sectionStart, index, true, {});
    state = State.defaultState;
    index = index + 1;
  } else if (char === Chars.Gt && buffer.charCodeAt(index - 1) != Chars.Sl) {
    pushToken(TokenType.StartTag, sectionStart, index, false, {});
    state = State.defaultState;
  } else if (char === Chars._S) {
    tagName = buffer.substring(tagStart, index);
    state = State.BeforeAttributeNameState;
  }
};
let atBeforeAttributeNameState = function () {
  if (char === Chars._S) {
    state = State.BeforeAttributeNameState;
  } else if (char >= Chars.Ua && char <= Chars.Lz) {
    state = State.AttributeNameState;
    attrStart = index;
  }
};
let atAttributeNameState = function () {
  if (char >= Chars.Ua && char <= Chars.Lz) {
    state = State.AttributeNameState;
  } else if ((char = Chars.Eq)) {
    attrName = buffer.substring(attrStart, index);
    state = State.BeforeAttributeValueState;
  }
};
let atBeforeAttributeValueState = function () {
  if (char === Chars.Dq || char === Chars.Sq) {
    attrStart = index + 1;
    state = State.AttributeValueState;
  }
};
let atAttributeValueState = function () {
  if (char === Chars.Dq || char === Chars.Sq) {
    attrVaule = buffer.substring(attrStart, index);
    pushAttr(attrName, attrVaule);
    state = State.AfterAttributeValueQuotedState;
  } else {
    state = State.AttributeValueState;
  }
};
let atAfterAttributeValueQuotedState = function () {
  if (char === Chars._S) {
    state = State.AfterAttributeValueQuotedState;
  } else if (char >= Chars.Ua && char <= Chars.Lz) {
    attrStart = index;
    state = State.AttributeNameState;
  } else if (char === Chars.Gt) {
    pushToken(TokenType.StartTag, sectionStart, index, false, attrs);
    state = State.defaultState;
    attrs = {};
    tagName = "";
  } else if (char === Chars.Sl) {
    state = State.EndTagState;
  }
};
let atEndTagState = function () {
  if (char >= Chars.Ua && char <= Chars.Lz) {
    if (buffer.charCodeAt(index - 1) === Chars.Sl) {
      sectionStart = index;
    }
    state = State.EndTagState;
  } else if (char === Chars.Gt) {
    if (buffer.charCodeAt(index - 1) === Chars.Sl) {
      pushToken(TokenType.StartTag, sectionStart, index, true, {});
    } else {
      pushToken(TokenType.EndTag, sectionStart, index);
    }
    state = State.defaultState;
  }
};
let unexpected = function () {
  throw new SyntaxError(
    `Unexpected token "${buffer.charAt(index)}" at ${index} when parse ${state}`
  );
};
export function tokenize(input: string) {
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

