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
from nltk.tokenize import WhitespaceTokenizer
import os.path
from db import Database
from fpdf import FPDF
from fastapi.responses import FileResponse
import suggest_questions
import random
import security

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:2020",
    "http://localhost:1234",
    "http://quenya.umiacs.umd.edu:3000",
    "http://quel.cs.umd.edu:3000",
    "http://quel.cs.umde.du",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*", "POST","GET"],
    allow_headers=["*", "POST","GET"],
)
app.include_router(security.router, prefix="/quel/token")

class NounPhrase(BaseModel):
    str_entity_names: str
    str_entity_spans: str
    username: str
    question_id: int

class Preference(BaseModel):
    username: str
    category: str
    subcategory: str

nlp = spacy.load("en_core_web_sm")
tokenizer = Tokenizer(nlp.vocab)

user_category = {}
user_num = {}

start = time.time()
print("Starting loading of pickle file")
wiki = {}#pickle.load(open("all_wiki.p","rb"))
names = []#sorted(wiki.keys())
print("Took {} time".format(time.time()-start))

start = time.time()
db = Database()
print("Took {} time to create databases".format(time.time()-start))

@app.get("/quel/")
async def root():
    return {"message": "Hello World"}

def chunk_words(question):
    original_doc = nlp(question)

    words = [token.text for token in original_doc]
    indexes = [token.idx for token in original_doc]
    return words,indexes

def get_word_indices(question):
    span_generator = WhitespaceTokenizer().span_tokenize(question)
    return [span for span in span_generator]

def load_annotations(person_name):
    try:
        f = open("../data/{}_annotations.csv".format(person_name)).read().split("\n")[1:-1]
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
        if question_num not in annotations:
            annotations[question_num] = []
        annotations[question_num].append((start,end,annotation,is_nel))

    return annotations
        

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

    spans_seen = []
    texts = []

    return {'spans':list(spans_seen),'text':list(texts)}

def get_annotations(username,question_num,question_data):
    mentions = db.get_mentions_by_user(username,str(question_num))

    if len(mentions) == 0:
        mentions = db.get_mentions_by_user("system",question_num)
    
    answer = question_data['wiki_answer']
    names = ["","{}".format(answer)]
    spans = [[],[]]

    spans = {}
    names = {}
    names[0] = ""
    names[1] = answer

    spans[0] = [{'start':-1,'end':-1,'content':''}]
    spans[1] = [{'start':-1,'end':-1,'content':''}]

    num_to_wiki = {}

    wiki_pages = set()

    if len(mentions)>0:
        names = {0:""}
        spans = {0:[]}

        for i in mentions:
            if i['number'] not in names:
                names[i['number']] = i['wiki_page']
                spans[i['number']] = []
                wiki_pages.add(i['wiki_page'])
            spans[i['number']].append({'start':i['start'],'end':i['end'],'content':i['content']})

        if answer not in wiki_pages:
            names[0.5] = answer
            spans[0.5] = []

    keys = sorted(list(names.keys()))
        
    return {'names':json.dumps([names[i] for i in keys]),
            'spans':json.dumps([spans[i] for i in keys])}

@app.get("/quel/question_num/{question_num}")
def get_question_num(question_num):
    return db.get_question(int(question_num))

def load_question(name,question_num):
    question_data = db.get_question(int(question_num))

    w = ["Empty"]
    word_indices = [0]
    entity_names = "[]"
    entity_list = "[]"
    question = "No Question"
    answer = "No Answer"

    if question_data != {}:
        question = question_data['question']
        answer = question_data['answer']
        w,word_indices = chunk_words(question)
        db.user_starts(name,int(question_num))

        annotation_data = get_annotations(name,question_num,question_data)
        entity_names = json.dumps(json.loads(annotation_data['names'])+[""])
        entity_list = json.dumps(json.loads(annotation_data['spans'])+[[]])
        

    return {'words':w,'indices':word_indices,
            'entity_names':entity_names,
            'entity_list':entity_list,
            'loaded_question':question_num,
            'question': question,
            'answer': answer,
            'question_num': question_num}

@app.get("/quel/user/{token}")
def get_user_info(token):
    username = security.decode_token(token)
    edits = db.get_all_useredits(username)
    return {'username':security.decode_token(token),'edits':edits}

@app.get("/quel/noun_phrases_suggested/{question_num}")
def get_noun_phrase_suggested_num(question_num):
    print("Getting suggested")
    start = time.time()
    name = question_num.split("_")[-1].lower().strip()
    question_num = "_".join(question_num.split("_")[:-1])

    name = security.decode_token(name)
    if name not in user_category:
        user_category[name] = random.sample(suggest_questions.category_list,1)[0]
        user_num[name] = random.randint(0,3)
    print("Category {}".format(user_category[name]))
    question_num = suggest_questions.get_random_question(user_category[name],user_num[name])
    print("Question num {}".format(question_num))
    return load_question(name,question_num)

@app.get("/quel/noun_phrases/{question_num}")
def get_noun_phrase(question_num):
    start = time.time()
    name = security.decode_token(question_num.split("_")[1][:-1])
    question_num = question_num.split("_")[0]
    return load_question(name,question_num)

