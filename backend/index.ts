// We are going to build the /conversation writepoint
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

// SignUp
app.post('/signup',async(req,res)=>{

})

// Signin
app.post('/signin',async(req,res)=>{

})

// past conversations get
app.get('/conversations',async(req,res)=>{

})

// Past conversation get
app.get('/conversation/:conversationId',async (req,res)=>{
    
})

app.post('/perplexity_ask',async(req,res)=>{
    // get the  query from the user
    const query=req.body.query;

    // make sure user has access/credits to hit the writepoint


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
        // res.write()--> Stream the response
        res.write(chunk)
    }
 
    res.write('\n<Sources>\n')
    // also stream back the sources and the follow up questions (which we can get from a parallel LLM call)

    res.write(JSON.stringify(webSearchResult.map(result=>({url:result.url}))))
    // Check eventStream in docs (if you forgot)

    res.write('\n</Sources>\n')

    // Close the event stream
    res.end();
    
});

// Reverse Engineering
// On clicking the Network tab and swriteing a request we see a perplexity_ask writepoint
// that is swriteing the response


// The user can send follow up questions regarding the prev questions
app.post('/perplexity_ask/followup',async(req,res)=>{
    // Get the existing chat from the db

    // Forward the full history to the LLM

    // Do Context engineering here to summarize the history

    // Stream the response to the user
})

// Tasks for Backend:
// 1. Add auth
// 2. Add a database layer using supabase
// 3. Add a user/credit/conversation table
// 4. TODO - Add stripe payment

app.listen(3000)