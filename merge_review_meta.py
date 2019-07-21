import pandas as pd
import gzip


def parse(path):
    g = gzip.open(path, "rb")
    for l in g:
        yield eval(l)


def getDF(path):
    i = 0
    df = {}
    for d in parse(path):
        df[i] = d
        i += 1
    return pd.DataFrame.from_dict(df, orient="index")


# review_df = getDF("reviews_Cell_Phones_and_Accessories_5.json.gz")
review_df = getDF("reviews_Cell_Phones_and_Accessories.json.gz")
review_df = review_df.drop(columns=["reviewerName", "reviewerID"])

meta_df = getDF("meta_Cell_Phones_and_Accessories.json.gz")
meta_df = meta_df.drop(columns=["related", "salesRank", "imUrl", "description"])

final_data_df = pd.merge(review_df, meta_df, on="asin", how="left")

print("\nreview_count\n", review_df.count())
print("\nmeta count\n", meta_df.count())
print("\nfinal count\n", final_data_df.count())

final_data_df.to_json(
    path_or_buf="merged_Cell_Phones_and_Accessories.json", orient="records"
)
