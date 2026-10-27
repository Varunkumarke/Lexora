import requests
import re
from html import unescape
from typing import Optional
from urllib.parse import quote
import hashlib
from datetime import datetime, timedelta
import logging


# ---------------- LOGGING ---------------- #

logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ---------------- CACHE ---------------- #

class DefinitionCache:
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.ttl = timedelta(hours=ttl_hours)

    def get(self, key: str) -> Optional[str]:
        if key in self.cache:
            value, ts = self.cache[key]
            if datetime.now() - ts < self.ttl:
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: str):
        self.cache[key] = (value, datetime.now())


# ---------------- MAIN CLASS ---------------- #

class EnhancedDefinitionFinder:
    """
    Final robust definition finder for software / computing / academic concepts.
    Handles ambiguity, named theorems, and variant phrasing correctly.
    """

    DOMAIN_HINTS = [
        "computer science",
        "computing",
        "software",
        "programming",
        "operating system",
        "algorithm",
        "technology",
        "machine learning",
        "data science",
        "statistics",
        "information theory",
        "video coding",
        "data compression"
    ]

    def __init__(self, cache_ttl_hours: int = 24):
        self.cache = DefinitionCache(cache_ttl_hours)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "DefinitionBot/1.0 (Educational)"
        })

        self.apis = {
            "wiktionary": "https://en.wiktionary.org/w/api.php",
            "wikipedia": "https://en.wikipedia.org/api/rest_v1/page/summary/{title}",
            "wiki_search": "https://en.wikipedia.org/w/api.php",
            "free_dict": "https://api.dictionaryapi.dev/api/v2/entries/en/{word}",
        }


    # ---------------- NORMALIZATION ---------------- #

    def normalize(self, word: str) -> str:
        word = word.lower().strip()
        word = re.sub(r"[–—]", "-", word)   # normalize dashes
        word = re.sub(r"\s+", " ", word)
        return word

    def normalize_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[–—]", "-", text)
        return text


    # ---------------- UTILITIES ---------------- #

    def _cache_key(self, word: str, src: str) -> str:
        return hashlib.md5(f"{word}:{src}".encode()).hexdigest()

    def clean_html(self, text: str) -> str:
        return unescape(re.sub(r"<[^>]+>", "", text)).strip()

    def is_disambiguation(self, text: str) -> bool:
        t = text.lower()
        return any(p in t for p in (
            "may refer to",
            "may stand for",
            "can refer to"
        ))

    def is_outline_or_portal(self, text: str) -> bool:
        t = text.lower()
        return any(p in t for p in (
            "outline is provided",
            "topical guide",
            "overview of",
            "portal to"
        ))

    def is_linguistic_noise(self, text: str) -> bool:
        t = text.lower()
        return any(p in t for p in (
            "ipa",
            "pronunciation",
            "spelling",
            "etymology",
            "obsolete",
            "plural of",
            "alternative form of"
        ))


    # ---------------- NAME MATCHING (KEY FIX) ---------------- #

    def extract_core_name_tokens(self, query: str):
        """
        Extract proper-name-like tokens:
        e.g. 'wyner-ziv video coding' → {'wyner', 'ziv'}
        """
        tokens = re.findall(r"[a-z]+", query)
        return set(tokens[:2])  # first two tokens = name


    def title_matches_query(self, title: str, query: str) -> bool:
        title = self.normalize_text(title)
        query = self.normalize_text(query)

        core = self.extract_core_name_tokens(query)
        title_tokens = set(re.findall(r"[a-z]+", title))

        return core.issubset(title_tokens)


    # ---------------- FORMATTER ---------------- #

    def format_definition(self, text: str) -> str:
        if self.is_disambiguation(text) or self.is_outline_or_portal(text):
            return ""

        text = re.sub(r"\s+", " ", text.strip())
        sentences = re.split(r"(?<=[.!?])\s+", text)

        good = []
        for s in sentences:
            if (
                len(s) > 25
                and not self.is_linguistic_noise(s)
                and not s.lower().startswith(("see also", "from", "such as"))
            ):
                good.append(s)

        return "\n".join(good[:3]) if good else ""


    # ---------------- WIKIPEDIA ---------------- #

    def wikipedia_exact(self, word: str) -> Optional[str]:
        key = self._cache_key(word, "wiki_exact")
        cached = self.cache.get(key)
        if cached:
            return cached

        try:
            r = self.session.get(
                self.apis["wikipedia"].format(title=quote(word)),
                timeout=10
            )
            if r.status_code == 200:
                extract = r.json().get("extract", "")
                result = self.format_definition(extract)
                if result:
                    self.cache.set(key, result)
                    return result
        except Exception:
            pass

        return None


    def wikipedia_search(self, word: str) -> Optional[str]:
        for hint in self.DOMAIN_HINTS:
            query = f"{word} {hint}"

            params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json"
            }

            try:
                r = self.session.get(self.apis["wiki_search"], params=params, timeout=10)
                results = r.json().get("query", {}).get("search", [])

                for res in results:
                    title = res["title"]
                    if not self.title_matches_query(title, word):
                        continue

                    definition = self.wikipedia_exact(title)
                    if definition:
                        return definition

            except Exception:
                continue

        return None


    # ---------------- MAIN ENTRY ---------------- #

    def get_software_definition(self, word: str) -> str:
        word = self.normalize(word)

        result = self.wikipedia_exact(word)
        if result:
            return result

        result = self.wikipedia_search(word)
        if result:
            return result

        return "Definition not found in available software sources."


# ---------------- PUBLIC API ---------------- #

def get_software_definition(word: str) -> str:
    return EnhancedDefinitionFinder().get_software_definition(word)



