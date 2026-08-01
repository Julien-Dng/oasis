#!/usr/bin/env python3
"""Generate the two approved Oasis master plates with Gemini Nano Banana Pro.

The API key is read only from GEMINI_API_KEY and sent as an HTTP header. It is
never printed or written. The workflow performs exactly two requests with no
automatic retry: A is text-to-image, then B edits A as an image input.
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROMPTS_FILE = ROOT / "tools" / "prompts" / "oasis-assets.md"
GENERATED_DIR = ROOT / "assets" / "images" / "oasis" / "generated"
OPTIMIZED_DIR = ROOT / "assets" / "images" / "oasis" / "optimized"
MODEL = "gemini-3-pro-image"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
MASTER_A = "master-a-desert-night"
MASTER_B = "master-b-oasis-light"
EXPECTED_SIZE = (5504, 3072)


def parse_prompts(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise RuntimeError(f"Fichier de prompts introuvable : {path}")

    source = path.read_text(encoding="utf-8")
    prompts = {
        master_id: prompt.strip()
        for master_id, prompt in re.findall(
            r"<!-- master: ([a-z0-9-]+) -->\s*```prompt\s*(.*?)\s*```",
            source,
            re.DOTALL,
        )
    }
    missing = [name for name in (MASTER_A, MASTER_B) if name not in prompts]
    if missing:
        raise RuntimeError("Prompts manquants : " + ", ".join(missing))
    return prompts


def request_image(prompt: str, api_key: str, reference: bytes | None = None) -> bytes:
    parts: list[dict[str, object]] = [{"text": prompt}]
    if reference is not None:
        parts.insert(
            0,
            {
                "inlineData": {
                    "mimeType": "image/png",
                    "data": base64.b64encode(reference).decode("ascii"),
                }
            },
        )

    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "4K"},
        },
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        error_text = exc.read().decode("utf-8", errors="replace")
        try:
            error_message = json.loads(error_text).get("error", {}).get("message")
        except json.JSONDecodeError:
            error_message = None
        raise RuntimeError(
            f"Gemini a refusé la requête HTTP {exc.code}: "
            f"{error_message or 'réponse non exploitable'}"
        ) from None
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Connexion à Gemini impossible : {exc.reason}") from None

    for candidate in result.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            inline_data = part.get("inlineData") or part.get("inline_data")
            if inline_data and inline_data.get("data"):
                return base64.b64decode(inline_data["data"])

    raise RuntimeError("Gemini n’a renvoyé aucune image exploitable.")


def normalize_png(image_bytes: bytes, destination: Path) -> tuple[int, int]:
    with Image.open(io.BytesIO(image_bytes)) as image:
        image.load()
        size = image.size
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.save(destination, format="PNG", optimize=True)
    return size


def optimize_webp(source: Path, destination: Path, quality: int = 84) -> None:
    cwebp = shutil.which("cwebp")
    if not cwebp:
        return
    subprocess.run(
        [
            cwebp,
            "-quiet",
            "-mt",
            "-m",
            "6",
            "-q",
            str(quality),
            str(source),
            "-o",
            str(destination),
        ],
        check=True,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Génère les deux maîtresses Oasis avec exactement deux appels."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Affiche les prompts et la configuration sans contacter Gemini.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    prompts = parse_prompts(PROMPTS_FILE)

    print(f"Modèle : {MODEL}")
    print("Format : 16:9, 4K (5504 × 3072 attendu)")
    print("Appels API prévus : 2 (aucun retry automatique)")
    if args.dry_run:
        for master_id in (MASTER_A, MASTER_B):
            print(f"\n--- {master_id} ---\n{prompts[master_id]}")
        return 0

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("Erreur : GEMINI_API_KEY est absente de l’environnement.", file=sys.stderr)
        return 2

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)
    path_a = GENERATED_DIR / f"{MASTER_A}.png"
    path_b = GENERATED_DIR / f"{MASTER_B}.png"

    try:
        print(f"[1/2] Génération de {MASTER_A}…")
        bytes_a = request_image(prompts[MASTER_A], api_key)
        size_a = normalize_png(bytes_a, path_a)
        print(f"  Enregistrée : {path_a.relative_to(ROOT)} — {size_a[0]} × {size_a[1]}")
        if size_a != EXPECTED_SIZE:
            raise RuntimeError(
                f"Résolution inattendue pour A : {size_a[0]} × {size_a[1]}; "
                "le second appel est annulé."
            )

        print(f"[2/2] Édition de A vers {MASTER_B}…")
        bytes_b = request_image(prompts[MASTER_B], api_key, path_a.read_bytes())
        size_b = normalize_png(bytes_b, path_b)
        print(f"  Enregistrée : {path_b.relative_to(ROOT)} — {size_b[0]} × {size_b[1]}")
        if size_b != EXPECTED_SIZE:
            raise RuntimeError(
                f"Résolution inattendue pour B : {size_b[0]} × {size_b[1]}."
            )

        optimize_webp(path_a, OPTIMIZED_DIR / f"{MASTER_A}.webp")
        optimize_webp(path_b, OPTIMIZED_DIR / f"{MASTER_B}.webp")
    except Exception as exc:
        print(f"Erreur : {exc}", file=sys.stderr)
        return 3

    print("Génération terminée. Les deux maîtresses sont prêtes pour validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
