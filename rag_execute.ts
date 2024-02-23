import { getChatTemplate, getLLM, getRetriever, rag1, rag2, rag3, rag4, save } from "./rag";
import { stdin, stdout } from "process";
import { createInterface } from "readline/promises";

(async() => {

    const retriever = getRetriever();
    const llm = getLLM();
    const chatTemplate = getChatTemplate();

    // await save(vectorStore);

    const reader = createInterface({ 
        input: stdin, 
        output: stdout
    });

    const question = await reader.question("記念日について質問をどうぞ：");
    reader.close();

    await rag1(question, retriever, llm, chatTemplate);
    await rag2(question, retriever, llm);
    await rag3(question, retriever, llm, chatTemplate);
    await rag4(question, retriever, llm, chatTemplate);

})();