// We are going to build the /conversation writepoint
import express from "express"; 
// add the types of express by bun add@types/express

import {tavily} from "@tavily/core" // get the tavily sdk(bun add @tavily/core )

import { SYSTEM_PROMPT,PROMPT_TEMPLATE } from "./prompt";

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {z} from 'zod' //will be used to get a proper structured output

import {prisma} from './db'

import { middleware } from "./middleware";

import cors from "cors" //bun add cors @types/cors

const client=tavily({apiKey:process.env.TAVILY_API_KEY})
const app=express()

app.use(express.json())
app.use(cors())

// past conversations get
app.get('/conversations', middleware, async (req, res) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            userId: req.userId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.json({
        conversations
    });
});

// Past conversation get
app.get('/conversation/:conversationId', middleware, async (req, res) => {
    const conversationId = req.params.conversationId as string;

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: req.userId
        },
        include: {
            Message: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if (!conversation) {
        res.status(404).json({ message: "Conversation not found" });
        return;
    }

    res.json({
        conversation
    });
});

app.post('/perplexity_ask', middleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const query = req.body.query;
    const conversationId = req.body.conversationId;

    let conversation;

    if (conversationId) {
        conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.userId
            }
        });
    }

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                userId: req.userId,
                title: query.slice(0, 50),
                slug: query.slice(0, 50).toLowerCase().replace(/\s+/g, '-')
            }
        });
    }

    // Include conversation ID at the start of the stream
    res.write(`<ConversationId>${conversation.id}</ConversationId>\n`);

    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });

    const webSearchResult = webSearchResponse.results;

    const model = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_PROMPT],
        ["human", PROMPT_TEMPLATE]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const stream = await chain.stream({
        WEB_SEARCH_RESULTS: webSearchResult,
        USER_QUERY: query
    });

    let fullResponse = '';

    for await (const chunk of stream) {
        res.write(chunk);
        fullResponse += chunk;
    }

    res.write('\n<Sources>\n');
    res.write(JSON.stringify(webSearchResult.map(result => ({ url: result.url }))));
    res.write('\n</Sources>\n');

    await prisma.message.create({
        data: {
            content: query,
            role: 'User',
            conversationId: conversation.id
        }
    });

    await prisma.message.create({
        data: {
            content: fullResponse,
            role: 'Assistant',
            conversationId: conversation.id
        }
    });

    res.end();
});

// Reverse Engineering
// On clicking the Network tab and swriteing a request we see a perplexity_ask writepoint
// that is swriteing the response


// The user can send follow up questions regarding the prev questions
app.post('/perplexity_ask/followup', middleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const { query, conversationId } = req.body;

    if (!query || !conversationId) {
        res.status(400).json({ message: "Query and conversationId are required" });
        return;
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: req.userId
        },
        include: {
            Message: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if (!conversation) {
        res.status(404).json({ message: "Conversation not found" });
        return;
    }

    const history = conversation.Message.map(m =>
        `${m.role === 'User' ? 'Human' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });

    const webSearchResult = webSearchResponse.results;

    const model = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_PROMPT + `\n\nPrevious conversation:\n${history}`],
        ["human", PROMPT_TEMPLATE]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const stream = await chain.stream({
        WEB_SEARCH_RESULTS: webSearchResult,
        USER_QUERY: query
    });

    let fullResponse = '';

    for await (const chunk of stream) {
        res.write(chunk);
        fullResponse += chunk;
    }

    res.write('\n<Sources>\n');
    res.write(JSON.stringify(webSearchResult.map(result => ({ url: result.url }))));
    res.write('\n</Sources>\n');

    await prisma.message.create({
        data: {
            content: query,
            role: 'User',
            conversationId: conversation.id
        }
    });

    await prisma.message.create({
        data: {
            content: fullResponse,
            role: 'Assistant',
            conversationId: conversation.id
        }
    });

    res.end();
});

// Tasks for Backend:
// 1. Add auth
// 2. Add a database layer using supabase
// 3. Add a user/credit/conversation table
// 4. TODO - Add stripe payment

// Steps to use prisma in Bun
// bun add -d prisma
// bun add @prisma/client @prisma/extension-accelerate
// bunx --bun prisma init --> We are going to use it as an ORM

app.listen(3001)


// To use bun just type bun init is choose our requirements


