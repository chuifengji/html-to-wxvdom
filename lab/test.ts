let tokensTest = [
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
export interface JsonItemTag {
  name: string;
  attrs: object;
  children: Array<object>;
}
export interface JsonItemText {
  type: string;
  text: string;
}
export class tokenStack {
  private elements: JsonItemTag[];
  private _size: number | undefined;
  public constructor(capacity?: number) {
    this.elements = [];
    this._size = capacity;
  }

  public addElement(element: any) {
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
  }

  public removeElement() {
    return this.elements.pop();
  }

  public size(): number {
    return this.elements.length;
  }

  public isempty(): boolean {
    return this.size() == 0;
  }
  public getFirst() {
    return this.elements[this.size() - 1];
  }
  public changePrev(item: any) {
    if (item != null) {
      this.elements[this.size() - 2].children.push(item);
    }
  }
  public changePrevSelf(item: any) {
    if (item != null) {
      this.elements[this.size() - 1].children.push(item);
    }
  }
  public clear() {
    delete this.elements;
    this.elements = [];
  }

  public getAll() {
    return this.elements;
  }
}

let parser = function (TOKENS: Array<any>) {
  let MytokenStack = new tokenStack();
  let OutPutStack = new tokenStack();
  TOKENS.forEach((element) => {
    if (MytokenStack.isempty()) {
      //栈为空
      if (element.type === "Content") {
        //文本类型
        let item = { type: element.type, text: element.content };
        OutPutStack.addElement(item);
      } else if (element.selfClosing) {
        //自闭合类型
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        OutPutStack.addElement(item);
      } else {
        //正常起始标签
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        MytokenStack.addElement(item);
      }
      //栈不为空
    } else {
      if (element.type === "Content") {
        //是文本标签
        let item = { type: element.type, text: element.content };
        MytokenStack.changePrev(item);
        // console.log(MytokenStack.getFirst());
      } else if (element.selfClosing) {
        //是自闭合标签
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        MytokenStack.changePrevSelf(item);
        // MytokenStack.changePrev(item);
      } else if (
        //是前一个标签的闭合标签
        element.type === "EndTag" &&
        element.tagName === MytokenStack.getFirst().name
      ) {
        if (MytokenStack.size() >= 2) {
          let element = MytokenStack.getFirst();
          let item = {
            name: element.name,
            attrs: element.attrs,
            children: element.children,
          };
          MytokenStack.changePrev(item);
          MytokenStack.removeElement();
          //   console.log(MytokenStack.size());
        } else {
          OutPutStack.addElement(MytokenStack.getFirst());
        }
      } else {
        //啥也不是
        let item = {
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
