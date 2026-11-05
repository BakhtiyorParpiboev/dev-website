"""Render two 28-second brand films using Pillow, NumPy, and FFmpeg.

FFMPEG and ROBOTO_FONT may be supplied as environment variables.
No site files, application data, or network services are modified.
"""
from pathlib import Path
from functools import lru_cache
import math, os, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
FFMPEG = os.environ.get('FFMPEG', '/tmp/bakhtiyor-ffmpeg/ffmpeg')
FONT = os.environ.get('ROBOTO_FONT', '/opt/android-studio/plugins/design-tools/resources/layoutlib/data/fonts/RobotoStatic-Regular.ttf')
BG = '#fcfdfc'
INK = '#17211c'
GREEN = '#367f5c'
MUTED = '#66736b'
FPS, DURATION = 30, 28

@lru_cache(None)
def font(size): return ImageFont.truetype(FONT, size)

def ease(v):
    v = max(0, min(1, v))
    return 1 - (1-v)**3

def text(draw, x, y, value, size, fill=INK, anchor='lt'):
    draw.text((x, y), value, font=font(size), fill=fill, anchor=anchor, spacing=12)

def pill(draw, box, label, size=24, dark=False):
    draw.rounded_rectangle(box, radius=(box[3]-box[1])/2, fill=INK if dark else '#edf5f0')
    text(draw, (box[0]+box[2])/2, (box[1]+box[3])/2, label, size, '#ffffff' if dark else GREEN, 'mm')

def photo(canvas, name, box, radius=24, fit=False):
    x,y,w,h=map(int,box)
    im=Image.open(ASSETS/name).convert('RGB')
    im=ImageOps.fit(im,(w,h),method=Image.Resampling.LANCZOS) if fit else ImageOps.pad(im,(w,h),method=Image.Resampling.LANCZOS,color='#f1f4f1')
    mask=Image.new('L',(w,h));ImageDraw.Draw(mask).rounded_rectangle((0,0,w,h),radius=radius,fill=255)
    canvas.paste(im,(x,y),mask)

def icon(draw, cx, cy, kind, s=1):
    def line(points): draw.line([(cx+x*s,cy+y*s) for x,y in points],fill=GREEN,width=max(2,int(3*s)),joint='curve')
    if kind == 0:
        for dy in [-24,0,24]: line([(-65,dy),(0,dy+24),(65,dy),(0,dy-24),(-65,dy)])
    elif kind == 1:
        for dx,dy in [(-26,-15),(30,22)]:
            draw.rounded_rectangle((cx+(dx-40)*s,cy+(dy-25)*s,cx+(dx+40)*s,cy+(dy+25)*s),radius=10*s,outline=GREEN,width=3)
            line([(dx-22,dy-5),(dx+22,dy-5)]);line([(dx-22,dy+8),(dx+9,dy+8)])
    elif kind == 2:
        line([(0,-30),(0,0),(-60,0),(-60,30)]);line([(0,0),(60,0),(60,30)]);line([(0,0),(0,30)])
        for xx,yy in [(0,-42),(-60,40),(0,40),(60,40)]:
            draw.rounded_rectangle((cx+(xx-21)*s,cy+(yy-12)*s,cx+(xx+21)*s,cy+(yy+12)*s),radius=5*s,outline=GREEN,width=3)
    else:
        for yy in [-36,0,36]:
            draw.rounded_rectangle((cx-65*s,cy+(yy-12)*s,cx+65*s,cy+(yy+12)*s),radius=6*s,outline=GREEN,width=3)
            draw.ellipse((cx-48*s,cy+(yy-3)*s,cx-42*s,cy+(yy+3)*s),fill=GREEN)
            line([(-25,yy),(42,yy)])

