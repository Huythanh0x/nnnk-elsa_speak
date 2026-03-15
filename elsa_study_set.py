import argparse
import json
import os
import sys
from typing import Dict, List, Optional, Tuple

import requests


USER_AGENT = "elsa-google-play/7.2.9"
BASE_URL = "https://pool.elsanow.io"

# This is a placeholder – update this to the real login URL you observed
DEFAULT_LOGIN_URL = f"{BASE_URL}/REPLACE_WITH_LOGIN_PATH"

# This matches the example in readme.md
STUDY_SET_URL = f"{BASE_URL}/clubs-server/v2/study_sets"


def login_and_get_tokens(
    login_url: str,
    email: str,
    password: str,
) -> Tuple[str, str, str]:
    """
    Log in and return (x_access_token, x_session_token, author_id).

    NOTE: The exact request body and response fields depend on the real API.
    You will likely need to adjust the `payload` and the keys used to read
    tokens from `data` to match what you captured from the app.
    """
    payload: Dict[str, str] = {
        "email": email,
        "password": password,
    }

    headers = {
        "user-agent": USER_AGENT,
        "content-type": "application/json; charset=UTF-8",
        "accept-encoding": "gzip",
    }

    resp = requests.post(login_url, json=payload, headers=headers, timeout=30)
    print(f"[login] status={resp.status_code}")
    print(f"[login] response body={resp.text}")
    resp.raise_for_status()
    data = resp.json()

    # Map real response fields to the headers we need later.
    # From your sample response we have:
    # {
    #   "message": "...",
    #   "profile": { "user_id": "...", ... },
    #   "session": "...",
    #   "refresh_token": "..."
    # }
    #
    # We will:
    # - use `refresh_token` as x-access-token
    # - use `session` as x-session-token
    # - use `profile.user_id` as author_id
    profile = data.get("profile", {})
    author_id = profile.get("user_id")
    x_session_token = data.get("session")
    x_access_token = data.get("refresh_token")

    print(f"[login] parsed author_id={author_id}")
    print(f"[login] parsed x_session_token (truncated)={str(x_session_token)[:32]}...")
    print(f"[login] parsed x_access_token (truncated)={str(x_access_token)[:32]}...")

    return x_access_token, x_session_token, author_id


def build_phrase_object(
    phrase_text: str,
    translations: Optional[Dict[str, str]] = None,
    audio_url: Optional[str] = None,
) -> Dict:
    """
    Convert a plain text phrase into the JSON shape used in readme.md.

    This "computes" each phrase by:
    - splitting into words
    - building a transcript entry per word
    IPA and detailed phonemes are left empty so you can fill them if you know them.
    """
    cleaned = phrase_text.strip()
    tokens = cleaned.split()

    transcript = [
        {
            "text": token,
            "trans": ["-"],
            "transcript_ipa": "",
        }
        for token in tokens
    ]

    return {
        "audio_url": audio_url or "",
        "definition": "",
        "external_id": "",
        "name": cleaned,
        "transcript": transcript,
        "translation": translations or {},
    }


def create_study_set(
    name: str,
    author_id: str,
    phrases: List[Dict],
    x_access_token: str,
    x_session_token: str,
) -> Dict:
    """
    Call the study_sets API using the same headers/body shape as in readme.md.
    """
    headers = {
        "user-agent": USER_AGENT,
        "x-access-token": x_access_token,
        "x-session-token": x_session_token,
        "content-type": "application/json; charset=UTF-8",
        "accept-encoding": "gzip",
    }

    body = {
        "author_id": author_id,
        "is_public": False,
        "name": name,
        "phrases": phrases,
        "tag_id": "other",
    }

    resp = requests.post(STUDY_SET_URL, headers=headers, json=body, timeout=30)
    print(f"[study_set] status={resp.status_code}")
    print(f"[study_set] response body={resp.text}")
    resp.raise_for_status()
    return resp.json()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Login to Elsa, compute phrase objects, and create a study set."
        )
    )
    parser.add_argument(
        "--login-url",
        default=os.environ.get("ELSA_LOGIN_URL", DEFAULT_LOGIN_URL),
        help="Login endpoint URL (default taken from ELSA_LOGIN_URL or placeholder).",
    )
    parser.add_argument(
        "--email",
        default=os.environ.get("ELSA_EMAIL"),
        help="Account email (or set ELSA_EMAIL env var).",
    )
    parser.add_argument(
        "--password",
        default=os.environ.get("ELSA_PASSWORD"),
        help="Account password (or set ELSA_PASSWORD env var).",
    )
    parser.add_argument(
        "--set-name",
        required=True,
        help="Name for the new study set.",
    )
    parser.add_argument(
        "--phrases-file",
        help="Optional path to a text file with one phrase per line.",
    )
    parser.add_argument(
        "phrases",
        nargs="*",
        help="Phrases to add to the study set (used if --phrases-file not given).",
    )

    return parser.parse_args()


def load_phrases(args: argparse.Namespace) -> List[str]:
    if args.phrases_file:
        with open(args.phrases_file, "r", encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip()]

    if not args.phrases:
        print(
            "No phrases provided. Pass them as positional args or via --phrases-file.",
            file=sys.stderr,
        )
        sys.exit(1)

    return args.phrases


def main() -> None:
    args = parse_args()

    if not args.email or not args.password:
        print(
            "Email and password are required. "
            "Pass --email/--password or set ELSA_EMAIL/ELSA_PASSWORD.",
            file=sys.stderr,
        )
        sys.exit(1)

    # 1) Login and get tokens
    print("Logging in to get tokens...")
    x_access_token, x_session_token, author_id = login_and_get_tokens(
        login_url=args.login_url,
        email=args.email,
        password=args.password,
    )
    print("Got tokens and author_id.")

    # 2) Compute phrase objects from input phrases
    raw_phrases = load_phrases(args)
    phrase_objects = [build_phrase_object(p) for p in raw_phrases]

    # 3) Create the study set with all computed phrases
    print(f"Creating study set '{args.set_name}' with {len(phrase_objects)} phrases...")
    result = create_study_set(
        name=args.set_name,
        author_id=author_id,
        phrases=phrase_objects,
        x_access_token=x_access_token,
        x_session_token=x_session_token,
    )

    print("Study set created successfully. Raw response JSON:")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

