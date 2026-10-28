"""Dictionary lookup with a fallback provider for deployments where the primary API is blocked."""

import logging
from urllib.parse import quote

import requests

logger = logging.getLogger(__name__)

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (compatible; LexoraNexus/1.0)",
    "Accept": "application/json",
})
TIMEOUT = 12


def _dictionary_api(word: str):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{quote(word)}"
    response = SESSION.get(url, timeout=TIMEOUT)
    if response.status_code == 404:
        return [], url, "dictionaryapi.dev"
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise ValueError("Unexpected response from dictionaryapi.dev")
    return payload, url, "dictionaryapi.dev"


def _wiktionary(word: str):
    url = f"https://en.wiktionary.org/api/rest_v1/page/definition/{quote(word)}"
    response = SESSION.get(url, timeout=TIMEOUT)
    if response.status_code == 404:
        return [], url, "Wiktionary"
    response.raise_for_status()
    payload = response.json()
    entries = []

    for item in payload.get("en", []):
        definitions = []
        synonyms = []
        antonyms = []
        for definition in item.get("definitions", []):
            text = (definition.get("definition") or "").strip()
            if not text:
                continue
            normalized = {"definition": text}
            examples = definition.get("examples") or []
            if examples:
                example = examples[0]
                if isinstance(example, str):
                    normalized["example"] = example
                elif isinstance(example, dict) and example.get("text"):
                    normalized["example"] = example["text"]
            definitions.append(normalized)
            synonyms.extend(definition.get("synonyms") or [])
            antonyms.extend(definition.get("antonyms") or [])
        if definitions:
            entries.append({
                "word": word,
                "phonetic": "",
                "phonetics": [],
                "meanings": [{
                    "partOfSpeech": item.get("partOfSpeech") or "word",
                    "definitions": definitions,
                    "synonyms": synonyms,
                    "antonyms": antonyms,
                }],
                "source": "Wiktionary",
            })

    return entries, url, "Wiktionary"


def lookup_dictionary_word(word: str):
    """Return (entries, source_url, source_name); try Wiktionary if primary fails or has no entry."""
    providers = (_dictionary_api, _wiktionary)
    errors = []
    last_url = ""
    last_source = "dictionaryapi.dev"

    for provider in providers:
        try:
            entries, url, source = provider(word)
            last_url, last_source = url, source
            if entries:
                logger.info("Dictionary lookup for %r succeeded via %s", word, source)
                return entries, source, url
            logger.info("%s returned no entry for %r; trying fallback", source, word)
        except (requests.RequestException, ValueError) as exc:
            errors.append(f"{provider.__name__}: {exc}")
            logger.warning("Dictionary provider %s failed for %r: %s", provider.__name__, word, exc)

    if errors:
        logger.error("All dictionary providers failed for %r: %s", word, " | ".join(errors))
    return [], last_source, last_url