def make_scene(n,w,h):
    v=h>w
    im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
    cx=w/2
    if n == 0:
        text(d,cx,410 if v else 280,'PARPIBOEV BAKHTIYOR',27 if v else 28,MUTED,'mt')
        if v:
            text(d,cx,535,'Software',112,INK,'mt');text(d,cx,665,'Engineer',112,INK,'mt')
            text(d,cx,860,'Ideas. Code. Real experiences.',36,MUTED,'mt')
            pill(d,(340,1010,740,1080),'bakhtiyor.me',29)
        else:
            text(d,cx,370,'Software Engineer',120,INK,'mt')
            text(d,cx,550,'Ideas. Code. Real experiences.',38,MUTED,'mt')
            pill(d,(760,665,1160,735),'bakhtiyor.me',28)
    elif n == 1:
        if v:
            photo(im,'portrait.png',(260,260,560,570),34,True)
            text(d,100,925,'Meet Bakhtiyor.',76)
            text(d,100,1050,'Turning complex problems',43,MUTED)
            text(d,100,1115,'into useful experiences.',43,MUTED)
            pill(d,(100,1260,590,1330),'Full-stack + AI',29)
        else:
            photo(im,'portrait.png',(1120,185,610,660),36,True)
            text(d,170,310,'Meet Bakhtiyor.',92)
            text(d,175,470,'Turning complex problems',43,MUTED)
            text(d,175,535,'into useful experiences.',43,MUTED)
            pill(d,(175,670,615,740),'Full-stack + AI',29)
    elif n == 2:
        text(d,100 if v else 170,245 if v else 190,'From idea to interface.',72 if v else 85)
        text(d,100 if v else 175,350 if v else 310,'Thoughtful software, end to end.',35 if v else 38,MUTED)
        names=['Full-stack applications','AI integrations','Software design','Backend architecture']
        for i,name in enumerate(names):
            if v:
                x,y,cw,ch=100,495+i*205,880,175
                d.rounded_rectangle((x,y,x+cw,y+ch),radius=22,fill='#f0f5f1',outline='#dce8df',width=2)
                icon(d,x+110,y+85,i,.72);text(d,x+210,y+62,name,37)
            else:
                x,y,cw,ch=170+i*405,445,375,330
                d.rounded_rectangle((x,y,x+cw,y+ch),radius=24,fill='#f0f5f1',outline='#dce8df',width=2)
                icon(d,x+cw/2,y+120,i,1.1);text(d,x+cw/2,y+238,name,29,INK,'mt')
    elif n in [3,4,5]:
        i=n-3
        names=['Dojang','mdb-academy','ai-pass']
        files=['dojang.webp','mdb-academy.webp','ai-pass.webp']
        desc=['Stay. Study. Graduate.','Learn coding in Uzbek.','Explore frontier AI models.']
        tags=['Full-stack  /  AI  /  Next.js','AI  /  React  /  Express','TypeScript  /  Credit-based AI']
        if v:
            text(d,90,270,f'SELECTED WORK   /   0{i+1}',26,GREEN)
            text(d,90,375,names[i],87)
            text(d,90,500,desc[i],39,MUTED)
            photo(im,files[i],(65,655,950,570),28)
            text(d,90,1315,tags[i],28,GREEN)
            text(d,90,1400,'Explore it at bakhtiyor.me',32,MUTED)
        else:
            text(d,120,280,f'SELECTED WORK   /   0{i+1}',24,GREEN)
            text(d,120,385,names[i],78)
            text(d,120,505,desc[i],34,MUTED)
            text(d,120,650,tags[i],24,GREEN)
            photo(im,files[i],(755,240,1050,595),26)
    elif n == 6:
        text(d,cx,260 if v else 150,'Explore the portfolio.',72 if v else 78,INK,'mt')
        text(d,cx,370 if v else 260,'Projects. Writing. What’s next.',35,MUTED,'mt')
        if v:
            # A faithful hero crop; native video text remains large and readable.
            src=Image.open(ASSETS/'home.png').crop((180,80,1080,635))
            src.save(ASSETS/'home-detail.png')
            photo(im,'home-detail.png',(70,540,940,650),28)
            pill(d,(200,1330,880,1405),'Built with care. Open to explore.',29)
        else:
            photo(im,'home.png',(430,365,1060,597),24)
    else:
        text(d,cx,510 if v else 290,'LET’S BUILD SOMETHING.',27 if v else 28,GREEN,'mt')
        text(d,cx,665 if v else 420,'bakhtiyor.me',108 if v else 145,INK,'mt')
        text(d,cx,845 if v else 625,'Explore the work. Start a conversation.',35 if v else 38,MUTED,'mt')
        pill(d,(310,1040,770,1130) if v else (745,745,1175,830),'Let’s talk',32,True)
    return im

