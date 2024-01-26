import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate, ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { AIMessage } from "@langchain/core/messages";
import { LLMChain } from "langchain/chains";

(async () => {

    await simpleChat1();
    await simpleChat2();
    await simpleChat2();
    
    await prompt1();
    await prompt2();

    await parseOutput1();
    await parseOutput2();

    await chain1();
    await chain2();
    await chain3();

})();

async function simpleChat1() {

    const chat = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo-1106"
    });

    const result = await chat.invoke("こんばんは");
    console.log(result);
}

async function simpleChat2() {

    const chat = new ChatOpenAI();

    const result = await chat.invoke("こんばんは");
    console.log(result);
}

async function simpleChat3() {

    const chat = new ChatGoogleGenerativeAI();

    const result = await chat.invoke("こんばんは");
    console.log(result.content);
}

async function prompt1() {

    const promptTemplate1 = new PromptTemplate({
        template: "今日は{day_of_week}、明日は？",
        inputVariables: [ "day_of_week" ]   // 変数の定義を書く
    });
    const prompt1 = await promptTemplate1.format({ day_of_week: "金曜日" });
    console.log(prompt1);

    // fromTemplateを使うと変数は勝手にいい感じにしてくれる
    const promptTemplate2 = PromptTemplate.fromTemplate("今日は{day_of_week}、明日は？");
    const prompt2 = await promptTemplate2.format({ day_of_week: "金曜日" });
    console.log(prompt2);
}

async function prompt2() {

    const chatTemplate1 = ChatPromptTemplate.fromMessages([
        [ "system", "あなたは{role}です" ],
        [ "human", "好きな{kinds}は何ですか？" ]
    ]);
    const prompt1 = await chatTemplate1.format({ role: "賢い猫", kinds: "食べ物" });
    console.log(prompt1);

    const chatTemplate2 = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate("あなたは{role}です"),
        HumanMessagePromptTemplate.fromTemplate("好きな{kinds}は何ですか？")
    ]);
    const prompt2 = await chatTemplate2.format({ role: "賢い猫", kinds: "食べ物" });
    console.log(prompt2);
}

async function parseOutput1() {

    const message = new AIMessage({
        content: 'こんばんは！なんかご用ですか？'
    });

    const outputParser = new StringOutputParser();
    const result = await outputParser.invoke(message);
    console.log(result);
}

async function parseOutput2() {

    const message = new AIMessage({
        content: '春,夏,秋,冬'
    });

    const outputParser = new CommaSeparatedListOutputParser();
    const result = await outputParser.invoke(message);
    console.log(result);
}

async function chain1() {

    const chatTemplate = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate("あなたは{role}です"),
        HumanMessagePromptTemplate.fromTemplate("好きな{kinds}は何ですか？")
    ]);
    const prompt = await chatTemplate.format({ role: "賢い猫", kinds: "食べ物" });

    const chat = new ChatGoogleGenerativeAI();
    const chatResult = await chat.invoke(prompt);

    const outputParser = new StringOutputParser();
    const result = await outputParser.invoke(chatResult);

    console.log(result);
}

async function chain2() {

    const chatTemplate = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate("あなたは{role}です"),
        HumanMessagePromptTemplate.fromTemplate("好きな{kinds}は何ですか？")
    ]);
    const chat = new ChatGoogleGenerativeAI();
    const outputParser = new StringOutputParser();

    const result = await chatTemplate.pipe(chat).pipe(outputParser).invoke({ role: "賢い猫", kinds: "食べ物" });
    console.log(result);
}

async function chain3() {

    const chatTemplate = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate("あなたは{role}です"),
        HumanMessagePromptTemplate.fromTemplate("好きな{kinds}は何ですか？")
    ]);

    const chat = new ChatGoogleGenerativeAI();
    const outputParser = new StringOutputParser();

    const chain = new LLMChain({
        prompt: chatTemplate,
        llm: chat,
        outputParser: outputParser
    });

    const result = await chain.invoke({ role: "賢い猫", kinds: "食べ物" });
    console.log(result);
}