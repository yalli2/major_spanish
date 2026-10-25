import sys,os,json,hashlib,importlib
sys.path.insert(0,'src')
VOICES={'f':'es-ES-ElviraNeural','m':'es-ES-AlvaroNeural','mx':'es-MX-JorgeNeural','m2':'es-CO-GonzaloNeural','f2':'es-MX-DaliaNeural','f3':'es-CO-SalomeNeural'}
man={}
def au(text,v):
    if not text: return None
    text=text.replace('____','…').strip()
    h=hashlib.sha1((v+'|'+text).encode()).hexdigest()[:12]
    man[h]={'file':f'{h}.mp3','voice':VOICES[v],'text':text}
    return h
os.makedirs('data',exist_ok=True);os.makedirs('audio',exist_ok=True)
index=[]
for n in range(1,13):
    L=importlib.import_module(f'L{n:02d}').L
    for d in L['dialogs']:
        for l in d['lines']: l['au']=au(l['es'],l['v'])
    for r in L['readings']: r['au']=au(r['text'],r['v'])
    for w in L['vocab']: w['au']=au(w['es'],'f')
    cnt=0
    for e in L['exercises']:
        for it in e['items']:
            cnt+=1
            if it['t']=='fill' and it['q'].count('____')==0:
                import re
                it['q']=re.sub(r'\(([^)]*)\)',lambda m:'____ ('+m.group(1)+')',it['q'],count=len(it['a']))
            if it['t']=='fill': it['au']=au(it['s'],it['v'])
            else: it['au']=au(it['s'],it['v'])
            if it['t']=='fill': it['a']=[x for x in it['a']]
    L['count']=cnt
    open(f'data/lesson{n:02d}.js','w',encoding='utf-8').write('window.LESSONS=window.LESSONS||{};window.LESSONS[%d]=%s;'%(n,json.dumps(L,ensure_ascii=False)))
    index.append({'n':n,'es':L['es'],'ko':L['ko'],'goals':L['goals'],'count':cnt,'ex':[{'id':e['id'],'title':e['title'],'n':len(e['items'])} for e in L['exercises']],'vocab':len(L['vocab'])})
open('data/index.js','w',encoding='utf-8').write('window.INDEX=%s;'%json.dumps(index,ensure_ascii=False))
json.dump(list(man.values()),open('audio/manifest.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print(len(man),'audio clips;',sum(i['count'] for i in index),'items')
