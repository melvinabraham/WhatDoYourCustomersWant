'''
Parsing review data from data from Cell_Phones_and_Accessories_5.json and
meta data from meta_Cell_Phones_and_Accessories.json and making one single DataFrame for whole dataset
@Diksha Thakur'''
import json
import pandas as pd
import numpy as np

review_data= []
meta_data = []

with open('C:/Spring 2019 Academics/Data Visualization/Project/Cellphones/Cell_Phones_and_Accessories_5.json') as raw_data:
    for line in raw_data:
        #d.append(json.dumps(lines))
        review_data.append(json.loads(line.strip()))

#print("Review data",review_data[:2])



with open('C:/Spring 2019 Academics/Data Visualization/Project/Cellphones/meta_Cell_Phones_and_Accessories.json') as raw_meta_data:
    for line in raw_meta_data:
        #try:
        meta_line = {}
        #get asin
        asin = line.split("{'asin': '")
        asin = asin[1].split("',")
        asin =  asin[0]
        meta_line['asin'] = asin
        #print(asin)

        #get title
        title = line.split(", 'title': '")
        if len(title) > 1:
            title = title[1].split("', '")
            title = title[0].split("'}")
            title = title[0]
            meta_line['title'] = title
        else:
            meta_line['title'] = ''

        #get price
        price = line.split(", 'price': ")
        if len(price) > 1:
            price = price[1].split(", '")
            price = price[0].split("}")
            price = float(price[0])
            meta_line['price'] = price
        else:
            meta_line['price'] = None

        #get salesRank
        salesRank = line.split(", 'salesRank': {'Cell Phones & Accessories': ")
        if len(salesRank) > 1:
            salesRank = salesRank[1].split("}, ")
            salesRank = salesRank[0].split("}}")
            salesRank = int(salesRank[0])
            meta_line['salesRank'] = salesRank
        else:
            meta_line['price'] = None

        #get imUrl
        imUrl = line.split(", 'imUrl': '")
        if len(imUrl) > 1:
            imUrl = imUrl[1].split("', ")
            imUrl = imUrl[0].split("'}")
            meta_line['imUrl'] = imUrl[0]
        else:
            meta_line['imUrl'] = ''

        #get brand
        brand = line.split(", 'brand': '")
        if len(brand) > 1:
            brand = brand[1].split("', ")
            brand = brand[0].split("'}")
            brand = brand[0]
            meta_line['brand'] = brand
        else:
            meta_line['brand'] = 'Unknown'

        #get category
        category = line.split(", 'categories': [[")
        if len(category)>1:
            category = category[1].split("]],")
            category = category[0].split("]]}")
            category = category[0].replace("'","")
            category = category.split(", ")
            meta_line['categories'] = category
        else:
            meta_line['categories'] = []

        #get related items
        also_bought = line.split("'also_bought': [")
        if len(also_bought)>1:
            also_bought = also_bought[1].split("']")
            also_bought = also_bought[0].replace("'","")
            also_bought = also_bought.split(", ")
            meta_line['also_bought'] = also_bought
        else:
            meta_line['also_bought'] = []

        bought_together = line.split("'bought_together': [")
        if len(bought_together)>1:
            bought_together = bought_together[1].split("']")
            bought_together = bought_together[0].replace("'","")
            bought_together = bought_together.split(", ")
            meta_line['bought_together'] = bought_together
        else:
            meta_line['bought_together'] = []

        buy_after_viewing = line.split("'buy_after_viewing': [")
        if len(buy_after_viewing)>1:
            buy_after_viewing = buy_after_viewing[1].split("']")
            buy_after_viewing = buy_after_viewing[0].replace("'","")
            buy_after_viewing = buy_after_viewing.split(", ")
            meta_line['buy_after_viewing'] = buy_after_viewing
        else:
            meta_line['buy_after_viewing'] = []

        meta_data.append(meta_line)


review_data_df = pd.DataFrame.from_dict(review_data)
meta_data_df = pd.DataFrame.from_dict(meta_data)

#print(review_data_df.loc[0,:])
#print(meta_data_df.loc[0,:])

final_data_df = pd.merge(review_data_df, meta_data_df, on='asin', how='left')

print(final_data_df.loc[0,:])
print(final_data_df.count())

final_data_df.to_json(path_or_buf='C:/Spring 2019 Academics/Data Visualization/Project/Cellphones/final_Cell_Phones_and_Accessories.json',orient='records')











