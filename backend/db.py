from sqlalchemy import Integer, ForeignKey, Column, Text, create_engine,and_,desc, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import (
    Load,
    sessionmaker,
    scoped_session,
    relationship,
    selectinload,
)
from sqlalchemy.orm.scoping import ScopedSession
from contextlib import contextmanager

import pickle
import time
import json
import unidecode
import datetime


Base = declarative_base()

class Mention(Base):
    __tablename__ = "mention"
    id = Column(Integer, primary_key=True)
    number = Column(Integer)
    user_id = Column(Text(), index=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False,index=True)
    start= Column(Integer)
    end= Column(Integer)
    wiki_page = Column(Text(),index=True)
    content = Column(Text())

class WikiSummary(Base):
    __tablename__ = "wiki"
    id = Column(Integer, primary_key=True)
    title = Column(Text(), nullable=False, index=True)
    text = Column(Text(), nullable=False)
    popularity= Column(Integer, index=True)

class User(Base):
    __tablename__ = "user"
    id = Column(Text(), primary_key=True)
    password = Column(Text(), nullable=False)

class UserEdits(Base):
    __tablename__ = "user_edits"
    id = Column(Integer, primary_key=True,autoincrement=True)
    user_id = Column(Text(),index=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False,index=True)
    start_time = Column(DateTime())
    update_time = Column(DateTime())

class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True)
    category= Column(Text(), index=True)
    sub_category = Column(Text(), index=True)
    question= Column(Text(), index=True)
    answer = Column(Text(), index=True)
    wiki_answer = Column(Text(), ForeignKey("wiki.title"),index=True)
    difficulty = Column(Text(),index=True)
    tournament = Column(Text(), index=True)
    year = Column(Integer, index=True)

