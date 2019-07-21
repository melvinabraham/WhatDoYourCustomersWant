# pip install textblob
# python -m textblob.download_corpora
# pip install spacy textacy
# python -m spacy download en

import json
from collections import defaultdict, Counter
import re

data = []

with open("only_cellphones_5.json") as json_data:
    data = json.load(json_data)

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

brand_set = Counter()

for i in range(len(data)):
    brand = data[i]["brand"].strip().lower()
    if brand == "":
        # remove carrier names in the beginning of titles
        brand = (
            re.sub(
                r"At&Amp;T|SPRINT|VERIZON|TMOBILE|T-MOBILE|POSTPAID|PREPAID|Unlocked",
                "",
                data[i]["title"],
                re.IGNORECASE,
            )
            .strip()
            .lower()
            .split(" ")[0]
        )
    # special case for Sony Ericsson
    lt = data[i]["title"].lower()
    brand = BRAND_EQUIVALENTS.get(brand, brand)
    if "sony ericsson" in lt:
        brand = "Sony Ericsson"
    elif brand in CARRIERS:
        # popular brands are offered by carriers and have their names in title
        titleset = set(lt.split(" "))
        common = POPULAR_BRANDS & titleset
        # print("brand common", common, brand, titleset)
        if common:
            brand = " ".join(list(common))
            # print("updated brand", brand)
    # elif brand not in BRANDS:
    #     brand = "unknown"

    # remove - from T-Mobile to normalize
    brand = re.sub("[^a-zA-Z ]", "", brand).title()
    brand = brand.title()
    brand_set[brand] += 1
    # if brand == "":
    #     print(
    #         "Blank brand!",
    #         data[i]["asin"],
    #         data[i]["unixReviewTime"],
    #         data[i]["brand"],
    #         data[i]["title"],
    #     )
    #     continue
    # elif brand == "Samsung Galaxy S  Google Edition 5":
    #     print("brand!", data[i]["unixReviewTime"], data[i]["brand"], data[i]["title"])
    # elif brand.lower() in CARRIERS:
    #     print(
    #         "Carrier brand!",
    #         data[i]["unixReviewTime"],
    #         data[i]["brand"],
    #         data[i]["title"],
    #     )
    data[i]["brand"] = brand

# for bs in brand_set.most_common():
#     print(bs[0], bs[1])
with open("only_cellphones_brands_5.json", "w") as out_file:
    json.dump(data, out_file)
