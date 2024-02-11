import { chain1, chain2, chain3, parseOutput1, parseOutput2, prompt1, prompt2, prompt3, prompt4, simpleChat1, simpleChat2, simpleChat3 } from "../basic";

// ---------- モックの準備など ----------
// 今回ブログ用にわかりやすいように関数自体の中で完結するようChatModelのコンストラクタ自体を無理やりモックにしていますが、
// 本来的には外部への依存性はなるべく薄く切り出して、その部分だけを注入するのがおすすめです。
// ------------------------------------

let invokeMock = jest.fn();
let constructorArgs: any = undefined;

jest.mock("@langchain/openai", () => {
    return {
        ChatOpenAI: jest.fn().mockImplementation((arg?) => {
            constructorArgs = arg;
            return { 
                invoke: invokeMock
            };
        })
    };
});

jest.mock("@langchain/google-genai", () => {
    const original = (jest.requireActual("@langchain/google-genai") as any).ChatGoogleGenerativeAI;
    return {
        ChatGoogleGenerativeAI: jest.fn().mockImplementation((arg?) => {
            constructorArgs = arg;
            return { 
                pipe: original.prototype.pipe,  // pipeは使うのでそのまま
                lc_runnable: true,  // モックがRunnableじゃないので無理やり
                invoke: invokeMock
            };
        })
    };
});

// 前準備
beforeAll(() => {
    // ログが邪魔なので静かにさせておく
    jest.spyOn(global.console, "log").mockImplementation(() => {});
});

// 毎回のリセット
beforeEach(() => {
    invokeMock = jest.fn();
    constructorArgs = undefined;
});

// 後片付け
afterAll(() => {
    jest.restoreAllMocks();
});

// ---------- テスト ----------

describe('チャットモデルのテスト', () => {

    it("OpenAIのチャットモデルを引数ありで初期化", async () => { 
        invokeMock = jest.fn().mockImplementation(() => "OK1");
        const result = await simpleChat1();
        expect(result).toBe("OK1");
        expect(constructorArgs).not.toBeUndefined();
    });

    it("OpenAIのチャットモデルを引数なしで初期化", async () => { 
        invokeMock = jest.fn().mockImplementation(() => "OK2");
        const result = await simpleChat2();
        expect(result).toBe("OK2");
        expect(constructorArgs).toBeUndefined();
    });

    it("Googleのチャットモデルを初期化", async () => { 
        invokeMock = jest.fn().mockImplementation(() => ({ content: "OK3" }));
        const result = await simpleChat3();
        expect(result.content).toBe("OK3");
        expect(constructorArgs).toBeUndefined();
    });
});

describe('プロンプトのテスト', () => {

    it("PromptTemplateをコンストラクタで初期化", async () => {
        const result = await prompt1();
        expect(result).toBe("今日は金曜日、明日は？");
    });

    it("PromptTemplateをfromTemplateで初期化", async () => {
        const result = await prompt2();
        expect(result).toBe("今日は金曜日、明日は？");
    });

    it("ChatPromptTemplateで初期化", async () => {
        const result = await prompt3();
        expect(result).toBe("System: あなたは賢い猫です\nHuman: 好きな食べ物は何ですか？");
    });
    
    it("ChatPromptTemplate・SystemMessagePromptTemplate・HumanMessagePromptTemplateで初期化", async () => {
        const result = await prompt4();
        expect(result).toBe("System: あなたは賢い猫です\nHuman: 好きな食べ物は何ですか？");
    });
});

describe('OutputParserのテスト', () => {

    it("StringOutputParser", async () => {
        const result = await parseOutput1();
        expect(result).toBe("こんばんは！なんかご用ですか？");
    });

    it("ListOutputParser", async () => {
        const result = await parseOutput2();
        expect(result).toStrictEqual(["春","夏","秋","冬"]);
    });
});

describe('Chainのテスト', () => {

    it("順番に実行", async () => {
        invokeMock = jest.fn().mockImplementation(() => ({ content: "鰹節" }));
        const result = await chain1();
        expect(result).toBe("鰹節");
    });

    it("pipeで実行", async () => {
        invokeMock = jest.fn().mockImplementation(() => ({ content: "チュール" }));
        const result = await chain2();
        expect(result).toBe("チュール");
    });

    it("LLMChainで実行", async () => {
        invokeMock = jest.fn().mockImplementation(() => ({ content: "餡子" }));
        const result = await chain3();
        expect(result.text).toBe("餡子");
    });
});