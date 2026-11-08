"""Load synthetic RAKSA examples into an existing Supabase project."""

import argparse
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from uuid import UUID

SEED_FILE = Path(__file__).resolve().parents[1] / "docs" / "seed.json"


def load_seed():
    data = json.loads(SEED_FILE.read_text(encoding="utf-8-sig"))
    case_ids = {case["id"] for case in data["cases"]}
    if len(case_ids) != len(data["cases"]):
        raise ValueError("Duplicate case IDs in seed.json")
    for group in ("cases", "observations"):
        for row in data[group]:
            UUID(row["id"])
    for observation in data["observations"]:
        if observation["case_id"] not in case_ids:
            raise ValueError("Observation refers to a missing case")
        if not 1 <= observation["observation_day"] <= 14:
            raise ValueError("Observation day must be 1–14")
    return data


def insert_rows(base_url, secret_key, table, rows):
    request = Request(
        f"{base_url}/rest/v1/{table}?on_conflict=id",
        data=json.dumps(rows, ensure_ascii=False).encode("utf-8"),
        headers={
            "apikey": secret_key,
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        if response.status not in (200, 201, 204):
            raise RuntimeError(f"Unexpected HTTP {response.status} for {table}")


def main():
    parser = argparse.ArgumentParser(description="Seed synthetic RAKSA data")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Validate JSON without contacting Supabase")
    mode.add_argument("--apply", action="store_true", help="Insert seed rows into Supabase")
    args = parser.parse_args()

    data = load_seed()
    print(f"Seed valid: {len(data['cases'])} cases, {len(data['observations'])} observations")
    if args.check:
        return

    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    secret_key = os.environ.get("SUPABASE_SECRET_KEY", "")
    parsed = urlparse(base_url)
    if parsed.scheme != "https" or not parsed.hostname or not parsed.hostname.endswith(".supabase.co") or parsed.path or parsed.query or parsed.fragment:
        parser.error("Set SUPABASE_URL to the project URL, for example https://project-ref.supabase.co")
    if not secret_key.startswith("sb_secret_"):
        parser.error("Set SUPABASE_SECRET_KEY to the project's sb_secret_ key")

    try:
        for table in ("cases", "observations"):
            insert_rows(base_url, secret_key, table, data[table])
            print(f"Sent {len(data[table])} {table} rows (existing IDs ignored)")
    except (HTTPError, URLError) as error:
        raise SystemExit(f"Seed stopped: {error}") from error


if __name__ == "__main__":
    main()
