import "dotenv/config";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { MyDocumentLoader } from "./my_document_loader";
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MyTextSplitter } from "./my_text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MyRetriever } from './my_retriever';

export async function documentLoader1() {

    const loader = new CSVLoader("./sample_data/sample.csv");
    const docs = await loader.load();
    console.log(docs);
    return docs;
}

export async function documentLoader2() {

    const loader = new CSVLoader("./sample_data/sample.csv", { column: "都道府県" });
    const docs = await loader.load();
    console.log(docs);
    return docs;
}

export async function documentLoader3() {

    const func = async () => `今日は
朝から
とても
いい天気なので
散歩に
行ったよ`;
    const loader = new MyDocumentLoader(func);
    const docs = await loader.load();
    console.log(docs);
    return docs;
}

export async function textSplitter1() {

    const text = "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";
    const splitter = new CharacterTextSplitter({ 
        separator: "。", // 区切り文字
        chunkSize: 5,    // チャンクの文字数
        chunkOverlap: 0  // チャンクのオーバーラップ
    });
    const result = await splitter.createDocuments([text]);
    console.log(result);
    return result;
}

export async function textSplitter2() {

    const text = "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";
    const splitter = new CharacterTextSplitter({ 
        separator: "。", // 区切り文字
        chunkSize: 30,    // チャンクの文字数（これを超えない限りは区切り文字があっても1つになるみたい）
        chunkOverlap: 10  // チャンクのオーバーラップ（効いてる気がしない）
    });
    const result = await splitter.createDocuments([text]);
    console.log(result);
    return result;
}

export async function textSplitter3() {

    const text = "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";
    const splitter = new RecursiveCharacterTextSplitter({ 
        chunkSize: 20,    // チャンクの文字数（これを超えない限りは区切り文字があっても1つになるみたい）
        chunkOverlap: 10  // チャンクのオーバーラップ（こっちは効いてる）
    });
    const result = await splitter.createDocuments([text]);
    console.log(result);
    return result;
}

export async function textSplitter4() {

    const text = "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";
    const splitter = new MyTextSplitter({
        separator: "。", // 区切り文字
        suffix: "にゃ"     // 区切り文字の後に付ける文字
    });
    const result = await splitter.createDocuments([text]);
    console.log(result);
    return result;
}

export async function embedding1() {
    
    const embeddings = new OpenAIEmbeddings();
    const result = await embeddings.embedQuery("吾輩は猫である");
    console.log(result);
    return result;
}

export async function embedding2() {
    
    const embeddings = new OpenAIEmbeddings();

    const result1 = await embeddings.embedQuery("吾輩は猫である");
    const result2 = await embeddings.embedQuery("吾輩は犬である");
    const result3 = await embeddings.embedQuery("クロネコヤマト");

    const similarity1 = cosineSimilarity(result1, result2);
    const similarity2 = cosineSimilarity(result1, result3);
    const similarity3 = cosineSimilarity(result2, result3);

    console.log(similarity1);
    console.log(similarity2);
    console.log(similarity3);

    return [similarity1, similarity2, similarity3];
}

function cosineSimilarity(vector1: number[], vector2: number[]) {
    const dotProduct = vector1.reduce((acc, value, index) => acc + value * vector2[index], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, value) => acc + value * value, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, value) => acc + value * value, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

export async function vectorStore1() {

    const embeddings = new OpenAIEmbeddings();
    const chroma = new Chroma(embeddings, {
        url: process.env.CHROMADB_URL,
        collectionName: "sample"
    });

    const result = await chroma.similaritySearch("ネコカワイイ", 2);
    console.log(result);
    return result;
}

export async function vectorStore2() {

    const embeddings = new OpenAIEmbeddings();
    const chroma = new Chroma(embeddings, {
        url: process.env.CHROMADB_URL,
        collectionName: "sample"
    });

    // ドキュメント追加
    const text = "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。";
    const splitter = new CharacterTextSplitter({ 
        separator: "。",
        chunkSize: 30,
        chunkOverlap: 10
    });
    const docs = await splitter.createDocuments([text]);
    await chroma.addDocuments(docs);

    const result = await chroma.similaritySearch("ネコカワイイ", 10);
    console.log(result);
    return result;
}

export async function retriever1() {

    const embeddings = new OpenAIEmbeddings();
    const chroma = new Chroma(embeddings, {
        url: process.env.CHROMADB_URL,
        collectionName: "sample"
    });

    const retriever = chroma.asRetriever(3);
    const result = await retriever.getRelevantDocuments("ネコカワイイ");
    console.log(result);
    return result;
}

export async function retriever2() {

    const retriever = new MyRetriever({});
    const result = await retriever.getRelevantDocuments("すみっコぐらし");
    console.log(result);
    return result;
}