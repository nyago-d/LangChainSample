import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from '@langchain/core/retrievers';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { TokenTextSplitter } from 'langchain/text_splitter';

export interface MyRetrieverInput extends BaseRetrieverInput {}

export class MyRetriever extends BaseRetriever {

    lc_namespace: string[] = [];

    constructor(fields: MyRetrieverInput) {
        super(fields);
    }

    async _getRelevantDocuments(query: string): Promise<Document[]> {

        // Wikipediaにアクセスするための便利なクラスがあるので使う
        const wikipediaQuery = new WikipediaQueryRun({
            baseUrl: "https://ja.wikipedia.org/w/api.php",
            maxDocContentLength: 1024
        });
        const result = await wikipediaQuery.call(query);

        // 適当なサイズに分割
        const textSplitter = new TokenTextSplitter({
            chunkSize: 256,
            chunkOverlap: 0
        });

        return textSplitter.createDocuments([result]);
    }
}