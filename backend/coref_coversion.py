import json 
import spacy
nlp = spacy.load("en_core_web_sm",exclude=["ner","tagger"])
import time
import unidecode

def chunk_words(question):
    start = time.time()
    original_doc = nlp(question)
    indexes = [token.idx for token in original_doc]
    end = time.time()
    return indexes

def process(question,answer,f,g):
    g['doc_key'] = int(g['doc_key'])

    chunks = chunk_words(question)
    nums = []
    j = 0
    for i in range(len(chunks)-1):
        while j<chunks[i+1]:
            nums.append(i)
            j+=1

    while j<len(question):
        nums.append(len(chunks)-1)
        j+=1
    
    clusters = []

    def get_word_indices(question):
        span_generator = WhitespaceTokenizer().span_tokenize(question)
        return [span for span in span_generator]

    # Need to convert to words
    tokens = g['sentences'][0]
    better_tokens = []

    token_to_real_num = {}
    for i in range(len(tokens)):
        if "[CLS]" == tokens[i] or "[SEP]" == tokens[i]:
            continue
        if "##" not in tokens[i]:
            better_tokens.append(tokens[i])
            token_to_real_num[i] = len(better_tokens)-1
        else:
            better_tokens[-1]+=tokens[i].replace("##","")
            token_to_real_num[i] = len(better_tokens)-1
    tokens = better_tokens

    tokens_to_char = {}

    i = 0
    k = 0

    while i<len(tokens):
        while k<len(question) and unidecode.unidecode(question[k:k+len(tokens[i])].lower())!=unidecode.unidecode(tokens[i].lower()):
            k+=1
        tokens_to_char[i] = (k,k+len(tokens[i]))
        i+=1

    for i in g['predicted_clusters']:
        real_clusters = [[tokens_to_char[token_to_real_num[j[0]]][0],tokens_to_char[token_to_real_num[j[1]]][1]] for j in i]
        
        clusters.append({'name':"",'clusters':real_clusters})


    for k in f['mentions']:
        for j in clusters:
            if k['span'] in j['clusters']:
                j['name'] = k['entity']
                j['score'] = k['score']
                break
        for j in clusters:
            if j['name'] == k['entity']:
                if k['span'] not in j['clusters']:
                    j['clusters'].append(k['span'])
                    j['score'] = min(j['score'],k['score'])
                    break
        else:
            clusters.append({'name':k['entity'],'clusters':[k['span']],'score':k['score']})

    for i in range(len(clusters)):
        if 'score' not in clusters[i]:
            clusters[i]['score'] = -10
        
        for j in range(len(clusters[i]['clusters'])):
            temp = clusters[i]['clusters'][j]
            try:
                clusters[i]['clusters'][j] = [nums[temp[0]],nums[temp[1]-1],question[temp[0]:temp[1]]]
            except:
                return []

    if len(clusters)>0 and clusters[0]['name'] =='':
        clusters[0]['name'] = answer


    return clusters

print("Loading blink")
blink_file = open("all_blink.jsonl").read().strip().split("\n")

print("Loading coref")
coref_file = open("coref_preds.json").read().strip().split("\n")

print("Processing blink,coref")
blink_data = {}
coref_data = {}
for i in blink_file:
    i = json.loads(i)
    blink_data[i['qanta_id']] = i

for i in coref_file:
    i = json.loads(i)
    coref_data[int(i['doc_key'])] = i

blink_file = []
coref_file = []

print("Loading questions")
question_list = json.load(open("mostly_right.json"))['questions']

w = open("baseline_entities.json","w")

print("Going through and converting, there are {} questions".format(len(question_list)))
start = time.time()
for i in range(len(question_list)):
    question_num = int(question_list[i]['qanta_id'])
    
    if question_num in blink_data:
        f = blink_data[question_num]
    else:
        f = {'mentions':[]}

    if question_num in coref_data:
        g = coref_data[question_num]
    
    question = question_list[i]['text'].replace("\'","'").replace("\xa0"," ")
    answer = question_list[i]['page']
    clusters = process(question,answer,f,g)

    w.write("{}\n".format(json.dumps({'clusters':clusters,'qanta_id':question_num})))

    if (i+1)%5000 == 0:
        print(i+1,clusters,time.time()-start)

w.close()

