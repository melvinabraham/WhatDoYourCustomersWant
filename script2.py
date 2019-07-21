# pip install textblob
# python -m textblob.download_corpora
# pip install spacy textacy
# python -m spacy download en

import json
from collections import defaultdict, Counter
import re
import textacy
from textblob import TextBlob

en = textacy.load_spacy("en_core_web_sm")
# my_stop_words = {"the", "to"}
my_stop_words = en.Defaults.stop_words - {"not"}

data = []

with open("only_cellphones_brands.json") as json_data:
    data = json.load(json_data)

# re-implemented from https://github.com/chartbeat-labs/textacy/blob/26abafae7d745614b68d2f90310741b5a8de24d7/textacy/extract.py#L327
# to ignore stop words in matching
def pos_regex_matches(doc, pattern):
    # standardize and transform the regular expression pattern...
    pattern = re.sub(r"\s", "", pattern)
    pattern = re.sub(r"<([A-Z]+)\|([A-Z]+)>", r"( (\1|\2))", pattern)
    pattern = re.sub(r"<([A-Z]+)>", r"( \1)", pattern)

    filtered_tokens = [
        tok for tok in doc if tok.text not in my_stop_words and tok.is_alpha
    ]
    filtered_words = [tok.lemma_ for tok in filtered_tokens]
    # tags = " " + " ".join(tok.pos_ for tok in doc)
    tags = " " + " ".join(tok.pos_ for tok in filtered_tokens)

    for m in re.finditer(pattern, tags):
        # span = doc[tags[0 : m.start()].count(" ") : tags[0 : m.end()].count(" ")]
        # yield (span, TextBlob(str(span)).sentiment.polarity)
        span = filtered_words[
            tags[0 : m.start()].count(" ") : tags[0 : m.end()].count(" ")
        ]
        yield (span, TextBlob(" ".join(span)).sentiment.polarity)


MAX_BRANDS = 20
MAX_FEATURES = 20
MAX_OPINIONS = 20

PHONE_FEATURES = {
    "phone",
    "screen",
    "battery",
    "app",
    "camera",
    "quality",
    "device",
    "price",
    "battery life",
    "smartphone",
    "deal",
    "android",
    "keyboard",
    "size",
    "memory",
    "picture",
    "button",
    "touch",
    "display",
    "color",
    "card",
    "service",
    "cell",
    "cell phone",
    "experience",
    "sim",
    "product",
    "software",
    "storage",
    "reception",
    "bluetooth",
    "signal",
    "voice",
    "key",
    "application",
    "mobile",
}
FEATURE_EQUIVALENTS = {
    "device": "phone",
    "smartphone": "phone",
    "cell phone": "phone",
    "cell": "phone",
    "mobile": "phone",
    "product": "phone",
    "quality": "phone",
    "battery life": "battery",
    "picture": "camera",
    "resolution": "camera",
    "display": "screen",
    "deal": "price",
    "card": "storage",
    "app": "software",
    "application": "software",
    "reception": "signal",
    "voice": "signal",
    "key": "button",
}
CARRIERS = {"sprint", "t-mobile", "tmobile", "verizon", "at&amp;t", "at&t"}
POPULAR_BRANDS = {
    "samsung",
    "sony",
    "sony ericsson",
    "apple",
    "htc",
    "lg",
    "motorola",
    "google",
    "nokia",
    "blackberry",
    "lenovo",
}
BRAND_EQUIVALENTS = {"at&amp;t": "gophone", "rim": "blackberry", "N7000": "samsung"}

# Patterns for extracting features and opinion words
pattern1 = r"<ADJ> <NOUN>"  # great screen
pattern2 = r"<ADJ> <NOUN> <NOUN>"  # great phone screen
# pattern3 = r"<ADV> <ADJ>"  # great phone screen
pattern4 = r"(<ADV> <ADJ> <NOUN>) | (<ADV> <ADV> <NOUN>)"  # very good screen
# pattern5 = r"<ADV> <VERB>"  # great phone screen
# pattern6 = r"<ADV> <ADV> <ADJ>"  # great phone screen
# pattern7 = r"<VERB> <NOUN>"  # great phone screen
# pattern8 = r"<VERB> <ADV>"  # great phone screen


