import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import numpy as np
from connexion import get_db, orders_to_dataframe

# ── Configuration globale des graphiques ─────────────────────
plt.rcParams["figure.figsize"] = (12, 5)
plt.rcParams["font.family"]    = "DejaVu Sans"
sns.set_theme(style="whitegrid", palette="Blues_d")

# ── Connexion et chargement ───────────────────────────────────
db = get_db()
df = orders_to_dataframe(db)

# On garde uniquement les commandes livrées pour les analyses
df_delivered = df[df["status"] == "delivered"].copy()

print(f"\n📊 Commandes livrées : {len(df_delivered)}")
print(f"📊 Période : {df['date'].min().date()} → {df['date'].max().date()}")

# ════════════════════════════════════════════════════════════
# ANALYSE 1 — CA mensuel 2024
# ════════════════════════════════════════════════════════════
print("\n── Analyse 1 : CA mensuel 2024 ──")

df_2024 = df_delivered[df_delivered["year"] == 2024]

ca_monthly = df_2024.groupby("month")["total_amount"].sum().reset_index()
ca_monthly.columns = ["month", "revenue"]
ca_monthly["month_name"] = ca_monthly["month"].map({
    1:"Jan", 2:"Fév", 3:"Mar", 4:"Avr", 5:"Mai", 6:"Jun",
    7:"Jul", 8:"Aoû", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Déc"
})

fig, ax = plt.subplots()
bars = ax.bar(
    ca_monthly["month_name"],
    ca_monthly["revenue"],
    color="#2E75B6",
    edgecolor="white",
    linewidth=0.5
)

# Ajoute les valeurs sur chaque barre
for bar in bars:
    height = bar.get_height()
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        height * 1.01,
        f"{height/1e6:.1f}M",
        ha="center", va="bottom",
        fontsize=8, color="#333333"
    )

ax.set_title("Chiffre d'affaires mensuel — 2024", fontsize=14, fontweight="bold")
ax.set_xlabel("Mois")
ax.set_ylabel("CA (MAD)")
ax.yaxis.set_major_formatter(mticker.FuncFormatter(
    lambda x, _: f"{x/1e6:.0f}M"
))
plt.tight_layout()
plt.savefig("output/analyse1_ca_mensuel.png", dpi=150)
plt.show()
print("✅ Graphique 1 sauvegardé")

# ════════════════════════════════════════════════════════════
# ANALYSE 2 — Répartition des segments clients
# ════════════════════════════════════════════════════════════
print("\n── Analyse 2 : Segments clients ──")

segments = df_delivered.groupby("segment").agg(
    nb_clients   =("customer_id", "nunique"),
    nb_orders    =("order_id", "count"),
    total_revenue=("total_amount", "sum"),
    avg_basket   =("total_amount", "mean")
).reset_index()

print(segments.to_string(index=False))

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Donut — répartition clients
colors = ["#2E75B6", "#70A9D6", "#B8D4ED"]
wedges, texts, autotexts = axes[0].pie(
    segments["nb_clients"],
    labels=segments["segment"],
    autopct="%1.1f%%",
    colors=colors,
    wedgeprops={"width": 0.5},
    startangle=90
)
axes[0].set_title("Répartition des clients par segment", fontweight="bold")

# Barres — panier moyen par segment
axes[1].bar(
    segments["segment"],
    segments["avg_basket"],
    color=colors,
    edgecolor="white"
)
for i, (val, seg) in enumerate(zip(segments["avg_basket"], segments["segment"])):
    axes[1].text(i, val + 50, f"{val:,.0f} MAD",
                 ha="center", fontsize=9, fontweight="bold")

axes[1].set_title("Panier moyen par segment", fontweight="bold")
axes[1].set_ylabel("Panier moyen (MAD)")

plt.tight_layout()
plt.savefig("output/analyse2_segments.png", dpi=150)
plt.show()
print("✅ Graphique 2 sauvegardé")

# ════════════════════════════════════════════════════════════
# ANALYSE 3 — Analyse RFM complète avec scoring
# ════════════════════════════════════════════════════════════
print("\n── Analyse 3 : Scoring RFM ──")

today = pd.Timestamp.now()

rfm = df_delivered.groupby("customer_id").agg(
    recency  =("date", lambda x: (today - x.max()).days),
    frequency=("order_id", "count"),
    monetary =("total_amount", "sum")
).reset_index()

