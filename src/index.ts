import { tokenize } from "./tokenize";
import parser from "./parser";

export default function toWxVdom(html_string: string) {
    let tokens = tokenize(html_string);
    return parser(tokens);
}

