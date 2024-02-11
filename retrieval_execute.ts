import { documentLoader1, documentLoader2, documentLoader3, embedding1, embedding2, retriever1, retriever2, textSplitter1, textSplitter2, textSplitter3, textSplitter4, vectorStore1, vectorStore2 } from "./retrieval";

(async() => {

    await documentLoader1();
    await documentLoader2();
    await documentLoader3();

    await textSplitter1();
    await textSplitter2();
    await textSplitter3();
    await textSplitter4();

    await embedding1();
    await embedding2();

    await vectorStore1();
    await vectorStore2();

    await retriever1();
    await retriever2();
})();