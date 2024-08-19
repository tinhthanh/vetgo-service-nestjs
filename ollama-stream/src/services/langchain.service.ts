import { Injectable } from '@nestjs/common';
import { ChatOllama , OllamaEmbeddings} from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import type { AttributeInfo } from "langchain/chains/query_constructor";

import { QdrantClient } from "@qdrant/js-client-rest";

import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { QdrantTranslator } from "@langchain/community/structured_query/qdrant";


@Injectable()
export class LangchainService {
  private ollama: ChatOllama;
  private llmJsonMode: ChatOllama;

  constructor() {
    const ollama_base_url =
      process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollama = new ChatOllama({
      baseUrl: ollama_base_url,
      model: 'llama3.1:8b',
      temperature: 8,
      maxRetries: 2,
      // other params...
    });
    this.llmJsonMode = new ChatOllama({
      baseUrl: ollama_base_url, // Default value
      model: 'llama3.1:8b',
      format: 'json',
    });
  }
  async streamResponse(
    query: string,
    onData: (chunk: any) => void,
  ): Promise<void> {
    const stream = await this.ollama.stream(query);
    for await (const chunk of stream) {
      onData(chunk);
    }
  }
  async resultFromJsonMode() {
    const promptForJsonMode = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
      ],
      ['human', `Translate "{input}" into {language}.`],
    ]);
    const chainForJsonMode = promptForJsonMode.pipe(this.llmJsonMode);
    const resultFromJsonMode = await chainForJsonMode.invoke({
      input: 'I love programming',
      language: 'Vietnamese',
    });
    return resultFromJsonMode.content;
  }
  async orc() {
    const promptForJsonMode = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert at labeling information. Format all responses as JSON objects with the keys:
         "number" and 
         "full_name" and
         "date_of_birth" and
         "sex" and
         "nationality" and
         "place_of_origin" and
         "date_of_expiry" and
         "place_of_residence".`,
      ],
      ['human', `Data "{input}".`],
    ]);
    const chainForJsonMode = promptForJsonMode.pipe(this.llmJsonMode);
    const resultFromJsonMode = await chainForJsonMode.invoke({
      input: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM Độc lập-Tự do-Hạnh phúc
CĂN CƯỚC CÔNG DÂN
Thẻ căn cước công dân
Số 1 No.: 087095009248
Họ và tên / Full name:
HUỲNH TÍNH THÀNH
Ngày sinh / Date of birth: 04/03/1995
Giới tính / Sex: Nam Quốc tịch / Nationality: Việt Nam
Quê quán / Place of origin:
Mỹ Quí, Tháp Mười, Đồng Tháp
Có giá trị đến 04/03/2035
Date of expiry
Nơi thường trú 1 Place of residence: Ấp Mỹ Phước 2
Mỹ Quí, Tháp Mười, Đồng Tháp`,
    });
    return resultFromJsonMode.content;
  }
  async qdrant() {
    const docs = [
      new Document({
        pageContent:
          "A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata: { year: 1993, rating: 7.7, genre: "science fiction" },
      }),
      new Document({
        pageContent:
          "Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata: { year: 2010, director: "Christopher Nolan", rating: 8.2 },
      }),
      new Document({
        pageContent:
          "A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata: { year: 2006, director: "Satoshi Kon", rating: 8.6 },
      }),
      new Document({
        pageContent:
          "A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata: { year: 2019, director: "Greta Gerwig", rating: 8.3 },
      }),
      new Document({
        pageContent: "Toys come alive and have a blast doing so",
        metadata: { year: 1995, genre: "animated" },
      }),
      new Document({
        pageContent: "Three men walk into the Zone, three men walk out of the Zone",
        metadata: {
          year: 1979,
          director: "Andrei Tarkovsky",
          genre: "science fiction",
          rating: 9.9,
        },
      }),
    ];
   
    
    /**
     * Next, we instantiate a vector store. This is where we store the embeddings of the documents.
     * We also need to provide an embeddings object. This is used to embed the documents.
     */
    
    const client = new QdrantClient({ url: "http://localhost:6333" });
    
    const embeddings = new OllamaEmbeddings({
      model: "llama3.1:8b", // Default value
      baseUrl: "http://localhost:11434", // Default value
    });
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      client,
      collectionName: "movie-collection",
    });
    console.log(vectorStore.toJSON());
  }
  // TODO chưa đọc được data từ qdrant để dùng 
 async useQdrant() {
    const attributeInfo: AttributeInfo[] = [
      {
        name: "genre",
        description: "The genre of the movie",
        type: "string or array of strings",
      },
      {
        name: "year",
        description: "The year the movie was released",
        type: "number",
      },
      {
        name: "director",
        description: "The director of the movie",
        type: "string",
      },
      {
        name: "rating",
        description: "The rating of the movie (1-10)",
        type: "number",
      },
      {
        name: "length",
        description: "The length of the movie in minutes",
        type: "number",
      },
    ];
    const client = new QdrantClient({ url: "http://localhost:6333" });
    const embeddings = new OllamaEmbeddings({
      model: "llama3.1:8b", // Default value
      baseUrl: "http://localhost:11434", // Default value
    });
     const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      client,
      collectionName: "movie-collection",
    });
    const selfQueryRetriever = SelfQueryRetriever.fromLLM({
      llm: this.ollama ,
      vectorStore: vectorStore,
      /** A short summary of what the document contents represent. */
      documentContents: "Brief summary of a movie",
      attributeInfo: attributeInfo,
      structuredQueryTranslator: new QdrantTranslator(),
    });
   return await selfQueryRetriever.invoke("Which movies are rated higher than 8.5?");
  }
}
