import pandas as pd

df = pd.read_json(path_or_buf="merged_Cell_Phones_and_Accessories.json")

mask = df.categories.apply(lambda x: "Cell Phones" in x[0])
df2 = df[mask]
print("Cell phone reviews - before fill")
print(df2.count())

df2.brand = df2.brand.fillna("")
df2.title = df2.title.fillna("")
df2.price = df2.price.fillna(0)
print("Cell phone reviews - after fill")
print(df2.count())

df2.to_json(path_or_buf="only_cellphones.json", orient="records")
