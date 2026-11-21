"""Fetch the canonical service icon and verify its pinned digest before packaging."""
from hashlib import sha256
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
with urlopen("https://cdn.acedata.cloud/acemusic-icon-52deddfc87b9.png", timeout=30) as response:
    data = response.read()
if sha256(data).hexdigest() != "52deddfc87b9adf1a215e4c69395c65890701ce87a5c7c084cd91b684c46ba35":
    raise RuntimeError("Unexpected ACE Music icon digest")
dest = ROOT / "logo.png"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_bytes(data)