@app.get("/quel/category/{username}")
def get_category(username):
    if username not in user_category:
        user_category[username] = "Literature"
        return "Literature"
    return user_category[username]
    

@app.post("/quel/user_preferences")
async def update_preferences(preference: Preference):
    if preference.subcategory == "Any":
        new_category = preference.category
    else:
        new_category = "{}_{}".format(preference.category,preference.subcategory)

    name = preference.username
    print("Preference name {}".format(name))
    if name not in user_category or user_category[name]!=new_category:
        user_category[name] = new_category
        user_num[name] = random.randint(0,3)

    print("Setting user preference to {}".format(new_category))

@app.post("/quel/submit")
async def write_phrases(noun_phrases: NounPhrase):
    question_id = noun_phrases.question_id
    username = security.decode_token(noun_phrases.username)
    db.remove_mentions(username,int(question_id))
    entity_names = json.loads(noun_phrases.str_entity_names)
    entity_spans = json.loads(noun_phrases.str_entity_spans)

    mentions = []

    for i in range(1,len(entity_names)):
        for j in entity_spans[i]:
            mentions.append({'user_id':username,'question_id':question_id,'start':j['start'],
                             'end':j['end'],'wiki_page':entity_names[i],
                             'content':j['content'],'number': i})
    db.insert_mentions(mentions)
    db.user_updates(username,int(question_id))

@app.get("/quel/mentions/all")
def get_all_mentions():
    return db.get_mentions()

@app.get("/quel/edits/all")
def get_all_mentions():
    return db.get_edits()


@app.get("/quel/autocorrect/{word}")
def get_autocorrect(word):
    word = word.replace("&","&amp;")    
    return db.get_autocorrect(word)

@app.get("/quel/status")
def status_check():
    if not db:
        return "Error in DB"
    if not db.get_mentions():
        return "Error in selecting from DB"
    if not db.insert_mentions([{'start':-1,'end':-1,'content':'','wiki_page':'','user_id':'test','question_id':0}]):
        return "Error in inserting to DB"
    if not db.remove_mentions('test',0):
        return "Error in deleting from DB"
    if not db.get_autocorrect("john"):
        return "Error with autocorrect"
    if not db.get_id("magna_carta"):
        return "Error with get id"
    if not db.get_question(0):
        return "Error with get question"

    return "No Errors Found"

@app.get("/quel/pdf/{question_num}")
def write_pdf(question_num):
    question_data = db.get_question(int(question_num.split("_")[0]))
    annotations = get_annotations(question_num.split("_")[1],
                                  question_num.split("_")[0],question_data)
    annotations['names'] = json.loads(annotations['names'])
    annotations['spans'] = json.loads(annotations['spans'])

    clean_annotations = []

    for i in range(1,len(annotations['names'])):
        if 'no entity' not in annotations['names'][i].lower() and annotations['names'][i]!='unknown' and annotations['names'][i]!='':
            for j in range(len(annotations['spans'][i])):
                span = annotations['spans'][i][j]
                del span['content']
                span = (span['start'],span['end'])
                clean_annotations.append((annotations['names'][i],
                                          span))

    clean_annotations = sorted(clean_annotations,key=lambda k: k[1])
    clean_annotations = [i for i in clean_annotations if min(i[1])>=0]
    question_num = question_num.split("_")[0]
    f = db.get_question(int(question_num))['question']
    words = chunk_words(f)[0]
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', '', 14)
    annotation_pointer = 0
    i = 0
    while i<len(words):
        if annotation_pointer == len(clean_annotations):
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('', '')
            pdf.write(5," ".join(words[i:]).replace(" .",".").replace(" ?","?").replace(" !","!").replace(" ,",",").replace(" - ","-"))
            break
        elif clean_annotations[annotation_pointer][1][0] == i:
            sent = (" ".join(
                          words[clean_annotations[annotation_pointer][1][0]:clean_annotations[annotation_pointer][1][1]+1])+
                       " ")
            sent = sent.replace(" .",".").replace(" ?","?").replace(" !","!").replace(" ,",",").replace(" - ","-")
            
            pdf.set_text_color(0, 0, 255)
            pdf.set_font('', 'U')
            location = clean_annotations[annotation_pointer][0].lower().replace(" ","_")
            id = db.get_id(location)
            url = "https://en.wikipedia.org"
            if len(id)>0:
                url = 'https://en.wikipedia.org/wiki?curid={}'.format(id[0])
            pdf.write(5,sent,url)
            i = clean_annotations[annotation_pointer][1][1]+1
            annotation_pointer+=1
        else:
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('', '')
            if i+1<len(words) and words[i+1] in ['.','!',':',';','?',"'",",","-"] or words[i] in ['-',"'"]:
                pdf.write(5,words[i])
            else:
                pdf.write(5,words[i]+" ")
            i+=1
    
    # Then put a blue underlined link
    pdf.output('question.pdf', 'F')
    file_path = "question.pdf"
    return FileResponse(path=file_path, filename=file_path, media_type='text')
