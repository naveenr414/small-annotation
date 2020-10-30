from fastapi import FastAPI
import spacy
from spacy.tokenizer import Tokenizer
from spacy.lang.en import English
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # pylint: disable=no-name-in-module
import json
import time
import bisect
import pickle

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:2020",
    "http://localhost:1234",
    "http://quenya.umiacs.umd.edu:1234",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*", "POST","GET"],
    allow_headers=["*", "POST","GET"],
)

class NounPhrase(BaseModel):
    question_num: int
    annotations: list
    person_name: str

nlp = spacy.load("en_core_web_sm")
tokenizer = Tokenizer(nlp.vocab)

start = time.time()
wiki = pickle.load(open("all_wiki.p","rb"))
names = sorted(wiki.keys())
print("Took {} time".format(time.time()-start))

@app.get("/")
async def root():
    return {"message": "Hello World"}

def chunk_words(question):
    original_doc = nlp(question)

    word_indices = [token.text for token in original_doc]
    return word_indices

def load_annotations(person_name):
    try:
        f = open("{}_annotations.csv".format(person_name)).read().split("\n")[1:-1]
    except FileNotFoundError:
        return {}

    annotations = {}

    for i in f:
        s = i.split(",")
        question_num = int(s[0])
        start = int(s[1])
        end = int(s[2])
        annotation = s[3]
        is_nel = s[4] == 'True'
        print("Is Nel {} {}".format(is_nel,s[4]))
        if question_num not in annotations:
            annotations[question_num] = []
        annotations[question_num].append((start,end,annotation,is_nel))

    return annotations

def write_annotations_dict(person_name,d):
    w = open("{}_annotations.csv".format(person_name),"w")

    print("Writing {}".format(d))

    w.write("question_num,start,end,annotation,is_named_entity\n")
    for k in d:
        for i in d[k]:
            w.write("{},{},{},{},{}\n".format(k,i[0],i[1],i[2],i[3]))
    w.close()
        

def write_annotation(question_num,start,end,annotation,is_nel,person_name):
    l = load_annotations(person_name)
    if question_num not in l:
        l[question_num] = []
    l[question_num].append((start,end,annotation,is_nel))
    
def noun_indices(question):
    original_doc = nlp(question)
    all_noun_phrases = []

    index = 0
    nounIndices = []
    for token in original_doc:
        # print(token.text, token.pos_, token.dep_, token.head.text)
        if token.pos_ == 'NOUN' or token.pos_ == "PROPN":
            nounIndices.append(index)
        index = index + 1
    word_indices = [(token.text,token.i) for token in original_doc]
    character_indices = [(token.text,token.idx) for token in original_doc]


    texts = []
    spans_seen = []
    for idxValue in nounIndices:
        doc = nlp(question)
        span = doc[doc[idxValue].left_edge.i : doc[idxValue].right_edge.i+1]

        for token in span:
            if token.dep_ in ['dobj','pobj','det','nsubj'] or token.pos_ in ["PRON",'PROPN',"NOUN","ADJ","NUM"]:
                char_index = token.idx

                for i in range(len(character_indices)):
                    if(character_indices[i][1] == char_index):
                        start = word_indices[i][1]

                end = doc[idxValue].right_edge.i
                start_context = max(start-3,0)
                end_context = min(end+3,len(original_doc)-1)

                if (start,end) not in spans_seen:
                    spans_seen.append((start,end))
                    texts.append({'context_left':str(original_doc[start_context:start]).strip(),'content':str(original_doc[start:end+1]).strip(),'context_right':str(original_doc[end+1:end_context+1]).strip()})

    spans_seen,texts = zip(*sorted(zip(spans_seen,texts)))

    return {'spans':list(spans_seen),'text':list(texts)}

@app.get("/questions")
def get_questions():
    f = open("questions.txt").read().strip().split("\n")
    return f

@app.get("/question_num/{question_num}")
def get_question_num(question_num):
    return open("questions.txt").read().strip().split("\n")[int(question_num)]

@app.get("/noun_phrases/{question_num}")
def get_noun_phrase_num(question_num):
    name = question_num.split("_")[1].lower().strip()
    question_num = question_num.split("_")[0]
    l = load_annotations(name)
    print("Name {} annotations {} question num {}".format(name,l,int(question_num)))
    f = open("questions.txt").read().strip().split("\n")[int(question_num)]
    annotations = []
    if int(question_num) in l:
        annotations = l[int(question_num)]

    formatted_annotations = {}
    formatted_checked = {}

    w = chunk_words(f)
    n = noun_indices(f)
    for i in range(len(n['spans'])):
        for j in range(len(annotations)):
            if n['spans'][i][0] == annotations[j][0] and n['spans'][i][1] == annotations[j][1]:
                formatted_annotations[i] = annotations[j][2]
                formatted_checked[i] = annotations[j][3]
    
    return {'words':w,'nouns':n,'annotations':annotations,'formatted_annotations':formatted_annotations,'formatted_checked':formatted_checked}

@app.post("/submit")
async def write_phrases(noun_phrases: NounPhrase):
    l = load_annotations(noun_phrases.person_name.lower())
    question_num = noun_phrases.question_num
    if question_num not in l:
        l[question_num] = []
    print("Annotations {}".format(noun_phrases.annotations))
    l[question_num] = noun_phrases.annotations
    write_annotations_dict(noun_phrases.person_name.lower(),l)

@app.get("/autocorrect/{word}")
def get_autocorrect(word):
    word = word.replace("&","&amp;")
    name_one = bisect.bisect_left(names,word)
    name_two = bisect.bisect_right(names,word+"z")
    if(name_two-name_one<10**4):
        popular_names = [i for i in sorted(names[name_one:name_two],key=lambda x: wiki[x][1],reverse=True) if i in wiki][:5]
    else:
        popular_names = names[name_one:name_one+5]

    if word in wiki and word not in popular_names:
        popular_names+=[word]
    
    return [(i.replace("&amp;","&"),wiki[i][0]) for i in popular_names]+[("no entity","")]

