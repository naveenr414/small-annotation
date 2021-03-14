import glob
import json
from unidecode import unidecode

w = open("all_wiki_new.json","w")
f = open("pagecounts-2020-09-01",encoding='utf-8').read().strip().split("\n")

f = [i for i in f if i.split(" ")[0] == 'en.z']
popularity = {}

for i in f:
    a = i.split(" ")
    popularity[unidecode(a[1].lower().replace(" ","_"))] = int(a[2])

print("Finished reading in pagecounts")

all_files = glob.glob("/fs/clip-quiz/entilzha/qb/data/external/wikipedia/parsed-wiki/*/*")

k = 0
for i in all_files:
    f = open(i,encoding='utf-8').read().strip().split("\n")

    for j in f:
        temp_json = json.loads(j)
        id = int(temp_json['id'])
        name = unidecode(temp_json['title'].lower().replace(" ","_"))
        clean_name = temp_json['title']
        summary = temp_json['text'].split("\n\n")
        if len(summary) == 1:
            summary = summary[0][:500]
        else:
            summary = summary[1][:500]
        popularity_wiki = 0

        if name in popularity:
            popularity_wiki = popularity[name]

        w.write(json.dumps({'id':id,
                            'name':name,
                            'summary':summary,
                            'popularity':popularity_wiki,
                            'clean_name':clean_name}))
        k+=1

        w.write("\n")

        if k%10000 == 0:
            print("At {}".format(k))    
w.close()

print("Done writing")
