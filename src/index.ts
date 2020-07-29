import { tokenize } from "./tokenize";
import parser from "./parser";

let ToWxVdom = (html_string: string) => {
    let tokens = tokenize(html_string);
    return parser(tokens);
}

export default ToWxVdom;
