import { tokenize } from "./tokenize";
import parser from "./parser";

export default function toWxVdom(html_string: string) {
    let tokens = tokenize(html_string),
        tokens_next = tokens.map(item => {
            if (item.type === 'StartTag' && (item.tagName === 'br' || item.tagName === 'img'
                || item.tagName === 'hr' || item.tagName === 'source'
                || item.tagName === 'link' || item.tagName === 'input')) {
                item.selfClosing = true;
            }
            return item;
        })
    console.log(tokens, tokens_next)

    return parser(tokens_next);
}