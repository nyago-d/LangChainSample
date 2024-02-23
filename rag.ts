import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import { TextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VectorStore } from "@langchain/core/vectorstores";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { RetrievalQAChain, LLMChain, ConversationalRetrievalQAChain } from 'langchain/chains';
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { BaseRetriever } from "@langchain/core/retrievers";

export async function save() {

    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new Chroma(embeddings, {
        url: process.env.CHROMADB_URL,
        collectionName: "anniversary"
    });

    const loader = new AnniversaryLoader();
    const docs = await loader.loadAndSplit(new AnniversaryTextSplitter());

    await vectorStore.addDocuments(docs);
}

export async function rag1(question: string, retriever: BaseRetriever, llm: BaseChatModel, chatTemplate: ChatPromptTemplate) {

    const docs = await retriever.getRelevantDocuments(question);
    const context = docs.map(d => d.pageContent).join("\n");

    const llmChain = new LLMChain({ prompt: chatTemplate, llm: llm });
    const result = await llmChain.invoke({ context, input: question });
    console.log(result.text);
    return result.text;
}

export async function rag2(question: string, retriever: BaseRetriever, llm: BaseChatModel) {

    const chain = RetrievalQAChain.fromLLM(llm, retriever, { inputKey: "input" });
    const result = await chain.invoke({ input: question });
    console.log(result.text);
    return result.text;
}

export async function rag3(question: string, retriever: BaseRetriever, llm: BaseChatModel, chatTemplate: ChatPromptTemplate) {

    const chain = RetrievalQAChain.fromLLM(llm, retriever, { inputKey: "input", prompt: chatTemplate });
    const result = await chain.invoke({ input: question });
    console.log(result.text);
    return result.text;
}

export async function rag4(question: string, retriever: BaseRetriever, llm: BaseChatModel, chatTemplate: ChatPromptTemplate) {

    const documentChain = await createStuffDocumentsChain({ prompt: chatTemplate, llm: llm });
    const retrievalChain = await createRetrievalChain({combineDocsChain: documentChain, retriever: retriever});

    const result = await retrievalChain.invoke({ input: question });
    console.log(result.answer);
    return result.answer;
}

export function getRetriever(): BaseRetriever {

    const embeddings = new OpenAIEmbeddings();
    const chroma = new Chroma(embeddings, {
        url: process.env.CHROMADB_URL,
        collectionName: "anniversary"
    });

    return chroma.asRetriever(10);
}

export function getLLM(): BaseChatModel {
    return new ChatGoogleGenerativeAI();
}

export function getChatTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(`コンテキストに沿ってユーザの入力に回答してください。複数ある場合はすべて回答してください。
----------
{context}`),
        HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);
}

class AnniversaryLoader extends BaseDocumentLoader {
    async load(): Promise<Document[]> {

        const wikipediaQuery = new WikipediaQueryRun({
            baseUrl: "https://ja.wikipedia.org/w/api.php"
        });

        const result = await wikipediaQuery.content("日本の記念日一覧");
        return [new Document({ pageContent: result })];
    }
}

class AnniversaryTextSplitter extends TextSplitter {
    splitText(text: string): Promise<string[]> {

        const lines = text.split("\n");

        let title = "";
        let day = "";
        let anniversaries: string[] = [];

        // めちゃくちゃ雑だけど、別にここが重要なわけでもないのでまぁいいかなと
        for (const line of lines) {
            if (line.match(/^== (.+) ==$/)) {
                title = line.split(" ")[1].trim();
            } else if (title.match(/^\d+月$/) && line.match(/^\d+日.+/)) {
                day = line.split(" ")[0];
                anniversaries.push(...line.split(" ")[2].split("、").map((a: string) => `${title}${day} : ${a}`));
            }
        }

        return Promise.resolve(anniversaries);
    }
}