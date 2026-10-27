import spacy

nlp = spacy.load("en_core_web_sm")


def analyze_term(text: str) -> dict:
    """
    Analyze a word or phrase:
    - POS
    - form (tense/number/etc.)
    - lemma
    """

    doc = nlp(text.strip())

    if not doc:
        return {"text": text, "error": "Unable to analyze"}

    tokens_data = []

    for token in doc:
        if token.is_space:
            continue

        tokens_data.append({
            "token": token.text,
            "lemma": token.lemma_,
            "pos": token.pos_,
            "tag": token.tag_,
            "form": extract_form(token),
            "morphology": token.morph.to_dict()
        })

    return {
        "text": text,
        "type": "phrase" if len(tokens_data) > 1 else "word",
        # "head": doc.root.text,
        "head": list(doc.sents)[0].root.text,

        "tokens": tokens_data
    }


def extract_form(token):
    if token.pos_ == "VERB":
        if "Tense=Past" in token.morph:
            return "past tense"
        if "VerbForm=Ger" in token.morph:
            return "present participle / gerund"
        if "VerbForm=Part" in token.morph:
            return "past participle"
        if "VerbForm=Fin" in token.morph and "Tense=Pres" in token.morph:
            return "present tense"
        return "base form"

    if token.pos_ == "NOUN":
        if "Number=Plur" in token.morph:
            return "plural"
        return "singular"

    if token.pos_ == "ADJ":
        if "Degree=Cmp" in token.morph:
            return "comparative"
        if "Degree=Sup" in token.morph:
            return "superlative"
        return "base form"

    return "base form"
