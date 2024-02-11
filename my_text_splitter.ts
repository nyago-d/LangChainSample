import { TextSplitter, TextSplitterParams } from "langchain/text_splitter";

export interface MyTextSplitterParams extends TextSplitterParams {
    separator: string;
    suffix: string;
}

export class MyTextSplitter extends TextSplitter {

    readonly separator: string;
    readonly suffix: string;

    constructor(fields?: Partial<MyTextSplitterParams>) {
        super(fields);
        this.separator = fields?.separator ?? "";
        this.suffix = fields?.suffix ?? "";
    }

    splitText(text: string): Promise<string[]> {
        return Promise.resolve(
            text.split(this.separator)
                .filter(line => line)
                .map(line => line + this.suffix)
        );
    }
}