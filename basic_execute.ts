import { simpleChat1, simpleChat2, prompt1, prompt2, parseOutput1, parseOutput2, chain1, chain2, chain3 } from "./basic";

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