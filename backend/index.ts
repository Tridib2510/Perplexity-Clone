// We are going to build the /conversation endpoint
import express from "express"; 
// add the types of express by bun add@types/express

import {tavily} from "@tavily/core" // get the tavily sdk(bun add @tavily/core )

import { SYSTEM_PROMPT,PROMPT_TEMPLATE } from "./prompt";

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {z} from 'zod' //will be used to get a proper structured output

const client=tavily({apiKey:process.env.TAVILY_API_KEY})
const app=express()

app.use(express.json())

app.post('/perplexity_ask',async(req,res)=>{
    // get the  query from the user
    const query=req.body.query;

    // make sure user has access/credits to hit the endpoint


    //Check if we have web search indexed for a similar query

    // Web search to gather resources
    const webSearchResponse=await client.search(query,{
        searchDepth:"advanced"
    })

    const webSearchResult=webSearchResponse.results

    // do some context engineering on the prompt + web search responses

    // hit the LLM and stream back the response
    // Harikirat use VercelAI gateway and vercel AI sdk . I am going to use use Langchain Groq api

    const model=new ChatGroq({
        model:"llama-3.3-70b-versatile",
        apiKey:process.env.GROQ_API_KEY
    })

    const prompt=ChatPromptTemplate.fromMessages([
        ["system",SYSTEM_PROMPT],
        ["human",PROMPT_TEMPLATE]
    ])

    // const schema=z.object({
    //     followups:z.array(z.string()),
    //     answer:z.string()
    // })
    
    const chain=prompt.pipe(model).pipe(new StringOutputParser())

    const stream=await chain.stream({
        WEB_SEARCH_RESULTS:webSearchResult,
        USER_QUERY:query
    })

    for await (const chunk of stream){
        // res.end()--> Stream the response
        res.end(chunk)
    }
 

    // also stream back the sources and the follow up questions (which we can get from a parallel LLM call)
});

// Reverse Engineering
// On clicking the Network tab and sending a request we see a perplexity_ask endpoint
// that is sending the response

app.listen(3000)