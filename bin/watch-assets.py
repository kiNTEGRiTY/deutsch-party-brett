import os, time, json

def build_manifest():
    bg_dir = "assets/img/backgrounds"
    extracted_dir = "assets/img/extracted"

    backgrounds = []
    
    # Only scan backgrounds dir exactly as the user requested
    if os.path.exists(bg_dir):
        for f in sorted(os.listdir(bg_dir)):
            # Include .heic for Apple ecosystem compatibility
            if f.lower().endswith((".jpg", ".jpeg", ".png", ".heic")):
                backgrounds.append({"id": f, "url": f"assets/img/backgrounds/{f}", "name": f"HG: {f[:12]}"})

    # Find extracted characters
    characters = []
    if os.path.exists(extracted_dir):
        for idx, f in enumerate(sorted(os.listdir(extracted_dir))):
            if f.endswith("_3d.png"):
                characters.append({
                    "id": f"custom_{idx}",
                    "name_de": f"Figur {idx+1}",
                    "spriteImg": f"assets/img/extracted/{f}"
                })

    manifest = f"export const BACKGROUNDS = {json.dumps(backgrounds, indent=2)};\nexport const EXTRACTED_CHARS = {json.dumps(characters, indent=2)};\n"
    with open("js/asset-manifest.js", "w") as out:
        out.write(manifest)

if __name__ == "__main__":
    print("Restarting dedicated asset watcher...")
    last_mtime = 0
    build_manifest()
    while True:
        try:
            mtime = 0
            if os.path.exists("assets/img/backgrounds"):
                mtime = max([os.path.getmtime(os.path.join("assets/img/backgrounds", f)) for f in os.listdir("assets/img/backgrounds")] + [0])
            if mtime > last_mtime:
                build_manifest()
                last_mtime = mtime
        except Exception as e:
            pass
        time.sleep(2)
