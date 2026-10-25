# 사용법: pip install edge-tts  →  python gen_audio.py   (사이트 폴더 안에서 실행)
import asyncio,json,os,edge_tts
M=json.load(open('audio/manifest.json',encoding='utf-8'))
sem=asyncio.Semaphore(6)
async def one(m):
    p='audio/'+m['file']
    if os.path.exists(p) and os.path.getsize(p)>500: return
    async with sem:
        for _ in range(3):
            try:
                await edge_tts.Communicate(m['text'],m['voice']).save(p);return
            except Exception as e: await asyncio.sleep(2)
        print('FAIL',m['file'],m['text'][:40])
async def main():
    await asyncio.gather(*[one(m) for m in M]);print('done',len(os.listdir('audio')))
asyncio.run(main())