def soundtrack():
    sr=48000;n=sr*DURATION;t=np.arange(n)/sr
    out=np.zeros((n,2),dtype=np.float64)
    # Original synthesized instrumental: warm pads, light arpeggio, soft pulse.
    chords=[[48,55,59,62],[45,52,55,59],[53,60,64,67],[55,62,65,69]]
    def add(start,dur,note,amp,pan=0,pluck=False):
        a=int(start*sr);b=min(n,a+int(dur*sr));tt=np.arange(b-a)/sr
        freq=440*2**((note-69)/12)
        env=(1-np.exp(-tt/(.012 if pluck else .35)))*np.exp(-tt/(.65 if pluck else 5))
        env*=np.minimum(1,np.maximum(0,(dur-tt)/(.16 if pluck else .7)))
        sig=(np.sin(2*np.pi*freq*tt)+.22*np.sin(2*np.pi*freq*2*tt)+.08*np.sin(2*np.pi*freq*3*tt))*env*amp
        out[a:b,0]+=sig*math.sqrt((1-pan)/2);out[a:b,1]+=sig*math.sqrt((1+pan)/2)
    for j in range(8):
        st=j*3.5;ch=chords[j%4]
        for k,note in enumerate(ch): add(st,4.4,note,.055,(k-1.5)/3)
        for k in range(8): add(st+k*.4375,1.4,ch[[0,2,1,3,2,1,3,2][k]]+24,.046,(-1)**k*.35,True)
    for st in np.arange(0,26.3,.875):
        a=int(st*sr);tt=np.arange(int(.22*sr))/sr
        sig=np.sin(2*np.pi*(58*tt+2*(1-np.exp(-tt*30))))*np.exp(-tt*23)*.085
        out[a:a+len(tt)]+=sig[:,None]
    out*=np.minimum(1,t/.8)[:,None]*np.minimum(1,(DURATION-t)/2)[:,None]
    out=np.tanh(out*1.4)*.72
    with wave.open(str(ROOT/'soundtrack.wav'),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((out*32767).astype('<i2').tobytes())

CUTS=[0,4,8,13,15.7,18.4,21.1,24,28]

def render(kind, preview=False):
    vertical=kind=='vertical';w,h=(1080,1920) if vertical else (1920,1080)
    scenes=[make_scene(i,w,h) for i in range(8)]
    rng=random.Random(18)
    particles=[(rng.random()*w,rng.random()*h,rng.uniform(10,25),rng.uniform(-.8,.8),rng.choice(['#a7b5e1','#b4a2d6','#8faedb','#c7bde8','#dba7bd'])) for _ in range(110)]
    def frame(t):
        im=Image.new('RGB',(w,h),BG);d=ImageDraw.Draw(im)
        for px,py,ll,angle,color in particles:
            x=(px+math.sin(t*.24+py)*22+t*6)%w;y=(py+math.cos(t*.2+px)*18)%h
            if w*.16<x<w*.84 and h*.19<y<h*.82: continue
            d.line((x,y,x+math.cos(angle+t*.08)*ll,y+math.sin(angle+t*.08)*ll),fill=color,width=2)
        text(d,72,90 if vertical else 54,'bakhtiyor.me',25,INK)
        text(d,w-72,90 if vertical else 54,'PORTFOLIO',19,MUTED,'rt')
        idx=next(i for i in range(8) if CUTS[i]<=t<CUTS[i+1])
        local=t-CUTS[idx];remain=CUTS[idx+1]-t
        enter=ease(local/.7);alpha=enter*min(1,remain/.3) if idx<7 else enter
        dy=int((1-enter)*38)
        layer=scenes[idx]
        if alpha<.999:
            layer=layer.copy();layer.putalpha(layer.getchannel('A').point(lambda a:int(a*alpha)))
        im.paste(layer,(0,dy),layer)
        # Small, editorial chapter line and progress indicator.
        d=ImageDraw.Draw(im)
        labels=['INTRODUCTION','ABOUT','EXPERTISE','SELECTED WORK','SELECTED WORK','SELECTED WORK','EXPLORE','LET’S TALK']
        foot=h-175 if vertical else h-65
        text(d,72,foot,labels[idx],19,MUTED)
        d.line((w-290,foot+12,w-72,foot+12),fill='#dce5de',width=3)
        d.line((w-290,foot+12,w-290+218*t/DURATION,foot+12),fill=GREEN,width=3)
        return im
    if preview:
        thumbs=[]
        for i,t in enumerate([2,6,10.5,14.3,17,19.8,22.5,26]):
            im=frame(t);im.save(ROOT/f'{kind}-frame-{i+1}.jpg',quality=90)
            thumbs.append(ImageOps.contain(im,(324,576) if vertical else (480,270)))
        tw,th=thumbs[0].size;sheet=Image.new('RGB',(tw*4,th*2),'#e4e9e5')
        for i,im in enumerate(thumbs):sheet.paste(im,((i%4)*tw,(i//4)*th))
        sheet.save(ROOT/f'{kind}-storyboard.jpg',quality=92)
        return
    env=os.environ.copy();env['LD_LIBRARY_PATH']=str(Path(FFMPEG).parent)+':'+env.get('LD_LIBRARY_PATH','')
    cmd=[FFMPEG,'-y','-hide_banner','-loglevel','warning','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(FPS),'-i','-','-i',str(ROOT/'soundtrack.wav'),'-c:v','libopenh264','-b:v','8M','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(DURATION),'-movflags','+faststart',str(ROOT/f'bakhtiyor-intro-{kind}.mp4')]
    with open(ROOT/f'{kind}-render.log','w') as log:
        p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log,env=env)
        for i in range(FPS*DURATION):
            p.stdin.write(frame(i/FPS).tobytes())
            if i%(FPS*4)==0:print(f'{kind}: {i//FPS}/{DURATION}s',flush=True)
        p.stdin.close()
        if p.wait()!=0: raise RuntimeError((ROOT/f'{kind}-render.log').read_text())
    print(f'Finished {kind}',flush=True)

if __name__=='__main__':
    preview='--preview' in sys.argv
    if not preview:soundtrack()
    kinds=[k for k in ['widescreen','vertical'] if k in sys.argv] or ['widescreen','vertical']
    for kind in kinds:render(kind,preview)
