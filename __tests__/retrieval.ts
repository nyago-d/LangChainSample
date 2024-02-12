import { documentLoader3, textSplitter1, textSplitter2, textSplitter3, textSplitter4, embedding1, embedding2, vectorStore1, vectorStore2, retriever1, retriever2 } from "../retrieval";
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';

let embedQueryMock = jest.fn();
let documents: Document[] = [];

// 前準備
beforeAll(() => {
    
    // ログが邪魔なので静かにさせておく
    jest.spyOn(global.console, "log").mockImplementation(() => {});
    jest.spyOn(global.console, "warn").mockImplementation(() => {});

    // クラス定義ごと書き換える場合もjest.mockよりjest.spyOnでprototype指定する方書きやすくていいかも
    // そのまま関数参照にしてしまうと差し替えられないので、mockReturnValueではなくmockImplementationを使う
    jest.spyOn(OpenAIEmbeddings.prototype, "embedQuery").mockImplementation((text) => embedQueryMock(text));
    jest.spyOn(Chroma.prototype, "similaritySearch").mockImplementation(() => Promise.resolve(documents));
    jest.spyOn(Chroma.prototype, "addDocuments").mockImplementation((docs: Document[]) => {
        documents.push(...docs);
        return Promise.resolve([]);
    });
    jest.spyOn(WikipediaQueryRun.prototype, "call").mockImplementation(() => Promise.resolve("すみっコぐらしはいいぞ。"));
});

// 毎回のリセット
beforeEach(() => {
    embedQueryMock = jest.fn();
    documents = [];
});

// 後片付け
afterAll(() => {
    jest.restoreAllMocks();
});

describe('Loaderのテスト', () => {

// ESMのテストがうまく書けないのでいったん保留ということで…

//     it("CSVLoader", async () => { 
//         const result = await documentLoader1();
//         expect(result.length).toBe(4);
//         expect(result[0].pageContent).toBe(`都道府県: 北海道
// 都道府県（ローマ字）: hokkaido
// 県庁所在地: 札幌市
// 県庁所在地（ローマ字）: sapporo`);
//     });
//
//     it("CSVLoader2", async () => { 
//         const result = await documentLoader2();
//         expect(result.length).toBe(4);
//         expect(result[0].pageContent).toBe(`北海道`);
//     });

       it("MyDocumentLoader", async () => {
            const result = await documentLoader3();
            expect(result.length).toBe(6);
            expect(result[0].pageContent).toBe("今日は");
            expect(result[0].metadata.lineNumber).toBe(1);
            expect(result[5].pageContent).toBe("行ったよ");
            expect(result[5].metadata.lineNumber).toBe(6);
       });
});

describe('TextSplitterのテスト', () => {

    it("CharacterTextSplitter", async () => {
        const result = await textSplitter1();
        expect(result.length).toBe(4);
        expect(result[0].pageContent).toBe("吾輩は猫である");
    });

    it("CharacterTextSplitterのチャンクサイズ調整", async () => {
        const result = await textSplitter2();
        expect(result.length).toBe(2);
        expect(result[0].pageContent).toBe("吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ");
        expect(result[1].pageContent).toBe("何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している");
    });

    it("RecursiveCharacterTextSplitter", async () => {
        const result = await textSplitter3();
        expect(result.length).toBe(6);
        expect(result[0].pageContent).toBe("吾輩は猫である。名前はまだない。どこで生");
        expect(result[1].pageContent).toBe("はまだない。どこで生れたか頓と見当がつか");
        expect(result[2].pageContent).toBe("れたか頓と見当がつかぬ。何でも薄暗いじめ");
        expect(result[3].pageContent).toBe("ぬ。何でも薄暗いじめじめした所でニャーニ");
        expect(result[4].pageContent).toBe("じめした所でニャーニャー泣いていた事だけ");
        expect(result[5].pageContent).toBe("ャー泣いていた事だけは記憶している。");
    });
    
    it("MyTextSplitter", async () => {
        const result = await textSplitter4();
        expect(result.length).toBe(4);
        expect(result[0].pageContent).toBe("吾輩は猫であるにゃ");
        expect(result[1].pageContent).toBe("名前はまだないにゃ");
        expect(result[2].pageContent).toBe("どこで生れたか頓と見当がつかぬにゃ");
        expect(result[3].pageContent).toBe("何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶しているにゃ");
    });
});

// とりあえず書いてるけど、肝心のベクトル化機能モック化してるのでこのテストにあんまり意味はないと思う
describe('Embeddingのテスト', () => {

    it("Embeddingのテスト", async () => {
        embedQueryMock = jest.fn().mockImplementation((_) => Promise.resolve([0.1, 0.2, 0.3, 0.4]));
        const result = await embedding1();
        expect(result.length).toBe(4);
        expect(result[0]).toBe(0.1);
    });
    
    it("コサイン類似度試してみるテスト", async () => {

        embedQueryMock = jest.fn().mockImplementation((text) => {
            // 例えば配列の3番目が猫らしさ、4番目が犬らしさとする
            switch (text) {
                case "吾輩は猫である":
                    return Promise.resolve([0.1, 0.2, 0.2, 0.1]);
                case "吾輩は犬である":
                    return Promise.resolve([0.1, 0.2, 0.1, 0.2]);
                case "クロネコヤマト":
                    return Promise.resolve([0.4, 0.6, 0.2, 0.1]);
                default:
                    return Promise.resolve([0.0, 0.0, 0.0, 0.0]);
        }});
                
        const result = await embedding2();
        expect(result[0]).toBeGreaterThan(result[1]);
        expect(result[0]).toBeGreaterThan(result[2]);
        expect(result[1]).toBeGreaterThan(result[2]);
    });
});

// このあたりもテストとして意味は特にないけど練習ということでね
describe('VectorStoreのテスト', () => {

    it("VectorStoreの参照", async () => {
        documents = [    
            new Document({ pageContent: "doc1" }),
            new Document({ pageContent: "doc2" })
        ];
        const result = await vectorStore1();
        expect(result.length).toBe(2);
        expect(result[0].pageContent).toBe("doc1");
        expect(result[1].pageContent).toBe("doc2");
    });

    it("VectorStoreへの追加", async () => {
        documents = [    
            new Document({ pageContent: "doc1" })
        ];
        const result = await vectorStore2();
        expect(result.length).toBe(3);
        expect(result[0].pageContent).toBe("doc1");
        expect(result[1].pageContent).toBe("吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ");
        expect(result[2].pageContent).toBe("何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している");
    });
});

describe('Retrieverのテスト', () => {

    it("VectorStoreのRetriever化", async () => {
        documents = [    
            new Document({ pageContent: "doc1" }),
            new Document({ pageContent: "doc2" }),
            new Document({ pageContent: "doc3" }),
        ];
        const result = await retriever1();
        expect(result.length).toBe(3);
        expect(result[0].pageContent).toBe("doc1");
        expect(result[1].pageContent).toBe("doc2");
        expect(result[2].pageContent).toBe("doc3");
    });

    it("MyRetriever", async () => {
        const result = await retriever2();
        expect(result.length).toBe(1);
        expect(result[0].pageContent).toBe("すみっコぐらしはいいぞ。");
    });
});