# brand > year > feature
yb_features = defaultdict(
    lambda: defaultdict(
        lambda: defaultdict(
            lambda: {
                "count": 0,
                "positive_count": 0,
                "opinions": Counter(),
                "ratings": {
                    "1": Counter(),
                    "2": Counter(),
                    "3": Counter(),
                    "4": Counter(),
                    "5": Counter(),
                },
            }
        )
    )
)

opinion_sentiments = {}

for i in range(len(data)):
    review = textacy.preprocess.unpack_contractions(data[i]["reviewText"].lower())
    doc = textacy.Doc(review, lang=en)

    rating = str(data[i]["overall"])
    year = data[i]["reviewTime"].split(" ")[-1]
    brand = data[i]["brand"] or "UNKNOWN"
    ybf = yb_features[year][brand]
    opinions = []
    three_word_matches = set()
    # free screen protector
    for [o, f1, f2], s in pos_regex_matches(doc, pattern2):
        feat = f1 + " " + f2
        if not feat in PHONE_FEATURES:
            continue
        # get its equivalent or keep original
        feat = FEATURE_EQUIVALENTS.get(feat, feat)
        ybf[feat]["count"] += 1
        if s > 0:
            ybf[feat]["positive_count"] += 1
            ybf[feat]["ratings"][rating]["positive_count"] += 1
        elif s == 0:
            ybf[feat]["positive_count"] += 1
            ybf[feat]["ratings"][rating]["neutral_count"] += 1
        else:
            ybf[feat]["ratings"][rating]["negative_count"] += 1
        ybf[feat]["opinions"][o] += 1
        opinion_sentiments[o] = s
        opinions.append((o, feat, s))
        three_word_matches.add(o + " " + f1)
    # well worth price
    for [o1, o2, f], s in pos_regex_matches(doc, pattern4):
        if not f in PHONE_FEATURES:
            continue
        # get its equivalent or keep original
        f = FEATURE_EQUIVALENTS.get(f, f)
        opinion = o1 + " " + o2
        ybf[f]["count"] += 1
        if s > 0:
            ybf[f]["positive_count"] += 1
            ybf[f]["ratings"][rating]["positive_count"] += 1
        elif s == 0:
            ybf[f]["positive_count"] += 1
            ybf[f]["ratings"][rating]["neutral_count"] += 1
        else:
            ybf[f]["ratings"][rating]["negative_count"] += 1
        ybf[f]["opinions"][opinion] += 1
        opinion_sentiments[opinion] = s
        opinions.append((opinion, f, s))
        three_word_matches.add(o2 + " " + f)

    # great deal
    for [o, f], s in pos_regex_matches(doc, pattern1):
        if not f in PHONE_FEATURES:
            continue
        # get its equivalent or keep original
        f = FEATURE_EQUIVALENTS.get(f, f)
        # if (o + " " + f) not in three_word_matches:
        #     continue
        ybf[f]["count"] += 1
        if s > 0:
            ybf[f]["positive_count"] += 1
            ybf[f]["ratings"][rating]["positive_count"] += 1
        elif s == 0:
            ybf[f]["positive_count"] += 1
            ybf[f]["ratings"][rating]["neutral_count"] += 1
        else:
            ybf[f]["ratings"][rating]["negative_count"] += 1
        ybf[f]["opinions"][o] += 1
        opinion_sentiments[o] = s
        opinions.append((o, f, s))

    data[i]["opinions"] = opinions


# year > brand > feature
sorted_yb_features = defaultdict(lambda: defaultdict(lambda: defaultdict()))
# year > feature
sorted_y_features = defaultdict(
    lambda: defaultdict(
        lambda: {
            "count": 0,
            "positive_count": 0,
            "opinions": Counter(),
            "ratings": {
                "1": Counter(),
                "2": Counter(),
                "3": Counter(),
                "4": Counter(),
                "5": Counter(),
            },
        }
    )
)

