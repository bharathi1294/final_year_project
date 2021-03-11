import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import sys
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

#get the training data set
df_train = pd.read_csv('./public/uploads/'+sys.argv[1])
df_train_all_num = (df_train.apply(lambda x: pd.factorize(x)[0]))
model = RandomForestClassifier()
X = df_train_all_num[sys.argv[2].split(",")]
y = df_train_all_num[sys.argv[3]]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
model = RandomForestClassifier()
model.fit(X,y)
score = model.score(X_train,y_train)
importances = model.feature_importances_
sorted_feature_importance = sorted(zip(importances, list(X_train)), reverse=True)
d = {}
for i,j in sorted(zip(importances,list(X_train)),reverse=True):
    d[j]=i
d['Score'] = score
print(d)
