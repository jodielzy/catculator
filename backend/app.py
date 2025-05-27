from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import os
import uuid
import random

app = Flask(__name__)
CORS(app)

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

# Generate a 6-digit room code
def generate_room_code():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

@app.route("/")
def home():
    return jsonify({"message": "App is running!"})


# 1. Create a new room
@app.route("/rooms", methods=["POST"])
def create_room():
    room_code = generate_room_code()
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO rooms (code) VALUES (%s) RETURNING id;", (room_code,))
                room_id = cur.fetchone()[0]
                return jsonify({"room_code": room_code, "room_id": room_id}), 201
    except Exception as e:
        print("Error in create_room:", str(e))
        return jsonify({"error": str(e)}), 500


# 2. Add a user to a room
@app.route("/rooms/<room_code>/users", methods=["POST"])
def add_user(room_code):
    name = request.json.get("name")
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM rooms WHERE code = %s", (room_code,))
                room = cur.fetchone()
                if not room:
                    return jsonify({"error": "Room not found"}), 404
                room_id = room[0]

                user_id = str(uuid.uuid4())
                cur.execute("INSERT INTO users (id, name, room_id) VALUES (%s, %s, %s);",
                            (user_id, name, room_id))
                conn.commit()
                return jsonify({"user_id": user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2b. Get all users in a room
@app.route("/rooms/<room_code>/users", methods=["GET"])
def get_users(room_code):
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM rooms WHERE code = %s", (room_code,))
                room = cur.fetchone()
                if not room:
                    return jsonify({"error": "Room not found"}), 404
                room_id = room[0]

                cur.execute("SELECT id, name FROM users WHERE room_id = %s", (room_id,))
                users = [{"id": row[0], "name": row[1]} for row in cur.fetchall()]
                return jsonify(users)
    except Exception as e:
        print("💥 Error in /users:", str(e))
        return jsonify({"error": str(e)}), 500


# 3. Add an expense to a room
@app.route("/rooms/<room_code>/expenses", methods=["POST"])
def add_expense(room_code):
    data = request.get_json()
    title = data.get("title")
    amount = data.get("amount")
    paid_by = data.get("paid_by")
    involved = data.get("involved")

    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM rooms WHERE code = %s", (room_code,))
                room = cur.fetchone()
                if not room:
                    return jsonify({"error": "Room not found"}), 404
                room_id = room[0]

                cur.execute("""
                    INSERT INTO expenses (title, amount, paid_by, room_id)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (title, amount, paid_by, room_id))
                expense_id = cur.fetchone()[0]

                share = round(amount / len(involved), 2)
                for uid in involved:
                    cur.execute("""
                        INSERT INTO expense_shares (expense_id, user_id, amount_owed)
                        VALUES (%s, %s, %s)
                    """, (expense_id, uid, share))

                conn.commit()
                return jsonify({"message": "Expense added", "expense_id": expense_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3b. Display all expenses
@app.route("/rooms/<room_code>/expenses", methods=["GET"])
def list_expenses(room_code):
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM rooms WHERE code = %s", (room_code,))
                room = cur.fetchone()
                if not room:
                    return jsonify({"error": "Room not found"}), 404
                room_id = room[0]

                cur.execute("""
                    SELECT id, title, amount, paid_by, created_at
                    FROM expenses
                    WHERE room_id = %s
                    ORDER BY created_at DESC;
                """, (room_id,))
                rows = cur.fetchall()
                return jsonify([
                    {
                        "id": r[0],
                        "title": r[1],
                        "amount": float(r[2]) if r[2] else 0.0,
                        "paid_by": r[3],
                        "created_at": r[4].isoformat() if r[4] else None
                    }
                    for r in rows
                ])
    except Exception as e:
        print("💥 Error in /expenses route:", str(e))
        return jsonify({"error": str(e)}), 500


# 4. Summary of balances
@app.route("/rooms/<room_code>/summary", methods=["GET"])
def get_summary(room_code):
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM rooms WHERE code = %s", (room_code,))
                room = cur.fetchone()
                if not room:
                    return jsonify({"error": "Room not found"}), 404
                room_id = room[0]

                cur.execute("""
                    SELECT es.user_id AS debtor, e.paid_by AS creditor, es.amount_owed
                    FROM expense_shares es
                    JOIN expenses e ON es.expense_id = e.id
                    WHERE e.room_id = %s
                """, (room_id,))

                balances = {}
                for debtor, creditor, amount in cur.fetchall():
                    if debtor == creditor:
                        continue
                    balances[debtor] = balances.get(debtor, 0) - amount
                    balances[creditor] = balances.get(creditor, 0) + amount

                debtors = []
                creditors = []

                for user_id, balance in balances.items():
                    if round(balance, 2) == 0:
                        continue
                    if balance < 0:
                        debtors.append([user_id, -balance])
                    else:
                        creditors.append([user_id, balance])

                result = []
                i, j = 0, 0
                while i < len(debtors) and j < len(creditors):
                    debtor_id, debt = debtors[i]
                    creditor_id, credit = creditors[j]

                    payment = min(debt, credit)
                    result.append({
                        "from": debtor_id,
                        "to": creditor_id,
                        "amount": round(payment, 2)
                    })

                    debtors[i][1] -= payment
                    creditors[j][1] -= payment

                    if debtors[i][1] == 0:
                        i += 1
                    if creditors[j][1] == 0:
                        j += 1

                return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 5. Delete an expense
@app.route("/expenses/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM expense_shares WHERE expense_id = %s", (expense_id,))
                cur.execute("DELETE FROM expenses WHERE id = %s", (expense_id,))
                conn.commit()
                return jsonify({"message": "Expense deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