### Sort the results and calculate overall aggregate values for each level
# sort by year
for y in sorted(yb_features):

    for b in yb_features[y]:
        tmp = {
            "count": 0,
            "positive_count": 0,
            "features": defaultdict(lambda: {
                "count": 0,
                "positive_count": 0,
                "opinions": Counter(),
            }),
            "opinions": Counter(),
        }
        # sort features by mentions
        for f, fc in sorted(
            yb_features[y][b].items(), key=lambda kv: kv[1]["count"], reverse=True
        ):
            # overall features in a brand
            tmp["count"] += fc["count"]
            tmp["positive_count"] += fc["positive_count"]
            tmp["opinions"] += fc["opinions"]
            tmp["features"][f]["count"] += fc["count"]
            tmp["features"][f]["positive_count"] += fc["positive_count"]
            tmp["features"][f]["opinions"] += fc["opinions"]

            # sort opinions by mentions
            fc["opinions"] = Counter(dict(fc["opinions"].most_common()))
            sorted_yb_features[y][b][f] = fc
            sorted_y_features[y][f]["count"] += fc["count"]
            sorted_y_features[y][f]["positive_count"] += fc["positive_count"]
            sorted_y_features[y][f]["opinions"] += fc["opinions"]
            for ii in range(1, 6):
                sorted_y_features[y][f]["ratings"][str(ii)]["positive_count"] += fc["ratings"][str(ii)]["positive_count"]
                sorted_y_features[y][f]["ratings"][str(ii)]["negative_count"] += fc["ratings"][str(ii)]["negative_count"]
                sorted_y_features[y][f]["ratings"][str(ii)]["neutral_count"] += fc["ratings"][str(ii)]["neutral_count"]

        # for f, fc in sorted_y_features[y].items():
        #     tmp["features"][f] = fc
        tmp["features"] = dict(
            sorted(
                tmp["features"].items(),
                key=lambda kv: kv[1]["count"],
                reverse=True,
            )
        )
        # update for overall features in a brand
        tmp["opinions"] = Counter(dict(tmp["opinions"].most_common()))
        sorted_yb_features[y][b]["__overall"] = tmp

    # sort brands based on overall count
    sorted_yb_features[y] = dict(
        sorted(
            sorted_yb_features[y].items(),
            key=lambda kv: kv[1]["__overall"]["count"],
            reverse=True,
        )
    )

    # update for overall brands/features in a year
    tmp = {
        "count": 0,
        "positive_count": 0,
        "features": defaultdict(lambda: {
            "count": 0,
            "positive_count": 0,
            "opinions": Counter(),
        }),
        "opinions": Counter(),
    }
    for b, bc in sorted_yb_features[y].items():
        tmp["count"] += bc["__overall"]["count"]
        tmp["positive_count"] += bc["__overall"]["positive_count"]
        tmp["opinions"] += bc["__overall"]["opinions"]
        for f, fc in bc["__overall"]["features"].items():
            tmp["features"][f]["count"] += fc["count"]
            tmp["features"][f]["positive_count"] += fc["positive_count"]
            tmp["features"][f]["opinions"] += fc["opinions"]
    # sort features and opinions based on count
    tmp["features"] = dict(
        sorted(
            tmp["features"].items(),
            key=lambda kv: kv[1]["count"],
            reverse=True,
        )
    )
    # tmp["features"] = Counter(dict(tmp["features"].most_common()))
    tmp["opinions"] = Counter(dict(tmp["opinions"].most_common()))
    sorted_yb_features[y]["__overall"] = tmp
    sorted_y_features[y]["__overall"] = tmp

# update for overall years
tmp = {"count": 0, "positive_count": 0,
        "features": defaultdict(lambda: {
            "count": 0,
            "positive_count": 0,
            "opinions": Counter(),
            "ratings": {
                "1": Counter(),
                "2": Counter(),
                "3": Counter(),
                "4": Counter(),
                "5": Counter(),
            },
        }),
        "brands": defaultdict(
            lambda: defaultdict(
                lambda: {
                    "count": 0,
                    "positive_count": 0,
                }
            )
        ),
        "opinions": Counter()}
for y, yc in sorted_yb_features.items():
    tmp["count"] += yc["__overall"]["count"]
    tmp["positive_count"] += yc["__overall"]["positive_count"]
    tmp["opinions"] += yc["__overall"]["opinions"]
    for f, fc in yc["__overall"]["features"].items():
        tmp["features"][f]["count"] += fc["count"]
        tmp["features"][f]["positive_count"] += fc["positive_count"]
        tmp["features"][f]["opinions"] += fc["opinions"]
    for f, fc in sorted_y_features[y].items():
        if f == "__overall":
            continue
        for ii in range(1, 6):
            tmp["features"][f]["ratings"][str(ii)]["positive_count"] += fc["ratings"][str(ii)]["positive_count"]
            tmp["features"][f]["ratings"][str(ii)]["negative_count"] += fc["ratings"][str(ii)]["negative_count"]
            tmp["features"][f]["ratings"][str(ii)]["neutral_count"] += fc["ratings"][str(ii)]["neutral_count"]
    for b, bc in yc.items():
        if b == "__overall":
            continue
        for f, fc in bc.items():
            tmp["brands"][b][f]["count"] += fc["count"]
            tmp["brands"][b][f]["positive_count"] += fc["positive_count"]

