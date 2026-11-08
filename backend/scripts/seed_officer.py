"""Upsert an officer profile for an existing Supabase Auth user."""
import argparse
import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from uuid import UUID


def load_profile():
    user_id = os.environ.get("SUPABASE_OFFICER_ID", "").strip()
    full_name = os.environ.get("SUPABASE_OFFICER_NAME", "").strip()
    if not user_id or not full_name:
        raise ValueError("Set SUPABASE_OFFICER_ID and SUPABASE_OFFICER_NAME")
    UUID(user_id)
    if not 1 <= len(full_name) <= 150:
        raise ValueError("Officer name must be 1–150 characters")
    row = {"id": user_id, "full_name": full_name}
    for env_name, column in (("SUPABASE_OFFICER_ORGANIZATION", "organization"),
                             ("SUPABASE_OFFICER_PHONE", "phone")):
        value = os.environ.get(env_name, "").strip()
        if value:
            row[column] = value
    return row


def main():
    parser = argparse.ArgumentParser(description="Seed one officer profile for an existing Auth user")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Validate profile inputs without contacting Supabase")
    mode.add_argument("--apply", action="store_true", help="Upsert the profile into public.officers")
    args = parser.parse_args()
    try:
        row = load_profile()
    except ValueError as error:
        parser.error(str(error))
    print(f"Officer profile valid: id={row['id']}, name={row['full_name']!r}")
    if args.check:
        return
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    secret = os.environ.get("SUPABASE_SECRET_KEY", "")
    parsed = urlparse(base_url)
    if (parsed.scheme != "https" or not parsed.hostname or
            not parsed.hostname.endswith(".supabase.co") or parsed.path or parsed.query or parsed.fragment):
        parser.error("Set SUPABASE_URL to the project URL, for example https://project-ref.supabase.co")
    if not secret.startswith("sb_secret_"):
        parser.error("Set SUPABASE_SECRET_KEY to the project's sb_secret_ key")
    request = Request(
        f"{base_url}/rest/v1/officers?{urlencode({'on_conflict': 'id'})}",
        data=json.dumps(row, ensure_ascii=False).encode("utf-8"),
        headers={"apikey": secret, "Content-Type": "application/json",
                 "Prefer": "resolution=merge-duplicates,return=minimal"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            if response.status not in (200, 201, 204):
                raise RuntimeError(f"Unexpected HTTP {response.status}")
        print("Officer profile upserted")
    except HTTPError as error:
        raise SystemExit(f"Seed stopped: HTTP {error.code}; check table, user UUID, grants, and key") from error
    except URLError as error:
        raise SystemExit(f"Seed stopped: Supabase unavailable ({error.reason})") from error


if __name__ == "__main__":
    main()
