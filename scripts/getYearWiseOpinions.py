import json
import os
count = 0
year = 2003
with open('E:\Windows\ASU\AmazonVis\data\unfiltered\year_features_5.json') as json_file:  
       data = json.load(json_file)
 
    # outfile.write("[")
for year in xrange(2003, 2015):
    with open('E:\Windows\ASU\AmazonVis\data\yearwise\\'+ str(year)+".json",'a+') as outfile:
    
         d =  json.dumps(data[str(year)]["__overall"]["opinions"])
         print d
        # d += "]}" 
        
        # json.dump(d.replace("\\", ""), outfile)

    # for d in data:
    #     if "Cell Phones" in d["categories"]:
    #             count = count + 1
    #             json.dump(d, outfile)
    #             outfile.write(",")
    # outfile.seek(-1, os.SEEK_END)
    # outfile.truncate()
    # outfile.write("]")
print count