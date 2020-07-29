"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tokenize_1 = require("./tokenize");
var parser_1 = __importDefault(require("./parser"));
var ToWxVdom = function (html_string) {
    var tokens = tokenize_1.tokenize(html_string);
    return parser_1.default(tokens);
};
exports.default = ToWxVdom;
