import json,os,urllib.request,io
from PIL import Image
IDS=["asphalt_02","concrete_floor_02","corrugated_iron_02","box_profile_metal_sheet","rusty_painted_metal","wood_planks_dirt","metal_plate_02"]
MAPS={"Diffuse":"diff","nor_gl":"nor","Rough":"rough"}
OUT="public/media/pbr"
def get(u):
    r=urllib.request.Request(u,headers={"User-Agent":"curl/8"})
    return urllib.request.urlopen(r,timeout=60).read()
tot=0
for i in IDS:
    f=json.loads(get(f"https://api.polyhaven.com/files/{i}"))
    for m,short in MAPS.items():
        url=f[m]["1k"]["jpg"]["url"]
        img=Image.open(io.BytesIO(get(url))).convert("RGB")
        img.thumbnail((768,768),Image.LANCZOS)
        p=f"{OUT}/{i}-{short}.jpg"
        img.save(p,"JPEG",quality=87,optimize=True)
        sz=os.path.getsize(p); tot+=sz
        print(f"{i}-{short}.jpg {sz//1024}KB {img.size}")
print("total",tot//1024,"KB")
