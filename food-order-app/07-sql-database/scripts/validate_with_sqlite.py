#!/usr/bin/env python3
"""
Smoke-test the MySQL scripts in this repo using Python's built-in sqlite3.

This is NOT a substitute for running the scripts on MySQL 8. It mechanically
rewrites the few MySQL-only constructs (ENGINE/CHARSET clauses, AUTO_INCREMENT,
ON UPDATE, ENUM, KEY/UNIQUE KEY lines, functional unique indexes, CREATE DATABASE/USE),
then executes schema + seed + every query in SQLite with foreign keys enabled.
That checks that table and column names are consistent, foreign keys and CHECK
constraints hold for the seed data, the "one active row" unique indexes work, and
that every query runs and returns the results documented in queries/*.sql.

Usage: python3 scripts/validate_with_sqlite.py
"""
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def split_statements(sql):
    """Split a script on ';' outside quotes and comments; drops comments."""
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.S)
    sql = re.sub(r"(?m)^\s*--.*$", "", sql)
    stmts, buf, quote = [], [], None
    for ch in sql:
        if quote:
            buf.append(ch)
            if ch == quote:
                quote = None
        elif ch in "'\"`":
            quote = ch
            buf.append(ch)
        elif ch == ";":
            stmt = "".join(buf).strip()
            if stmt:
                stmts.append(stmt)
            buf = []
        else:
            buf.append(ch)
    tail = "".join(buf).strip()
    if tail:
        stmts.append(tail)
    return stmts


def translate_create_table(stmt, extra_indexes):
    """Rewrite one MySQL CREATE TABLE into SQLite; collect secondary indexes."""
    table = re.match(r"CREATE TABLE `(\w+)`", stmt).group(1)
    lines = stmt.splitlines()
    out = []
    for line in lines:
        s = line.strip()
        # trailing ") ENGINE=InnoDB ..." line
        if s.startswith(")") and "ENGINE" in s:
            out.append(")")
            continue
        # functional unique index:  UNIQUE KEY `n` ((expr)),
        m = re.match(r"UNIQUE KEY `(\w+)` \(\((.*)\)\),?$", s)
        if m:
            extra_indexes.append(f"CREATE UNIQUE INDEX `{m.group(1)}` ON `{table}` ({m.group(2)})")
            continue
        # plain unique key
        m = re.match(r"UNIQUE KEY `(\w+)` \((.*)\)(,?)$", s)
        if m:
            out.append(f"  UNIQUE ({m.group(2)}){m.group(3)}")
            continue
        # plain secondary key
        m = re.match(r"KEY `(\w+)` \((.*)\),?$", s)
        if m:
            extra_indexes.append(f"CREATE INDEX `{m.group(1)}` ON `{table}` ({m.group(2)})")
            continue
        if "`id` int NOT NULL AUTO_INCREMENT" in line:
            # SQLite only auto-assigns ids for INTEGER PRIMARY KEY columns
            out.append("  `id` INTEGER PRIMARY KEY AUTOINCREMENT,")
            continue
        if s.startswith("PRIMARY KEY (`id`)"):
            continue
        line = line.replace("ON UPDATE CURRENT_TIMESTAMP", "")
        m = re.search(r"`(\w+)` enum\((.*?)\)", line)
        if m:
            line = line.replace(m.group(0), f"`{m.group(1)}` text CHECK (`{m.group(1)}` IN ({m.group(2)}))")
        out.append(line)
    text = "\n".join(out)
    # a dropped trailing KEY/UNIQUE line may leave a dangling comma before ")"
    text = re.sub(r",\s*\n\)", "\n)", text)
    return text


def translate_schema(sql):
    stmts = []
    extra = []
    for s in split_statements(sql):
        up = s.upper()
        if up.startswith("CREATE DATABASE") or up.startswith("USE "):
            continue
        if up.startswith("CREATE TABLE"):
            stmts.append(translate_create_table(s, extra))
            continue
        stmts.append(s)
    # create indexes after all tables exist
    return stmts, extra


def run_script(con, sql):
    results = []
    for s in split_statements(sql):
        if s.upper().startswith("USE "):
            continue
        cur = con.execute(s)
        if cur.description:
            results.append((s, [d[0] for d in cur.description], cur.fetchall()))
    return results


