import pandas as pd

p = pd.read_csv('data.csv', sep=';')
p.T.to_csv('planetss.csv', header=False)
print(p.T)