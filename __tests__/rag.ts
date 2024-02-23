import { rag1, rag2, rag3, rag4 } from '../rag';
import { FakeChatModel, FakeRetriever } from '@langchain/core/utils/testing';
import { ChatPromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

// 前準備
beforeAll(() => {
    // ログが邪魔なので静かにさせておく
    jest.spyOn(global.console, "log").mockImplementation(() => {});
});

// 毎回のリセット
beforeEach(() => {
});

// 後片付け
afterAll(() => {
    jest.restoreAllMocks();
});

describe('RAGのテスト', () => {

    // FakeRetrieverはfooとbarが返るみたいだけどモック化しておいてみる
    const retriever = new FakeRetriever();
    jest.spyOn(retriever, "getRelevantDocuments").mockImplementation(
        async () => [ new Document( { pageContent: "2月22日 : 猫の日" }) ]
    );

    // FakeChatModelは入ってきたメッセージを\nで繋いでそのまま帰すようになっている（のでテンプレートの内容がそのまま返る）
    const llm = new FakeChatModel({});

    // テンプレートは入ってきたコンテキストと入力を繋げて返すようにしておく
    const chatTemplate = ChatPromptTemplate.fromMessages([SystemMessagePromptTemplate.fromTemplate("{context}:{input}")]);

    const question = "猫の日っていつ？";

    it("順番に実行", async () => {
        const result = await rag1(question, retriever, llm, chatTemplate);
        expect(result).toBe("2月22日 : 猫の日:猫の日っていつ？");
    });

    it("RetrievalQAChain", async () => {
        const result = await rag2(question, retriever, llm);
        // デフォルトのテンプレートが利用されるので英語になる
        expect(result).toBe(`Use the following pieces of context to answer the users question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
2月22日 : 猫の日
猫の日っていつ？`);
    });

    it("テンプレートありRetrievalQAChain", async () => {
        const result = await rag3(question, retriever, llm, chatTemplate);
        expect(result).toBe("2月22日 : 猫の日:猫の日っていつ？");
    });

    it("StuffDocumentsChainとRetrievalChain", async () => {
        const result = await rag4(question, retriever, llm, chatTemplate);
        expect(result).toBe("2月22日 : 猫の日:猫の日っていつ？");
    });
});