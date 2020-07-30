/***
 * Copyright 2020 Ethan_Lv
 * @author Ethan_Lv ldlandchuifengji@gmail.com
 * @since 2020-05-07
 * @version 0.0.1
 * @desc parse.ts
 */
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
      if (element.type === "text") {
        let item = { type: element.type, text: element.content };
        OutPutStack.addElement(item);
      } else if (element.selfClosing) {
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        OutPutStack.addElement(item);
      } else {
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        MytokenStack.addElement(item);
      }
    } else {
      if (element.type === "text") {
        let item = { type: element.type, text: element.content };
        MytokenStack.changePrevSelf(item);
      } else if (element.selfClosing) {
        let item = {
          name: element.tagName,
          attrs: element.attrs,
          children: [],
        };
        MytokenStack.changePrevSelf(item);
      } else if (
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
        } else {
          OutPutStack.addElement(MytokenStack.getFirst());
          MytokenStack.removeElement();//fix 2007029 
        }
      } else {
        let item = {
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

export default parser;