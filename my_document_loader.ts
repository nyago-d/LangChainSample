import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "langchain/document_loaders/base";

type Load = () => Promise<string>;

export class MyDocumentLoader extends BaseDocumentLoader {
    
    readonly loadFunction: Load;
    
    constructor(loadFunction: Load) {
        super();
        this.loadFunction = loadFunction;
    }

    async load(): Promise<Document[]> {
        const text = await this.loadFunction();
        return text.split("\n").map((line, i) => new Document({ 
            pageContent: line,
            metadata: { lineNumber: i + 1 }
        }));
    }
}