def check(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        check.failed += 1


check.failed = 0


def main():
    con = sqlite3.connect(":memory:")
    con.execute("PRAGMA foreign_keys = ON")

    schema_sql = (ROOT / "schema/01_schema.sql").read_text()
    stmts, extra = translate_schema(schema_sql)
    for s in stmts + extra:
        con.execute(s)
    tables = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
    check(len(tables) == 13, f"schema creates 13 tables ({len(tables)} found)")

    run_script(con, (ROOT / "schema/02_seed_data.sql").read_text())
    con.commit()
    print("\nSeed data")
    fk_problems = con.execute("PRAGMA foreign_key_check").fetchall()
    check(not fk_problems, "no foreign-key violations")
    counts = {t: con.execute(f"SELECT COUNT(*) FROM `{t}`").fetchone()[0] for t in tables}
    expected = {"user": 3, "user_session": 3, "category": 15, "cuisine": 10, "restaurant": 10,
                "food_item": 20, "menu": 10, "menu_items": 25, "cart": 3, "cart_items": 8,
                "shipping_details": 3, "orders": 3, "order_items": 6}
    check(counts == expected, f"row counts match {expected}")
    check(all(len(r[0]) == 60 and r[0].startswith("$2b$") for r in con.execute("SELECT passwordHash FROM user")),
          "passwordHash values are 60-char bcrypt-shaped placeholders")
    check(con.execute("""SELECT COUNT(*) FROM cart c WHERE orderTotalPrice <>
                         (SELECT SUM(foodItemPrice*unitsInCart) FROM cart_items WHERE cartId=c.id)""").fetchone()[0] == 0,
          "every cart total equals the sum of its items")
    check(con.execute("""SELECT COUNT(*) FROM orders o WHERE orderTotalPrice <>
                         (SELECT SUM(foodItemPrice*unitsPurchased) FROM order_items WHERE orderId=o.id)""").fetchone()[0] == 0,
          "every order total equals the sum of its items")
    check(con.execute("""SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id=oi.orderId
                         JOIN menu m ON m.restaurantId=o.restaurantId JOIN menu_items mi
                         ON mi.menuId=m.id AND mi.foodItemId=oi.foodItemId
                         WHERE mi.foodItemPrice<>oi.foodItemPrice""").fetchone()[0] == 0,
          "order item prices match the restaurant's menu prices")

    print("\nConstraints")
    def must_fail(sql, msg):
        try:
            con.execute(sql)
            check(False, msg)
        except sqlite3.IntegrityError:
            check(True, msg)
        finally:
            con.rollback()
    must_fail("INSERT INTO menu (restaurantId) VALUES (1)", "second active menu for a restaurant is rejected")
    check(con.execute("UPDATE menu SET isActive=0 WHERE id=1").rowcount == 1, "menu can be deactivated")
    try:
        con.execute("INSERT INTO menu (restaurantId, isActive) VALUES (1, 0)")
        check(True, "multiple inactive menus per restaurant are allowed")
    except sqlite3.IntegrityError:
        check(False, "multiple inactive menus per restaurant are allowed")
    con.rollback()
    must_fail("INSERT INTO cart (userId, restaurantId) VALUES (1, 1)", "second active cart for a user is rejected")
    must_fail("INSERT INTO orders (userId, restaurantId, shippingDetailsId) VALUES (99, 1, 1)", "orders.userId foreign key enforced")
    must_fail("INSERT INTO orders (userId, restaurantId, shippingDetailsId, orderStatus) VALUES (1, 1, 1, 'LOST')", "orderStatus limited to allowed values")
    must_fail("INSERT INTO order_items (orderId, foodItemId, foodItemPrice, unitsPurchased) VALUES (1, 1, 5, 0)", "unitsPurchased must be > 0")

    print("\nQueries")
    ran = 0
    for qfile in sorted((ROOT / "queries").glob("*.sql")):
        for sql, cols, rows in run_script(con, qfile.read_text()):
            ran += 1
            label = f"{qfile.name} #{ran}"
            print(f"  {label}: {len(rows)} rows, columns {cols}")
            QUERY_RESULTS[(qfile.name, len(QUERY_RESULTS) % 100)] = (cols, rows)
    check(ran == 15, f"all 15 queries executed ({ran})")
    allr = list(QUERY_RESULTS.values())
    q = lambda i: allr[i][1]
    check(len(q(0)) == 10, "basic #1: 10 distinct cuisines")
    check(q(1) == [("Indulgent layers of moist cake, frosted with heavenly flavors and artistic designs.",)], "basic #2: Cake description")
    check(sorted(r[1] for r in q(2)) == ["Gourmet Junction", "Spice Junction"], "basic #3: two 'Junction' restaurants")
    check(len(q(3)) == 13, "basic #4: 13 vegetarian items")
    check(sorted(r[2] for r in q(4)) == ["Cabbage Roll", "Dal Fry", "Nutty Chicken Curry"], "basic #5: three items at <= $10")
    check(q(5) == [(1,)], "basic #6: cart 1 has the most items")
    check(sorted(r[2] for r in q(6)) == ["janedoe@example.com", "johndoe@example.com"], "basic #7: two 'doe' shipping emails")
    check(q(7)[0][0] == 1 and float(q(7)[0][3]) == 160, "basic #8: order 1 (160) is the most expensive")
    check(q(8)[0][0] == 1, "basic #9: order 1 is the most recently updated")
    check(q(9) == [(10,)], "basic #10: 10 units in order 1")
    check(sum(r[1] for r in q(10)) == 20 and len(q(10)) == 10, "joins #1: 10 cuisines, counts sum to 20 items")
    check(sum(r[1] for r in q(11)) == 20 and len(q(11)) == 15, "joins #2: 15 categories, counts sum to 20 items")
    check(sorted(r[1] for r in q(12)) == ["Chicken Alfredo", "Salmon Prawn Risotto", "Spicy Arrabiata Penne", "Veg Pizza"], "joins #3: four Italian items")
    check(len(q(13)) == 13 and all(r[1] == 1 for r in q(13)), "joins #4: 13 vegetarian rows")
    check([(r[0], float(r[4])) for r in q(14)] == [(1, 270.0), (2, 140.0), (3, 100.0)], "joins #5: cart totals 270 / 140 / 100")

    check(dict(q(10)) == {"American": 4, "Italian": 4, "Chinese": 3, "French": 2, "Indian": 2, "Greek": 1,
                          "Japanese": 1, "Mexican": 1, "Thai": 1, "Turkish": 1}, "joins #1: per-cuisine counts as documented")
    check(q(11)[0] == ("Curry", 3) and q(11)[-1] == ("Paneer", 0), "joins #2: Curry first (3), Paneer last (0)")

    print()
    if check.failed:
        print(f"{check.failed} check(s) FAILED")
        sys.exit(1)
    print("All checks passed (SQLite stand-in; MySQL 8 itself was not run).")


QUERY_RESULTS = {}

if __name__ == "__main__":
    main()
