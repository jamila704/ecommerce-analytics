from pymongo import MongoClient
import pandas as pd

def get_db():
    """Connexion à MongoDB"""
    client = MongoClient("mongodb://localhost:27017")
    db = client["ecommerce"]
    print("✅ Connecté à MongoDB")
    return db

def orders_to_dataframe(db):
    """
    Récupère les commandes et les convertit en DataFrame Pandas.
    On extrait les champs imbriqués (customer, payment, delivery)
    pour les mettre à plat dans un tableau 2D.
    """
    orders = list(db.orders.find({}))

    # Extraction des champs imbriqués
    data = []
    for order in orders:
        data.append({
            # Champs principaux
            "order_id":      order.get("order_id"),
            "date":          order.get("date"),
            "status":        order.get("status"),

            # Champs client (embedded)
            "customer_id":   order["customer"]["customer_id"],
            "city":          order["customer"]["location"]["city"],
            "segment":       order["customer"]["segment"],

            # Champs paiement (embedded)
            "total_amount":  order["payment"]["total_amount"],

            # Champs livraison (embedded)
            "carrier":       order["delivery"]["carrier"],
            "estimated_days":order["delivery"]["estimated_days"],
            "actual_days":   order["delivery"].get("actual_days"),

            # Nombre d'articles
            "nb_items":      len(order.get("items", []))
        })

    df = pd.DataFrame(data)

    # Conversion de la date en format datetime
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.month
    df["year"]  = df["date"].dt.year

    print(f"✅ DataFrame créé : {len(df)} lignes, {len(df.columns)} colonnes")
    return df