from sklearn.base import BaseEstimator, TransformerMixin

import spacy
import re

class SpacyPreprocessor(BaseEstimator, TransformerMixin):
    """
    Transformer that normalizes text (lowercase, collapse long repeats),
    runs spaCy pipeline for tokenization/lemmatization and returns a cleaned string.
    """
    def __init__(self, model="en_core_web_md", collapse_repeats=True, keep_pos=None):
        # keep_pos: set of POS tags to keep (None => keep all non-stopword tokens)
        self.model = model
        self.collapse_repeats = collapse_repeats
        self.keep_pos = keep_pos
        self.nlp = None

    def fit(self, X, y=None):
        if self.nlp is None:
            self.nlp = spacy.load(self.model, disable=["parser"])  # parser not needed for speed
        return self

    def _collapse_repeats(self, text):
        # Collapse runs of the same character: e.g. hellooo -> helloo (keep two)
        # This preserves some emphasis while normalizing extreme elongation.
        return re.sub(r'(.)\1{2,}', r'\1\1', text)

    def _clean_doc(self, text):
        text = text.strip().lower()
        if self.collapse_repeats:
            text = self._collapse_repeats(text)
        doc = self.nlp(text)
        tokens = []
        for t in doc:
            if t.is_space or t.is_punct:
                continue
            if t.is_stop:
                continue
            if self.keep_pos and t.pos_ not in self.keep_pos:
                continue
            # use lemma if available
            lemma = t.lemma_.strip()
            # some lemmas are '-' or '', fallback to text
            tokens.append(lemma if lemma else t.text)
        return " ".join(tokens)

    def transform(self, X):
        if self.nlp is None:
            self.fit(X)
        return [self._clean_doc(x) for x in X]