class Database:
    def __init__(self, find_questions=True):
        self._engine = create_engine(
            # Separate name to avoid confusing it with the unmodified qanta db
            "sqlite:///quel_db.sqlite3"
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine

    @property
    @contextmanager
    def _session_scope(self) -> ScopedSession:
        session = scoped_session(sessionmaker(bind=self._engine))
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def create_all(self):
        Base.metadata.create_all(self._engine, checkfirst=True)

    def drop_all(self):
        Base.metadata.drop_all(self._engine)

    def reset_all(self):
        self.drop_all()
        self.create_all()

    def reset_and_populate(self):
        print("Resetting and populating database")
        self.drop_all()
        print("Finished dropping")
        self.create_all()
        print("Finished creating")
        self.populate()
        print("Finished populating")

    def populate(self):
        with self._session_scope as session:
            # Mentions
            print("Populating mentions")
            w = open("baseline_entities.json")
            i = 0
            start = time.time()
            objects = []
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())

                j = 2
                for mention in wiki_obj['clusters']:
                    for span in mention['clusters']:
                            objects.append({'user_id':'system','question_id':wiki_obj['qanta_id'],'start':span[0],
                                            'end':span[1],'wiki_page':mention['name'],'number':j,'content':span[2]})
                    j+=1
                i+=1
                if i%10000 == 0:
                    print(i,time.time()-start,len(objects))                
                    session.bulk_insert_mappings(Mention,objects)
                    objects = []
            session.bulk_insert_mappings(Mention,objects)
            print(len(objects))
            print("Mentions time {}".format(time.time()-start))

            # Load in qanta questions
            start = time.time()
            dev = json.load(open("qanta.dev.2018.04.18.json"))['questions']
            test = json.load(open("qanta.test.2018.04.18.json"))['questions']
            train = json.load(open("qanta.train.2018.04.18.json"))['questions']

            all_qanta = train+dev+test

            objects = []
            for i in range(len(all_qanta)):
                objects.append({'id':all_qanta[i]['qanta_id'], 'question': all_qanta[i]['text'], 'category': all_qanta[i]['category'],'wiki_answer':all_qanta[i]['page'].replace("_", " "),
                                'sub_category': all_qanta[i]['subcategory'],'difficulty': all_qanta[i]['difficulty'],'tournament': all_qanta[i]['tournament'],
                                'year': all_qanta[i]['year'],'answer':all_qanta[i]['answer']})
                if i%100000 == 0:
                    print(i,time.time()-start)   
                if i%100000 == 0:
                    session.bulk_insert_mappings(Question,objects)
                    objects = []
            session.bulk_insert_mappings(Question,objects)
            objects = []
            dev = []
            test = []
            train = []
            print("Qanta time {}".format(time.time()-start))
            
            # Wiki
            w = open("all_wiki.json")
            start = time.time()
            
            objects = []
            i = 0
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())
                objects.append({'id':int(wiki_obj['id']),'title':wiki_obj['name'],'text':wiki_obj['summary'],'popularity':wiki_obj['popularity']})
                i+=1

                if i%100000 == 0:
                    print(i,time.time()-start)                
                    session.bulk_insert_mappings(WikiSummary,objects)
                    objects = []
            session.bulk_insert_mappings(WikiSummary,objects)
            print("Wiki time {}".format(time.time()-start))


            session.commit()
            print("Commit time {}".format(time.time()-start))

    def user_starts(self,user_id,question_id):
        with self._session_scope as session:
            t = datetime.datetime.now()
            if session.query(UserEdits).filter(and_(UserEdits.user_id == user_id,UserEdits.question_id == question_id)).count() == 0:
                session.bulk_insert_mappings(UserEdits,[{'id': None, 'user_id':user_id,'question_id':question_id,'start_time':t,'update_time': t}])

            return True

    def user_updates(self,user_id,question_id):
        with self._session_scope as session:
            t = datetime.datetime.now()
            edit = session.query(UserEdits).filter(and_(UserEdits.user_id == user_id,UserEdits.question_id == question_id)).limit(1)
            start_time = [i.start_time for i in edit][0]
            session.bulk_insert_mappings(UserEdits,[{'user_id':user_id,'question_id':question_id,'start_time':start_time,'update_time':t}])
            return True

    def get_autocorrect(self,word):
        start = time.time()
        with self._session_scope as session:
            word = word.replace(" ", "_")
            upper_bound = word.lower()+"z"
            if(len(word)<=3):
                end_count = 0
                count_time = 0
                count = 5
                results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).limit(5)
            else:
                count = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).count()
                if count>1000:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).limit(5)
                else:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).order_by(desc(WikiSummary.popularity)).limit(5)

        names = [i.title for i in results]
        summaries = [i.text for i in results]
        print("Took {} time with {} count {}".format(time.time()-start,count,word))
        return [(names[i].replace("&amp;","&"),summaries[i]) for i in range(len(names))]

    def get_mentions_by_user(self,user,question_num):
        with self._session_scope as session:
            question_num = int(question_num)

            results = session.query(Mention).filter(and_(Mention.user_id == user,
                                                         Mention.question_id==question_num))
            
            results = [{'start':i.start,'end':i.end,'wiki_page':i.wiki_page,'content':i.content,'number':i.number} for i in results]
            print(results)
            return results

    def remove_mentions(self,user,question_num):
        with self._session_scope as session:
            results = session.query(Mention).filter(and_(Mention.user_id == user,
                                                         Mention.question_id==question_num)).delete()
            session.commit()
            return True
            
    def insert_mentions(self,mentions):
        with self._session_scope as session:
            session.bulk_insert_mappings(Mention,mentions)
            session.commit()
            return True

    def get_mentions(self):
        with self._session_scope as session:
            results = session.query(Mention)
            return [{'start':i.start,'end':i.end,'wiki_page':i.wiki_page,
                     'content':i.content,'user_id':i.user_id,'question_id':i.question_id} for i in results]

    def get_edits(self):
        with self._session_scope as session:
            results = session.query(UserEdits)
            return [{'start_time':i.start_time,'update_time':i.update_time,'user_id':i.user_id,
                     'question_id':i.question_id} for i in results]

    def get_question(self,question_num):
        with self._session_scope as session:
            results = session.query(Question).filter(Question.id == question_num)
            results = [{'question':unidecode.unidecode(i.question),'answer':i.answer,'wiki_answer':i.wiki_answer,
                        'sub_category':i.sub_category, 'category':i.category,
                        'difficulty': i.difficulty, 'year':i.year,'tournament':i.tournament} for i in results]
            results.append({})

            return results[0]

    def get_id(self,word):
        start = time.time()
        with self._session_scope as session:
            results = session.query(WikiSummary).filter(WikiSummary.title==word).limit(1)

        return [i.id for i in results]

    def get_all_useredits(self,username):
        with self._session_scope as session:
            edits = session.query(UserEdits).filter(UserEdits.user_id == username)
            results = [{'question_id':i.question_id,'start_time':i.start_time,'update_time':i.update_time} for i in edits]
            return results

    def insert_email_password(self,username,password):
        with self._session_scope as session:
            if session.query(User).filter(User.id==username).count()>0:
                return False
            print("Inserted!")
            session.bulk_insert_mappings(User,[{'id':username,'password':password}])
            return True

    def get_password(self,username):
        with self._session_scope as session:
            passwords = session.query(User).filter(User.id==username)
            passwords = [i for i in passwords]
            if len(passwords) == 0:
                return None
            print("Searching for passwords")
            return passwords[0].password