# Score de 1 à 5 pour chaque indicateur
# Récence : petit = bon → ordre inversé
rfm["R_score"] = pd.qcut(rfm["recency"],   q=5,
                          labels=[5,4,3,2,1], duplicates="drop")
rfm["F_score"] = pd.qcut(rfm["frequency"].rank(method="first"),
                          q=5, labels=[1,2,3,4,5])
rfm["M_score"] = pd.qcut(rfm["monetary"],  q=5,
                          labels=[1,2,3,4,5])

# Score RFM global (moyenne des 3 scores)
rfm["R_score"] = rfm["R_score"].astype(int)
rfm["F_score"] = rfm["F_score"].astype(int)
rfm["M_score"] = rfm["M_score"].astype(int)
rfm["RFM_score"] = (rfm["R_score"] +
                     rfm["F_score"] +
                     rfm["M_score"]) / 3

# Classification selon le score global
def classify_rfm(score):
    if score >= 4:   return "Champion"
    elif score >= 3: return "Fidèle"
    elif score >= 2: return "Potentiel"
    else:            return "A risque"

rfm["rfm_segment"] = rfm["RFM_score"].apply(classify_rfm)

print(rfm["rfm_segment"].value_counts())
print(f"\nScore RFM moyen : {rfm['RFM_score'].mean():.2f}")

# Visualisation
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Distribution des scores RFM
rfm["rfm_segment"].value_counts().plot(
    kind="bar", ax=axes[0],
    color=["#1A3F6F","#2E75B6","#70A9D6","#B8D4ED"],
    edgecolor="white"
)
axes[0].set_title("Distribution des segments RFM", fontweight="bold")
axes[0].set_xlabel("Segment")
axes[0].set_ylabel("Nombre de clients")
axes[0].tick_params(axis="x", rotation=0)

# Scatter — Fréquence vs Montant coloré par segment
colors_map = {
    "Champion":"#1A3F6F",
    "Fidèle":"#2E75B6",
    "Potentiel":"#70A9D6",
    "A risque":"#B8D4ED"
}
for seg, color in colors_map.items():
    mask = rfm["rfm_segment"] == seg
    axes[1].scatter(
        rfm[mask]["frequency"],
        rfm[mask]["monetary"],
        label=seg, alpha=0.6,
        color=color, s=20
    )

axes[1].set_title("Fréquence vs Montant par segment RFM", fontweight="bold")
axes[1].set_xlabel("Fréquence (nb commandes)")
axes[1].set_ylabel("Montant total (MAD)")
axes[1].legend()

plt.tight_layout()
plt.savefig("output/analyse3_rfm_scoring.png", dpi=150)
plt.show()
print("✅ Graphique 3 sauvegardé")

# ════════════════════════════════════════════════════════════
# ANALYSE 4 — Performance des villes
# ════════════════════════════════════════════════════════════
print("\n── Analyse 4 : Ventes par ville ──")

cities = df_delivered.groupby("city").agg(
    revenue   =("total_amount", "sum"),
    nb_orders =("order_id", "count"),
    avg_basket=("total_amount", "mean")
).reset_index().sort_values("revenue", ascending=False)

fig, ax = plt.subplots()
bars = ax.barh(
    cities["city"],
    cities["revenue"],
    color="#2E75B6",
    edgecolor="white"
)
ax.set_title("Chiffre d'affaires par ville", fontsize=14, fontweight="bold")
ax.set_xlabel("CA (MAD)")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(
    lambda x, _: f"{x/1e6:.0f}M"
))
ax.invert_yaxis()
plt.tight_layout()
plt.savefig("output/analyse4_villes.png", dpi=150)
plt.show()
print("✅ Graphique 4 sauvegardé")

# ════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ════════════════════════════════════════════════════════════
print("\n" + "="*50)
print("📊 RÉSUMÉ GLOBAL")
print("="*50)
print(f"CA total       : {df_delivered['total_amount'].sum():,.0f} MAD")
print(f"Nb commandes   : {len(df_delivered):,}")
print(f"Clients uniques: {df_delivered['customer_id'].nunique():,}")
print(f"Panier moyen   : {df_delivered['total_amount'].mean():,.0f} MAD")
print(f"Ville top      : {cities.iloc[0]['city']}")
print(f"Score RFM moyen: {rfm['RFM_score'].mean():.2f} / 5")
print("="*50)