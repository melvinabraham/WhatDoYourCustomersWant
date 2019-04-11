import json
import os
count = 0
with open('E:\Windows\ASU\AmazonVis\scripts\\final_Cell_Phones_and_Accessories.json') as json_file, open("E:\Windows\ASU\AmazonVis\scripts\\cellphones.json", "a") as outfile:  
    outfile.write("[")
    data = json.load(json_file)
    for d in data:
        if "Cell Phones" in d["categories"]:
                count = count + 1
                json.dump(d, outfile)
                outfile.write(",")
    outfile.seek(-1, os.SEEK_END)
    outfile.truncate()
    outfile.write("]")

print count