import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import sys

#get the training data set
df_train = pd.read_csv('./public/uploads/'+sys.argv[1])
df_train_all_num = (df_train.apply(lambda x: pd.factorize(x)[0]))


from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
#prepare training X, Y data set
train_y = df_train_all_num[sys.argv[3]]
#drop unused fields
train_x = df_train_all_num[sys.argv[2].split(",")]
#thit is how we get the feature importance with simple steps:
model.fit(train_x, train_y)
# display the relative importance of each attribute
importances = model.feature_importances_
#Sort it
sorted_feature_importance = sorted(zip(importances, list(train_x)), reverse=True)
d = {}
for i,j in sorted(zip(importances,list(train_x)),reverse=True):
    d[j]=i
print(d)