# sort features and opinions based on count
for f, fc in tmp["features"].items():
    tmp["features"][f]["opinions"] = dict(fc["opinions"].most_common())
tmp["features"] = dict(
    sorted(
        tmp["features"].items(),
        key=lambda kv: kv[1]["count"],
        reverse=True,
    )
)
tmp["brands"] = dict(
    sorted(
        tmp["brands"].items(),
        key=lambda kv: sum([fc["count"] for f, fc in kv[1].items()]),
        reverse=True,
    )
)

# tmp["features"] = dict(tmp["features"].most_common())
tmp["opinions"] = dict(tmp["opinions"].most_common())
sorted_yb_features["__overall"] = tmp
sorted_y_features["__overall"] = tmp


### Limit the number of results and keep only top X items at each level
# year > brand > feature
final_yb_features = defaultdict(
    lambda: defaultdict(
        lambda: defaultdict(
            lambda: {"count": 0, "positive_count": 0, "opinions": Counter()}
        )
    )
)
# year > feature
final_y_features = defaultdict(
    lambda: defaultdict(
        lambda: {"count": 0, "positive_count": 0, "opinions": Counter()}
    )
)


def limit_feat_op(dd, limit=None):
    dd["opinions"] = dict(
        (o, oc)
        for oi, (o, oc) in enumerate(dd["opinions"].items())
        if oi < MAX_OPINIONS
    )
    if "features" in dd:
        dd["features"] = dict(
            (f, fc)
            for fi, (f, fc) in enumerate(dd["features"].items())
            if fi < MAX_FEATURES
        )
    if "brands" in dd:
        dd["brands"] = dict(
            (b, bc)
            for bi, (b, bc) in enumerate(dd["brands"].items())
            if bi < MAX_BRANDS
        )
        # for b, bc in dd["brands"].items():
        #     dd["brands"][b] = dict(
        #         (f, fc)
        #         for fi, (f, fc) in enumerate(bc.items())
        #         if fi < MAX_FEATURES
        #     )
    return dd


final_yb_features["__overall"] = limit_feat_op(sorted_yb_features["__overall"])
final_y_features["__overall"] = limit_feat_op(sorted_yb_features["__overall"])
for y, yc in sorted_yb_features.items():
    if y == "__overall":
        continue
    final_yb_features[y]["__overall"] = limit_feat_op(yc["__overall"])
    final_y_features[y]["__overall"] = limit_feat_op(yc["__overall"])
    for bi, (b, bc) in enumerate(yc.items()):
        if b == "__overall":
            continue
        if bi >= MAX_BRANDS:
            break
        final_yb_features[y][b]["__overall"] = limit_feat_op(bc["__overall"])
        # limit yb_features
        for fi, (f, fc) in enumerate(bc.items()):
            if f == "__overall":
                continue
            if fi >= MAX_FEATURES:
                break
            final_yb_features[y][b][f] = limit_feat_op(fc)

    # limit y_features
    for fi, (f, fc) in enumerate(sorted_y_features[y].items()):
        if f == "__overall":
            continue
        if fi >= MAX_FEATURES:
            break
        final_y_features[y][f] = limit_feat_op(fc)

# Add sentiment for each opinion for use in visualizations
# final_yb_features["__overall"]["opinion_sentiments"] = opinion_sentiments
# final_y_features["__overall"]["opinion_sentiments"] = opinion_sentiments


with open("opinion_sentiments.json", "w") as out_file:
    json.dump(opinion_sentiments, out_file)

with open("brand_features.json", "w") as out_file:
    json.dump(final_yb_features, out_file)

with open("year_features.json", "w") as out_file:
    json.dump(final_y_features, out_file)

with open("review_with_features.json", "w") as out_file:
    json.dump(data, out_file)
