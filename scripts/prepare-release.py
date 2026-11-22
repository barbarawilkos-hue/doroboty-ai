#!/usr/bin/env python3
"""Package only the built public demo. Never deploy or overwrite a release."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
release = json.loads((dist / "release.json").read_text())
files = sorted(p for p in dist.rglob("*") if p.is_file())
assert (dist / "index.html").is_file() and (dist / "assets").is_dir(), "Build first"
assert release["buildId"] and release["appVersion"] and release["builtAt"]
for file in files:
    relative = file.relative_to(dist)
    assert not file.is_symlink(), "Do not publish symlinks"
    assert not any(part in {".git", "src", "node_modules", "docs"} or part.startswith(".env") for part in relative.parts)
suffix = "".join(c for c in release["builtAt"] if c.isdigit())
target = root / "artifacts" / "releases" / f"{release['buildId'][:16]}-{suffix}"
target.mkdir(parents=True, exist_ok=False)
archive = target / "doroboty-demo.zip"
with zipfile.ZipFile(archive, "x", compression=zipfile.ZIP_DEFLATED) as bundle:
    for file in files:
        bundle.write(file, file.relative_to(dist))
manifest = dict(release, archiveSha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
                files={str(p.relative_to(dist)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files})
(target / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert set(bundle.namelist()) == set(manifest["files"])
    for name, expected in manifest["files"].items():
        assert hashlib.sha256(bundle.read(name)).hexdigest() == expected
print(json.dumps({"archive": str(archive), "manifest": str(target / "manifest.json"),
                  "buildId": release["buildId"], "files": len(files)}))
